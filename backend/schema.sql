CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  user_type SMALLINT DEFAULT 0,
  status SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type SMALLINT DEFAULT 0,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(120) NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  cover_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  duration INT DEFAULT 0,
  category_id INT REFERENCES categories(id),
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  uploader_id UUID REFERENCES users(id),
  audit_status SMALLINT DEFAULT 0,
  status SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  video_id UUID REFERENCES videos(id),
  parent_id UUID NULL,
  like_count INT DEFAULT 0,
  is_top BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS danmaku (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  color VARCHAR(20) DEFAULT '#FFFFFF',
  position SMALLINT DEFAULT 0,
  user_id UUID REFERENCES users(id),
  target_id UUID NOT NULL,
  target_type SMALLINT DEFAULT 0,
  video_time INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(120) NOT NULL,
  category_id INT REFERENCES categories(id),
  cover TEXT DEFAULT '',
  stream_key VARCHAR(80) UNIQUE NOT NULL,
  push_url TEXT DEFAULT '',
  pull_url TEXT DEFAULT '',
  anchor_id UUID REFERENCES users(id),
  online_count INT DEFAULT 0,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ NULL,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
