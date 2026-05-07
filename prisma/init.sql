-- =========================================
-- OA 系统数据库初始化脚本
-- =========================================

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建表结构
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  department_id UUID REFERENCES departments(id),
  position VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  type VARCHAR(20) NOT NULL CHECK (type IN ('morning', 'afternoon', 'evening', 'off')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shift_id UUID REFERENCES shifts(id) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('checkin', 'checkout')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'invalid', 'late', 'early')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('leave', 'overtime', 'business_trip', 'other')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES approval_requests(id) NOT NULL,
  approver_id UUID REFERENCES users(id) NOT NULL,
  step_number INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comment TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 插入初始班次数据
INSERT INTO shifts (id, name, start_time, end_time, color, type) VALUES
('550e8400-e29b-41d4-a716-446655440000', '早班', '08:00:00', '12:00:00', '#10B981', 'morning'),
('550e8400-e29b-41d4-a716-446655440001', '中班', '12:00:00', '18:00:00', '#F59E0B', 'afternoon'),
('550e8400-e29b-41d4-a716-446655440002', '晚班', '18:00:00', '22:00:00', '#EF4444', 'evening'),
('550e8400-e29b-41d4-a716-446655440003', '休息', '00:00:00', '00:00:00', '#9CA3AF', 'off')
ON CONFLICT (id) DO NOTHING;

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_timestamp ON checkins(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_approval_requests_user_status ON approval_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_request_id ON approval_steps(request_id);

-- =========================================
-- Supabase Auth 触发器 - 自动同步用户
-- =========================================

-- 创建函数：当用户在 Auth.users 插入新用户时，自动创建 users 表记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除可能已存在的触发器（避免重复）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Row Level Security (RLS) 策略
-- =========================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- users 表策略：认证用户可以查看所有用户信息（admin页面和审批需要）
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- departments 表策略：认证用户可以查看部门
CREATE POLICY "Authenticated users can view departments" ON departments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- schedules 表策略：用户可查看自己的排班，管理员可查看所有排班
CREATE POLICY "Admins can view all schedules" ON schedules
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
  );

-- checkins 表策略：用户可查看自己的打卡，管理员可查看所有打卡
CREATE POLICY "Users can view their own checkins" ON checkins
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
  );

CREATE POLICY "Users can create their own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- approval_requests 表策略：用户可查看自己的请求和需要审批的请求
CREATE POLICY "Users can view relevant requests" ON approval_requests
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM approval_steps WHERE approval_steps.request_id = approval_requests.id AND approval_steps.approver_id = auth.uid())
  );

CREATE POLICY "Users can create their own requests" ON approval_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- approval_steps 表策略
CREATE POLICY "Users can view steps for their requests" ON approval_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM approval_requests WHERE approval_requests.id = approval_steps.request_id AND approval_requests.user_id = auth.uid())
    OR approver_id = auth.uid()
  );

CREATE POLICY "Users can create steps for their requests" ON approval_steps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM approval_requests WHERE approval_requests.id = approval_steps.request_id AND approval_requests.user_id = auth.uid())
  );

CREATE POLICY "Approvers can update their steps" ON approval_steps
  FOR UPDATE USING (approver_id = auth.uid());

-- announcements 表策略：所有人可以查看活跃公告
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

-- shifts 表策略：所有人可以查看班次
CREATE POLICY "Anyone can view shifts" ON shifts
  FOR SELECT USING (true);
