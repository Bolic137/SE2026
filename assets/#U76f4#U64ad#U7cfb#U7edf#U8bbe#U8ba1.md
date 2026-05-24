# 直播系统设计

## 1 直播架构

```
主播端(OBS/浏览器) --RTMP推流--> SRS服务器 --HTTP-FLV--> 观众端(flv.js播放器)
                                      ↑↓ HTTP API
                                  Spring Boot后端
                                      ↑↓ WebSocket
                                  观众端(弹幕/信令)
```

- 推流：RTMP协议（OBS原生支持，最稳定）
- 拉流：HTTP-FLV（flv.js纯JS解析，无需浏览器插件）
- 信令：WebSocket（Spring Boot内置支持）
- 管理：SRS HTTP API

## 2 直播间状态机

```
准备中(0) --主播开始推流--> 直播中(1) --主播结束推流/超时--> 已结束(2)
     ↑                                              |
     └──────────── 主播重新开播（创建新直播间）───────┘
```

- 准备中：已创建直播间，获取推流地址，等待推流
- 直播中：SRS检测到推流，通知后端，状态变更
- 已结束：主播主动结束或推流超时（30分钟无数据）

## 3 SRS配置

### 3.1 部署方式

单服务器部署，SRS与Spring Boot后端同机或内网通信。

```bash
# 使用Docker一键启动（最简单）
docker run -d --name srs -p 1935:1935 -p 8080:8080 -p 1985:1985   ossrs/srs:4 ./objs/srs -c conf/docker.conf
```

### 3.2 关键配置（srs.conf）

```conf
listen              1935;           # RTMP推流端口
max_connections     1000;

http_server {
    enabled         on;
    listen          8080;           # HTTP-FLV拉流端口
    dir             ./objs/nginx/html;
}

http_api {
    enabled         on;
    listen          1985;            # HTTP API端口
}

vhost __defaultVhost__ {
    http_remux {
        enabled     on;
        mount       [vhost]/[app]/[stream].flv;  # FLV输出
    }

    # 推流回调：推流开始/结束时通知后端
    publish {
        on_publish      http://backend:8080/api/live/callback/publish;
        on_unpublish    http://backend:8080/api/live/callback/unpublish;
    }
}
```

### 3.3 SRS HTTP API 调用

| 接口 | 方法 | 说明 |
|:---|:---|:---|
| `GET /api/v1/streams` | 查询流列表 | 获取所有活跃流 |
| `GET /api/v1/streams/{id}` | 查询单个流 | 获取流详细信息 |
| `DELETE /api/v1/clients/{id}` | 断开客户端 | 强制结束推流 |

## 4 后端直播模块设计

### 4.1 实体类

```java
@Data
@TableName("t_live_room")
public class LiveRoom {
    private Long id;
    private String title;
    private Long categoryId;
    private String cover;
    private String streamKey;      // 唯一流密钥
    private String pushUrl;        // rtmp://host/live/streamKey
    private String pullUrl;        // http://host:8080/live/streamKey.flv
    private Long anchorId;
    private Integer onlineCount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;        // 0准备中 1直播中 2已结束
}
```

### 4.2 Service 核心方法

```java
public interface LiveRoomService {
    // 创建直播间
    LiveRoom createRoom(LiveRoomDTO dto, Long anchorId);

    // 结束直播
    void endRoom(Long roomId, Long anchorId);

    // 获取直播间信息（观众进入）
    LiveRoomVO getRoomInfo(Long roomId);

    // 获取直播间列表
    PageResult<LiveRoomVO> listRooms(Integer categoryId, Integer page, Integer size);

    // SRS推流回调：开始推流
    void onPublish(String streamKey);

    // SRS推流回调：结束推流
    void onUnpublish(String streamKey);

    // 更新在线人数（WebSocket连接数）
    void updateOnlineCount(Long roomId, int delta);
}
```

### 4.3 创建直播间流程

```
主播点击"开播" → 填写表单 → POST /api/live/rooms
  ↓
后端：
  1. 生成唯一 streamKey = UUID.randomUUID().toString().replace("-", "")
  2. 拼接 pushUrl = "rtmp://srs-host/live/" + streamKey
  3. 拼接 pullUrl = "http://srs-host:8080/live/" + streamKey + ".flv"
  4. 插入 t_live_room，status=0
  5. 返回 {roomId, streamKey, pushUrl, pullUrl}
  ↓
前端显示推流地址，主播复制到OBS开始推流
```

