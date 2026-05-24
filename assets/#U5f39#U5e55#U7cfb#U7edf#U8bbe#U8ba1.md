# 弹幕系统设计

## 1 设计原则

- 视频弹幕持久化，直播弹幕仅实时（不存库或仅存最近100条）
- 视频弹幕按时间点定位，直播弹幕纯实时广播
- 敏感词过滤在服务端完成，前端只做展示
- 频率限制防刷，1秒1条

## 2 弹幕类型区分

| 类型 | 存储 | 展示 | 说明 |
|:---|:---|:---|:---|
| 视频弹幕 | MySQL t_danmaku | DPlayer弹幕层 | 按video_time定位，可查询历史 |
| 直播弹幕 | 可选Redis(最近100条) | 聊天区+播放器层 | 实时广播，不持久化或短期保留 |

## 3 数据库设计（视频弹幕）

表：`t_danmaku`

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | BIGINT PK | 弹幕ID |
| content | VARCHAR(100) | 内容（限制100字） |
| color | VARCHAR(10) | 颜色，默认#FFFFFF |
| position | TINYINT | 0滚动 1顶部 2底部 |
| user_id | BIGINT | 发送者 |
| target_id | BIGINT | 视频ID或直播间ID |
| target_type | TINYINT | 0视频 1直播 |
| send_time | DATETIME | 发送时间 |
| video_time | INT | 视频时间点（秒），视频弹幕用 |

索引：`idx_target(target_id, target_type)`，`idx_send_time(send_time)`

## 4 视频弹幕流程

### 4.1 发送弹幕

```
用户在播放页输入弹幕 → 前端校验(长度≤100) → POST /api/danmaku
  ↓
后端：
  1. 校验登录（游客禁止发送）
  2. 频率限制：Redis incr user:{userId}:danmaku:count TTL=1s，>1则拒绝
  3. 敏感词过滤：查询t_sensitive_word，替换/屏蔽/拒绝
  4. 插入t_danmaku
  5. 返回成功
  6. 同视频其他在线用户：通过WebSocket推送（可选，视频页人少时可用轮询）
```

### 4.2 获取弹幕

```
播放器加载 → GET /api/danmaku?videoId=x&targetType=0
  ↓
后端：查询t_danmaku，返回列表
  ↓
前端：DPlayer加载弹幕列表，按video_time定位显示
```

### 4.3 DPlayer弹幕格式

```javascript
{
  text: '弹幕内容',
  color: '#FFFFFF',
  type: 'right',  // right滚动 top顶部 bottom底部
  time: 5.2       // 视频时间点（秒）
}
```

## 5 直播弹幕流程

直播弹幕在直播系统设计中已覆盖，此处补充弹幕专用设计：

### 5.1 直播弹幕消息格式

```json
// 客户端发送
{
  "type": "danmaku",
  "content": "弹幕内容",
  "color": "#FF0000",
  "position": 0
}

// 服务器广播
{
  "type": "danmaku",
  "content": "过滤后的内容",
  "color": "#FF0000",
  "position": 0,
  "username": "发送者昵称",
  "userId": 123
}
```

### 5.2 弹幕显示位置

| position | 说明 | 前端处理 |
|:---:|:---|:---|
| 0 | 滚动 | DPlayer/自定义Canvas从右向左滚动 |
| 1 | 顶部 | 固定显示在视频顶部，3秒后消失 |
| 2 | 底部 | 固定显示在视频底部，3秒后消失 |

## 6 敏感词过滤

### 6.1 过滤策略

| level | 处理 | 示例 |
|:---:|:---|:---|
| 1 | 替换为* | "脏话" → "**" |
| 2 | 整句屏蔽（返回空） | 整句不显示 |
| 3 | 拒绝发送 | 返回错误提示 |

### 6.2 实现方式

```java
@Service
public class SensitiveWordService {

    @Autowired
    private SensitiveWordMapper mapper;

    // 应用启动时加载到内存
    private List<SensitiveWord> wordList;

    @PostConstruct
    public void load() {
        wordList = mapper.selectList(null);
    }

    public String filter(String content) {
        for (SensitiveWord word : wordList) {
            if (content.contains(word.getWord())) {
                switch (word.getLevel()) {
                    case 1: // 替换
                        content = content.replace(word.getWord(), "*".repeat(word.getWord().length()));
                        break;
                    case 2: // 屏蔽整句
                        return "";
                    case 3: // 拒绝
                        throw new BizException("内容包含敏感词");
                }
            }
        }
        return content;
    }
}
```

### 6.3 管理后台

- 管理员可在 `/admin` 敏感词管理页面增删改敏感词
- 修改后调用 `SensitiveWordService.reload()` 热更新

## 7 频率限制

```java
@Service
public class DanmakuLimitService {

    @Autowired
    private StringRedisTemplate redis;

    public boolean checkLimit(Long userId) {
        String key = "danmaku:limit:" + userId;
        Long count = redis.opsForValue().increment(key);
        if (count == 1) {
            redis.expire(key, 1, TimeUnit.SECONDS);
        }
        return count <= 1;  // 1秒内只能发1条
    }
}
```

## 8 弹幕密度控制（可选）

视频弹幕过多时，前端抽样显示：

```javascript
// DPlayer配置
{
  danmaku: {
    maximum: 1000,      // 同屏最大弹幕数
    speed: 5,           // 滚动速度
    opacity: 0.8,       // 透明度
    // 当弹幕密度过高时，按时间均匀抽样显示
  }
}
```

## 9 API 接口

| 接口 | 方法 | 说明 |
|:---|:---|:---|
| `POST /api/danmaku` | 发送弹幕 | body: {videoId, content, color, position, videoTime} |
| `GET /api/danmaku?videoId=x&targetType=0` | 获取视频弹幕 | 返回弹幕列表 |
| `GET /api/danmaku/recent?roomId=x` | 获取直播最近弹幕 | 返回最近50条（Redis） |

## 10 简化说明

| 未实现 | 原因 |
|:---|:---|
| 弹幕举报 | 评论举报已覆盖，弹幕举报可复用 |
| 弹幕点赞 | 课程周期不够 |
| 高级弹幕（彩色/图片/定位） | 纯文本弹幕足够演示 |
| 弹幕云屏蔽（用户自定义屏蔽） | 课程作业不需要 |
| 弹幕数据分析 | 创作者中心可后续扩展 |
