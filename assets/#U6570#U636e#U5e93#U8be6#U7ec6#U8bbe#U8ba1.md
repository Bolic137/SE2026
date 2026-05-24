# 数据库详细设计

## 1 设计规范

- 字符集：UTF-8mb4，排序规则 utf8mb4_unicode_ci
- 表名：t_前缀 + 小写下划线，如 t_user
- 字段名：小写下划线，如 create_time
- 主键：BIGINT 自增，名 id
- 时间字段：create_time / update_time，DATETIME，默认 CURRENT_TIMESTAMP
- 软删除：is_deleted TINYINT(1) 默认 0，逻辑删除
- 状态字段：TINYINT + 代码枚举映射，不用 MySQL ENUM（扩展性差）
- 索引命名：idx_字段名 或 uk_字段名（唯一）

## 2 数据表清单

共 16 张表：

| 序号 | 表名 | 说明 |
|:---:|:---|:---|
| 1 | t_user | 用户表 |
| 2 | t_user_interest | 用户兴趣标签 |
| 3 | t_category | 分类表 |
| 4 | t_video | 视频表 |
| 5 | t_video_like | 视频点赞记录 |
| 6 | t_video_favorite | 视频收藏记录 |
| 7 | t_video_history | 观看历史 |
| 8 | t_comment | 评论表 |
| 9 | t_follow | 关注关系 |
| 10 | t_live_room | 直播间 |
| 11 | t_danmaku | 弹幕表 |
| 12 | t_message | 私信表 |
| 13 | t_notification | 系统通知 |
| 14 | t_sensitive_word | 敏感词 |
| 15 | t_admin | 管理员表 |
| 16 | t_video_report | 视频举报 |

## 3 表结构定义

### 3.1 t_user（用户表）