### 4.4 推流回调处理

```java
@RestController
@RequestMapping("/api/live/callback")
public class LiveCallbackController {

    @PostMapping("/publish")
    public String onPublish(@RequestBody Map<String, String> params) {
        String streamKey = params.get("stream");
        liveRoomService.onPublish(streamKey);  // 更新status=1，记录startTime
        return "0";  // SRS要求返回"0"表示成功
    }

    @PostMapping("/unpublish")
    public String onUnpublish(@RequestBody Map<String, String> params) {
        String streamKey = params.get("stream");
        liveRoomService.onUnpublish(streamKey);  // 更新status=2，记录endTime
        return "0";
    }
}
```

### 4.5 结束直播

```
主播点击"结束直播" → POST /api/live/rooms/{id}/end
  ↓
后端：
  1. 校验主播身份
  2. 更新 t_live_room status=2, endTime=now
  3. 可选：调SRS API断开推流（若主播未手动停OBS）
  4. 关闭该房间所有WebSocket连接
  5. 清理Redis中该房间在线人数缓存
```

## 5 WebSocket 弹幕/信令设计

### 5.1 连接建立

```
观众进入直播间 → 前端：new WebSocket("ws://host/ws/live/{roomId}")
  ↓
后端WebSocketHandler：
  1. 从URL解析roomId
  2. 从请求头获取token，校验用户身份（游客允许连接但限制发言）
  3. 将Session加入roomId对应的Session集合
  4. onlineCount++，广播 {"type":"system","content":"xxx进入了直播间"}
  5. 返回 {"type":"join_ack","onlineCount":123}
```

### 5.2 消息协议（JSON）

**客户端 → 服务器：**

| type | 说明 | 字段 |
|:---|:---|:---|
| `join` | 进入房间 | `{type:"join", roomId:1}` |
| `danmaku` | 发送弹幕 | `{type:"danmaku", content:"...", color:"#FFFFFF", position:0}` |
| `heartbeat` | 心跳保活 | `{type:"heartbeat"}` |
| `leave` | 离开房间 | `{type:"leave", roomId:1}` |

**服务器 → 客户端：**

| type | 说明 | 字段 |
|:---|:---|:---|
| `join_ack` | 进入确认 | `{type:"join_ack", onlineCount:123}` |
| `danmaku` | 弹幕广播 | `{type:"danmaku", content:"...", color:"#FFF", username:"xxx", userId:1}` |
| `system` | 系统消息 | `{type:"system", content:"xxx进入了直播间"}` |
| `online` | 人数更新 | `{type:"online", count:124}` |
| `error` | 错误提示 | `{type:"error", message:"发送过于频繁"}` |

### 5.3 WebSocketHandler 核心代码

```java
@Component
public class LiveWebSocketHandler extends TextWebSocketHandler {

    // roomId -> Set<WebSocketSession>
    private Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long roomId = extractRoomId(session);
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

        // 更新在线人数
        int count = roomSessions.get(roomId).size();
        broadcast(roomId, buildMsg("online", count));
        broadcast(roomId, buildMsg("system", "有人进入了直播间"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        JSONObject json = JSONUtil.parseObj(message.getPayload());
        String type = json.getStr("type");
        Long roomId = extractRoomId(session);

        switch (type) {
            case "danmaku":
                handleDanmaku(session, roomId, json);
                break;
            case "heartbeat":
                // 无需处理，连接保活
                break;
        }
    }

    private void handleDanmaku(WebSocketSession session, Long roomId, JSONObject json) {
        // 1. 频率限制：同一用户1秒内只能发1条
        // 2. 敏感词过滤：查询t_sensitive_word替换/屏蔽
        // 3. 保存到数据库t_danmaku（异步，不阻塞广播）
        // 4. 广播给房间所有用户
        String content = filterSensitive(json.getStr("content"));
        JSONObject msg = new JSONObject()
            .set("type", "danmaku")
            .set("content", content)
            .set("color", json.getStr("color", "#FFFFFF"))
            .set("username", getUsername(session))
            .set("userId", getUserId(session));

        broadcast(roomId, msg.toString());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long roomId = extractRoomId(session);
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            sessions.remove(session);
            int count = sessions.size();
            broadcast(roomId, buildMsg("online", count));
        }
    }

    private void broadcast(Long roomId, String message) {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            for (WebSocketSession s : sessions) {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(message));
                }
            }
        }
    }
}
```

