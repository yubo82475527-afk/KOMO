# 移动端 OA 系统 - Product Requirement Document

## Overview
- **Summary**: 基于 Next.js 14 + Supabase 构建的移动端优先 OA 系统，包含排班管理、审批流程、打卡考勤三大核心模块。
- **Purpose**: 为企业提供轻量级、移动端友好的办公自动化解决方案，类似企业微信/钉钉的用户体验。
- **Target Users**: 企业员工（普通用户）和管理员。

## Goals
- 实现完整的排班管理功能（个人排班查看、日历视图、统计分析）
- 实现多级审批流程（请假申请、审批流转）
- 实现 GPS 打卡功能（地理围栏校验、拍照打卡）
- 移动端优先的响应式设计
- 类企业微信的卡片式 UI 风格

## Non-Goals (Out of Scope)
- 非移动端优先的桌面端优化
- 复杂的报表分析功能
- 第三方集成（如邮件、消息推送）
- 即时通讯功能

## Background & Context
- 使用 Supabase 作为后端服务，包含认证、数据库、存储和 Edge Functions
- 使用 Next.js 14 App Router 实现服务端组件和客户端组件分离
- Tailwind CSS 实现移动端优先的样式设计

## Functional Requirements
- **FR-1**: 用户可以查看个人信息和今日状态摘要
- **FR-2**: 用户可以发起请假申请并查看审批进度
- **FR-3**: 用户可以查看个人排班表（周视图、月视图）
- **FR-4**: 用户可以进行 GPS 打卡（上班/下班）
- **FR-5**: 用户可以拍照打卡并上传照片
- **FR-6**: 管理员可以管理排班表（CRUD、Excel 导入）
- **FR-7**: 审批流程支持多级审批

## Non-Functional Requirements
- **NFR-1**: 响应时间 < 100ms（API 请求）
- **NFR-2**: 移动端适配（iOS/Android）
- **NFR-3**: 数据安全（Supabase Auth 认证）
- **NFR-4**: 图片存储（Supabase Storage）

## Constraints
- **Technical**: Next.js 14 App Router, Supabase Edge Functions, Tailwind CSS 3
- **Business**: 移动端优先设计，类企业微信 UI
- **Dependencies**: Supabase Auth, Supabase Storage, Supabase Edge Functions

## Assumptions
- 用户已注册并通过 Supabase Auth 认证
- 管理员有独立的权限标识
- 地理围栏使用经纬度范围判断

## Acceptance Criteria

### AC-1: 用户首页展示
- **Given**: 用户已登录
- **When**: 访问首页 `/`
- **Then**: 显示用户卡片、快捷入口、今日班次、待审批数量、公告列表
- **Verification**: `human-judgment`

### AC-2: 请假申请提交
- **Given**: 用户已登录
- **When**: 进入审批页面并填写请假表单
- **Then**: 调用 Edge Function 创建审批请求并返回成功
- **Verification**: `programmatic`

### AC-3: 审批流程处理
- **Given**: 存在待审批请求
- **When**: 审批人点击审批按钮
- **Then**: 更新审批状态并通知下一审批人
- **Verification**: `programmatic`

### AC-4: 排班日历展示
- **Given**: 用户已登录
- **When**: 访问排班日历页面
- **Then**: 显示月视图日历，不同班次用不同色块标识
- **Verification**: `human-judgment`

### AC-5: GPS 打卡校验
- **Given**: 用户在工作地点附近
- **When**: 点击打卡按钮
- **Then**: Edge Function 校验位置并记录打卡
- **Verification**: `programmatic`

### AC-6: 拍照打卡上传
- **Given**: 用户点击拍照打卡
- **When**: 上传照片并提交
- **Then**: 照片存储到 Supabase Storage，记录保存到数据库
- **Verification**: `programmatic`

### AC-7: 管理员排班管理
- **Given**: 管理员登录
- **When**: 进入排班管理页面
- **Then**: 可以查看、创建、编辑、删除排班记录
- **Verification**: `human-judgment`

### AC-8: Excel 导入排班
- **Given**: 管理员上传 Excel 文件
- **When**: 解析文件并确认导入
- **Then**: 批量创建排班记录并显示错误信息
- **Verification**: `programmatic`

## Open Questions
- [ ] 地理围栏的具体范围如何定义？
- [ ] 多级审批的流程配置如何管理？
- [ ] Excel 导入的模板格式是什么？
