# 移动端 OA 系统 - Implementation Plan

## [x] Task 1: 项目初始化与基础配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化 Next.js 14 项目
  - 配置 Tailwind CSS 3
  - 配置 Supabase 客户端
  - 配置 App Router 基础结构
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目能正常构建
  - `programmatic` TR-1.2: Supabase 连接正常
- **Notes**: 使用 create-next-app 初始化

## [x] Task 2: 数据库表结构创建
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建 users, departments, schedules, shifts, checkins, approval_requests, approval_steps, announcements 表
  - 设置表关系和索引
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8]
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有表创建成功
  - `programmatic` TR-2.2: 表关系正确建立
- **Notes**: 使用 Supabase SQL 编辑器执行

## [x] Task 3: Edge Functions 实现
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建 checkin 函数（GPS校验、时间窗口校验）
  - 创建 create_approval 函数（创建审批请求）
  - 创建 approve_request 函数（审批处理）
  - 创建 validate_location 函数（地理围栏校验）
  - 创建 import_schedule_excel 函数（Excel导入）
- **Acceptance Criteria Addressed**: [AC-2, AC-3, AC-5, AC-6, AC-8]
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有 Edge Functions 部署成功
  - `programmatic` TR-3.2: 各函数调用返回正确状态
- **Notes**: 使用 Supabase CLI 部署

## [x] Task 4: 首页实现
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 用户卡片组件（头像、姓名、部门）
  - 快捷入口组件（打卡、请假、排班、员工）
  - 今日班次状态组件
  - 待审批数量组件
  - 公告列表组件
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 页面布局符合移动端设计
  - `human-judgment` TR-4.2: 数据展示正确
- **Notes**: 使用 Server Components 获取数据

## [x] Task 5: 审批模块实现
- **Priority**: P0
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - /approval 页面（审批列表）
  - /approval/initiated 页面（我发起的）
  - /approval/pending 页面（待我审批）
  - /approval/:id 页面（审批详情）
  - 请假申请表单组件
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 审批请求创建成功
  - `programmatic` TR-5.2: 审批状态更新正确
  - `human-judgment` TR-5.3: UI 交互流畅
- **Notes**: 使用 Client Components 处理表单交互

## [x] Task 6: 排班模块实现
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - /schedule/my 页面（我的排班）
  - /schedule/calendar 页面（排班日历）
  - /schedule/stats 页面（排班统计）
  - 周视图组件
  - 月视图组件
  - 班次色块展示
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `human-judgment` TR-6.1: 日历视图展示正确
  - `human-judgment` TR-6.2: 班次色块区分明显
- **Notes**: 使用 Server Components 获取排班数据

## [x] Task 7: 打卡模块实现
- **Priority**: P0
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - /checkin 页面
  - GPS 位置获取
  - 拍照打卡功能
  - 上下班状态展示
  - 打卡历史记录
- **Acceptance Criteria Addressed**: [AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-7.1: 打卡记录保存成功
  - `programmatic` TR-7.2: 图片上传到 Storage
  - `human-judgment` TR-7.3: 打卡流程流畅
- **Notes**: 使用 Client Components 处理地理位置和拍照

## [x] Task 8: 个人中心实现
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**: 
  - /profile 页面
  - 个人信息展示
  - 我的申请列表
  - 设置页面
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgment` TR-8.1: 个人信息展示正确
- **Notes**: 使用 Server Components

## [x] Task 9: 管理员排班管理模块
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - /admin/schedule/list 页面
  - /admin/schedule/import 页面
  - 排班 CRUD 功能
  - Excel 导入功能
- **Acceptance Criteria Addressed**: [AC-7, AC-8]
- **Test Requirements**:
  - `programmatic` TR-9.1: 排班 CRUD 操作成功
  - `programmatic` TR-9.2: Excel 导入批量创建成功
- **Notes**: 需要权限校验

## [ ] Task 10: 部署与上线
- **Priority**: P0
- **Depends On**: All
- **Description**: 
  - 前端部署到 Vercel
  - Edge Functions 部署到 Supabase
  - 配置环境变量
  - 测试验证
- **Acceptance Criteria Addressed**: [All]
- **Test Requirements**:
  - `programmatic` TR-10.1: 前端部署成功
  - `programmatic` TR-10.2: 所有 API 接口正常
- **Notes**: 使用 Vercel CLI 部署
