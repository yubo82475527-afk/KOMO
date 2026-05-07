-- =========================================
-- 多级审批流配置表
-- =========================================

-- 审批流模板表
CREATE TABLE IF NOT EXISTS approval_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('leave', 'overtime', 'business_trip', 'other', 'all')),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 审批流步骤配置表
CREATE TABLE IF NOT EXISTS approval_flow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID REFERENCES approval_flows(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  approver_type VARCHAR(20) NOT NULL CHECK (approver_type IN ('specific_user', 'department_manager', 'admin', 'role')),
  approver_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(flow_id, step_number)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_approval_flows_type ON approval_flows(request_type);
CREATE INDEX IF NOT EXISTS idx_approval_flows_department ON approval_flows(department_id);
CREATE INDEX IF NOT EXISTS idx_approval_flow_steps_flow ON approval_flow_steps(flow_id);

-- 启用 RLS
ALTER TABLE approval_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_flow_steps ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Admins can manage approval flows" ON approval_flows
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
  );

CREATE POLICY "Admins can manage approval flow steps" ON approval_flow_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
  );

-- 插入默认审批流（所有类型通用）
INSERT INTO approval_flows (name, description, request_type, is_active)
VALUES ('默认审批流', '适用于所有申请类型的默认审批流程', 'all', true)
ON CONFLICT DO NOTHING;

-- 为默认审批流添加步骤（需要先有管理员用户）
-- 步骤1：部门主管审批
-- 步骤2：人事审批
-- 步骤3：总经理审批
