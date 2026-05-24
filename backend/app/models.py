from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=False)
    avatar = Column(Text, default='')
    bio = Column(Text, default='')
    user_type = Column(SmallInteger, default=0)  # 0普通，1创作者，2管理员
    status = Column(SmallInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    type = Column(SmallInteger, default=0)  # 0视频，1直播
    sort_order = Column(Integer, default=0)

class Video(Base):
    __tablename__ = 'videos'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(120), nullable=False)
    description = Column(Text, default='')
    tags = Column(ARRAY(String), default=list)
    cover_url = Column(Text, default='')
    video_url = Column(Text, default='')
    duration = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey('categories.id'))
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    favorite_count = Column(Integer, default=0)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    audit_status = Column(SmallInteger, default=0)  # 0待审核，1通过，2驳回
    status = Column(SmallInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    uploader = relationship('User')
    category = relationship('Category')

class Comment(Base):
    __tablename__ = 'comments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    video_id = Column(UUID(as_uuid=True), ForeignKey('videos.id'))
    parent_id = Column(UUID(as_uuid=True), nullable=True)
    like_count = Column(Integer, default=0)
    is_top = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User')

class Danmaku(Base):
    __tablename__ = 'danmaku'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    color = Column(String(20), default='#FFFFFF')
    position = Column(SmallInteger, default=0)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    target_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(SmallInteger, default=0)  # 0视频，1直播
    video_time = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User')

class LiveRoom(Base):
    __tablename__ = 'live_rooms'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(120), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    cover = Column(Text, default='')
    stream_key = Column(String(80), unique=True, nullable=False)
    push_url = Column(Text, default='')
    pull_url = Column(Text, default='')
    anchor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    online_count = Column(Integer, default=0)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(SmallInteger, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    anchor = relationship('User')
    category = relationship('Category')