```sql
CREATE TABLE t_user (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    account         VARCHAR(64) NOT NULL COMMENT '账号（手机号/邮箱）',
    password        VARCHAR(128) NOT NULL COMMENT '加密密码（BCrypt）',
    nickname        VARCHAR(32) NOT NULL DEFAULT '' COMMENT '昵称',
    avatar          VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像URL',
    bio             VARCHAR(200) NOT NULL DEFAULT '' COMMENT '个人简介',
    user_type       TINYINT NOT NULL DEFAULT 0 COMMENT '用户类型：0普通 1创作者',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0正常 1封禁',
    register_time   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_account (account),
    KEY idx_nickname (nickname),
    KEY idx_user_type (user_type),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 3.2 t_user_interest（用户兴趣标签）

```sql
CREATE TABLE t_user_interest (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL COMMENT '用户ID',
    tag         VARCHAR(32) NOT NULL COMMENT '标签名',
    score       INT NOT NULL DEFAULT 0 COMMENT '兴趣分数（观看/点赞累加）',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_tag (user_id, tag),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户兴趣标签';
```

### 3.3 t_category（分类表）

```sql
CREATE TABLE t_category (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(32) NOT NULL COMMENT '分类名称',
    type        TINYINT NOT NULL DEFAULT 0 COMMENT '类型：0视频 1直播',
    sort_order  INT NOT NULL DEFAULT 0 COMMENT '排序',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_name_type (name, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';
```

### 3.4 t_video（视频表）

```sql
CREATE TABLE t_video (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '视频ID',
    title           VARCHAR(128) NOT NULL COMMENT '标题',
    description     TEXT COMMENT '描述',
    tags            VARCHAR(255) NOT NULL DEFAULT '' COMMENT '标签（逗号分隔）',
    cover_url       VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面URL',
    video_url       VARCHAR(500) NOT NULL DEFAULT '' COMMENT '视频URL（JSON：{"480p":"url","720p":"url","1080p":"url"}）',
    duration        INT NOT NULL DEFAULT 0 COMMENT '时长（秒）',
    category_id     BIGINT NOT NULL DEFAULT 0 COMMENT '分类ID',
    view_count      INT NOT NULL DEFAULT 0 COMMENT '播放量',
    like_count      INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    comment_count   INT NOT NULL DEFAULT 0 COMMENT '评论数',
    favorite_count  INT NOT NULL DEFAULT 0 COMMENT '收藏数',
    uploader_id     BIGINT NOT NULL COMMENT '上传者ID',
    upload_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    audit_status    TINYINT NOT NULL DEFAULT 0 COMMENT '审核状态：0待审核 1已通过 2未通过',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0正常 1隐藏 2删除',
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_category (category_id),
    KEY idx_uploader (uploader_id),
    KEY idx_audit_status (audit_status),
    KEY idx_status (status),
    KEY idx_upload_time (upload_time),
    FULLTEXT KEY ft_title_tags (title, tags) COMMENT '标题标签全文索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';
```

### 3.5 t_video_like（视频点赞记录）

```sql
CREATE TABLE t_video_like (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id    BIGINT NOT NULL COMMENT '视频ID',
    user_id     BIGINT NOT NULL COMMENT '用户ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_video_user (video_id, user_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频点赞记录';
```

### 3.6 t_video_favorite（视频收藏记录）

```sql
CREATE TABLE t_video_favorite (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id    BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_video_user (video_id, user_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频收藏记录';
```

### 3.7 t_video_history（观看历史）

```sql
CREATE TABLE t_video_history (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    video_id    BIGINT NOT NULL,
    progress    INT NOT NULL DEFAULT 0 COMMENT '观看进度（秒）',
    watch_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '观看时间',
    UNIQUE KEY uk_user_video (user_id, video_id),
    KEY idx_user_time (user_id, watch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='观看历史';
```

### 3.8 t_comment（评论表）

```sql
CREATE TABLE t_comment (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    content     TEXT NOT NULL COMMENT '评论内容',
    user_id     BIGINT NOT NULL COMMENT '评论者ID',
    video_id    BIGINT NOT NULL COMMENT '视频ID',
    parent_id   BIGINT NOT NULL DEFAULT 0 COMMENT '父评论ID（0为顶层评论）',
    like_count  INT NOT NULL DEFAULT 0,
    is_top      TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
    is_deleted  TINYINT(1) NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_video_id (video_id),
    KEY idx_user_id (user_id),
    KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

### 3.9 t_follow（关注关系）

```sql
CREATE TABLE t_follow (
    follower_id     BIGINT NOT NULL COMMENT '关注者ID',
    following_id    BIGINT NOT NULL COMMENT '被关注者ID',
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    KEY idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系';
```

### 3.10 t_live_room（直播间）

```sql
CREATE TABLE t_live_room (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '直播间ID',
    title           VARCHAR(128) NOT NULL COMMENT '直播间标题',
    category_id     BIGINT NOT NULL DEFAULT 0 COMMENT '分类ID',
    cover           VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面URL',
    stream_key      VARCHAR(64) NOT NULL COMMENT '流密钥（唯一）',
    push_url        VARCHAR(255) NOT NULL DEFAULT '' COMMENT '推流地址',
    pull_url        VARCHAR(255) NOT NULL DEFAULT '' COMMENT '拉流地址',
    anchor_id       BIGINT NOT NULL COMMENT '主播ID',
    online_count    INT NOT NULL DEFAULT 0 COMMENT '在线人数',
    start_time      DATETIME COMMENT '开始时间',
    end_time        DATETIME COMMENT '结束时间',
    status          TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0准备中 1直播中 2已结束',
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
    create_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_stream_key (stream_key),
    KEY idx_anchor (anchor_id),
    KEY idx_status (status),
    KEY idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='直播间';
```

### 3.11 t_danmaku（弹幕表）

```sql
CREATE TABLE t_danmaku (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    content     VARCHAR(100) NOT NULL COMMENT '弹幕内容',
    color       VARCHAR(10) NOT NULL DEFAULT '#FFFFFF' COMMENT '颜色',
    position    TINYINT NOT NULL DEFAULT 0 COMMENT '位置：0滚动 1顶部 2底部',
    user_id     BIGINT NOT NULL COMMENT '发送者ID',
    target_id   BIGINT NOT NULL COMMENT '目标ID（视频ID或直播间ID）',
    target_type TINYINT NOT NULL DEFAULT 0 COMMENT '目标类型：0视频 1直播',
    send_time   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    video_time  INT NOT NULL DEFAULT 0 COMMENT '视频时间点（秒，视频弹幕用）',
    KEY idx_target (target_id, target_type),
    KEY idx_send_time (send_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='弹幕表';
```

### 3.12 t_message（私信表）

```sql
CREATE TABLE t_message (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id   BIGINT NOT NULL COMMENT '发送者ID',
    receiver_id BIGINT NOT NULL COMMENT '接收者ID',
    content     TEXT NOT NULL COMMENT '内容',
    is_read     TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_sender (sender_id),
    KEY idx_receiver (receiver_id),
    KEY idx_receiver_time (receiver_id, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私信表';
```

### 3.13 t_notification（系统通知）

```sql
CREATE TABLE t_notification (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL COMMENT '接收用户ID',
    type        TINYINT NOT NULL DEFAULT 0 COMMENT '类型：0系统 1关注 2点赞 3评论',
    title       VARCHAR(64) NOT NULL COMMENT '标题',
    content     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '内容',
    related_id  BIGINT NOT NULL DEFAULT 0 COMMENT '关联ID（视频/用户ID）',
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_read (user_id, is_read),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知';
```

### 3.14 t_sensitive_word（敏感词）

```sql
CREATE TABLE t_sensitive_word (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    word        VARCHAR(32) NOT NULL COMMENT '敏感词',
    level       TINYINT NOT NULL DEFAULT 1 COMMENT '等级：1替换 2屏蔽 3禁止发送',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敏感词';
```

### 3.15 t_admin（管理员表）

```sql
CREATE TABLE t_admin (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(32) NOT NULL COMMENT '管理员账号',
    password    VARCHAR(128) NOT NULL COMMENT '密码',
    role        TINYINT NOT NULL DEFAULT 0 COMMENT '角色：0超级管理员 1审核员 2运营',
    status      TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0正常 1禁用',
    last_login  DATETIME COMMENT '最后登录时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';
```

### 3.16 t_video_report（视频举报）

```sql
CREATE TABLE t_video_report (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id    BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL COMMENT '举报者ID',
    reason      VARCHAR(255) NOT NULL COMMENT '举报原因',
    status      TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待处理 1已处理 2驳回',
    handle_note VARCHAR(255) DEFAULT '' COMMENT '处理备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_video_id (video_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频举报';
```

## 4 初始化数据

```sql
-- 分类数据
INSERT INTO t_category (name, type, sort_order) VALUES
('游戏', 0, 1), ('音乐', 0, 2), ('影视', 0, 3), ('科技', 0, 4), ('生活', 0, 5),
('游戏直播', 1, 1), ('娱乐直播', 1, 2), ('学习直播', 1, 3);

-- 敏感词示例
INSERT INTO t_sensitive_word (word, level) VALUES
('脏话1', 1), ('脏话2', 2), ('违禁词', 3);

-- 管理员账号（密码需BCrypt加密后插入）
INSERT INTO t_admin (username, password, role) VALUES
('admin', '$2a$10$...', 0);
```

## 5 ER关系图（文字描述）

```
t_user 1 ──── N t_video (uploader_id)
t_user 1 ──── N t_live_room (anchor_id)
t_user 1 ──── N t_comment (user_id)
t_user 1 ──── N t_message (sender_id/receiver_id)
t_user 1 ──── N t_notification (user_id)
t_user 1 ──── N t_user_interest (user_id)
t_user N ──── M t_user (t_follow 关注关系)
t_user 1 ──── N t_video_like (user_id)
t_user 1 ──── N t_video_favorite (user_id)
t_user 1 ──── N t_video_history (user_id)
t_user 1 ──── N t_video_report (reporter_id)

t_video 1 ──── N t_comment (video_id)
t_video 1 ──── N t_video_like (video_id)
t_video 1 ──── N t_video_favorite (video_id)
t_video 1 ──── N t_video_history (video_id)
t_video 1 ──── N t_video_report (video_id)
t_video 1 ──── N t_danmaku (target_id where target_type=0)

t_live_room 1 ──── N t_danmaku (target_id where target_type=1)
t_category 1 ──── N t_video (category_id)
t_category 1 ──── N t_live_room (category_id)
```

## 6 关键查询场景与索引覆盖

| 查询场景 | 索引 |
|:---|:---|
| 用户登录 | uk_account |
| 首页推荐（按时间倒序+审核通过） | idx_audit_status + idx_upload_time |
| 视频搜索（标题标签全文检索） | FULLTEXT ft_title_tags |
| 用户视频列表 | idx_uploader |
| 视频评论列表 | idx_video_id |
| 直播间列表（按状态） | idx_status |
| 用户观看历史 | idx_user_time |
| 用户未读通知 | idx_user_read |
| 弹幕查询（视频/直播） | idx_target |
| 关注关系判断 | PRIMARY KEY (follower_id, following_id) |