### 5.4 WebSocket 配置

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private LiveWebSocketHandler liveWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveWebSocketHandler, "/ws/live/{roomId}")
                .setAllowedOrigins("*");  // 生产环境需限制域名
    }
}
```

## 6 前端直播间页面交互

### 6.1 生命周期

```javascript
// 页面加载
onMounted(() => {
  fetchRoomInfo();      // GET /api/live/rooms/:roomId
  initFlvPlayer();      // flv.js创建播放器，拉取pullUrl
  connectWebSocket();   // 建立WebSocket连接
});

// 页面卸载
onBeforeUnmount(() => {
  ws.close();           // 关闭WebSocket
  flvPlayer.destroy();  // 销毁播放器
});
```

### 6.2 flv.js 播放器初始化

```javascript
import flvjs from 'flv.js';

function initFlvPlayer() {
  if (flvjs.isSupported()) {
    const videoElement = document.getElementById('live-video');
    flvPlayer = flvjs.createPlayer({
      type: 'flv',
      url: roomInfo.value.pullUrl,  // http://srs-host:8080/live/streamKey.flv
      isLive: true,
      hasAudio: true,
      hasVideo: true
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();

    // 断线自动重连
    flvPlayer.on(flvjs.Events.ERROR, () => {
      setTimeout(() => initFlvPlayer(), 3000);
    });
  }
}
```

### 6.3 WebSocket 交互

```javascript
function connectWebSocket() {
  ws = new WebSocket(`ws://host/ws/live/${roomId}`);

  ws.onopen = () => {
    ws.send(JSON.stringify({type: 'join', roomId}));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    switch(msg.type) {
      case 'danmaku':
        chatMessages.value.push(msg);      // 聊天区显示
        danmakuLayer.value.addDanmaku(msg); // 播放器弹幕层显示
        break;
      case 'online':
        onlineCount.value = msg.count;
        break;
      case 'system':
        chatMessages.value.push({...msg, isSystem: true});
        break;
    }
  };

  // 心跳保活（30秒）
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({type: 'heartbeat'}));
    }
  }, 30000);
}

function sendDanmaku() {
  if (!inputContent.value.trim()) return;
  ws.send(JSON.stringify({
    type: 'danmaku',
    content: inputContent.value,
    color: selectedColor.value,
    position: selectedPosition.value
  }));
  inputContent.value = '';
}
```

## 7 直播列表与发现

### 7.1 直播列表 API

```
GET /api/live/rooms?page=1&size=20&categoryId=0

Response:
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "直播间标题",
        "cover": "http://...",
        "anchorName": "主播昵称",
        "anchorAvatar": "http://...",
        "onlineCount": 123,
        "categoryName": "游戏直播"
      }
    ],
    "total": 100
  }
}
```

### 7.2 首页直播入口

在首页 VideoGrid 中，直播卡片与视频卡片样式一致，但左上角显示红色"LIVE"标签，实时显示在线人数。

## 8 异常处理

| 场景 | 处理 |
|:---|:---|
| 主播OBS未正常关闭 | SRS 30秒超时自动触发 on_unpublish 回调 |
| 观众网络断开 | WebSocket 自动重连（最多3次），重连失败提示刷新 |
| 推流地址泄露 | streamKey 足够随机（UUID），有效期与直播间绑定 |
| 弹幕发送过快 | 后端频率限制：1秒1条，超限返回 error 消息 |
| 直播间已满 | SRS max_connections 限制，超出拒绝连接 |
| 主播被封禁 | 创建直播间时校验用户状态，封禁用户禁止开播 |

## 9 简化说明

| 未实现功能 | 原因 |
|:---|:---|
| 直播回放录制 | 需SRS录制+文件存储，课程周期不够 |
| 直播连麦 | WebRTC复杂度太高，5人团队难以实现 |
| 礼物打赏系统 | 涉及支付，课程作业不需要 |
| 多码率自适应 | SRS支持，但flv.js需额外配置，固定码率够用 |
| 直播弹幕历史 | 直播弹幕不持久化，只看实时（视频弹幕才持久化） |
