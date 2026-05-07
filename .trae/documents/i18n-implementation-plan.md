# KOMO OA 系统多语言实现计划

## 概述
为 KOMO OA 系统添加国际化支持，1.0 版本支持中文和英文，未来可扩展更多语言。

## 技术选型
- **i18n 库**: next-intl (Next.js 官方推荐)
- **语言切换**: 自动检测浏览器语言 + 手动切换
- **持久化**: Cookie 存储

## 当前状态分析
- 所有文本硬编码在组件中（中文）
- 约 20+ 个页面/组件需要国际化
- `layout.tsx` 中 `lang="zh-CN"` 硬编码
- 无 i18n 依赖

## 实现步骤

### 第一阶段：安装和配置 next-intl

#### 1.1 安装依赖
```bash
npm install next-intl
```

#### 1.2 创建翻译文件
创建 `messages/` 目录：
- `messages/zh.json` - 中文翻译
- `messages/en.json` - 英文翻译

#### 1.3 创建 i18n 配置
创建 `src/i18n/request.ts` - 客户端配置
创建 `src/i18n/routing.ts` - 路由配置
创建 `src/i18n/index.ts` - 导出

#### 1.4 更新 middleware.ts
添加语言检测和重定向逻辑

#### 1.5 更新 next.config.js
添加 next-intl 插件配置

### 第二阶段：提取和翻译文本

#### 2.1 翻译文件结构
```json
{
  "common": {
    "loading": "加载中...",
    "submit": "提交",
    "cancel": "取消",
    ...
  },
  "nav": {
    "home": "首页",
    "approval": "审批",
    "schedule": "排班",
    "checkin": "打卡",
    "profile": "我的"
  },
  "login": {
    "title": "登录OA系统",
    "register": "注册账号",
    ...
  },
  "checkin": {
    "title": "打卡",
    "checkIn": "上班打卡",
    "checkOut": "下班签退",
    ...
  },
  "approval": {
    "title": "审批",
    "initiate": "发起审批",
    "pending": "待审批",
    ...
  },
  "schedule": {
    "title": "排班",
    ...
  },
  "profile": {
    "title": "我的",
    ...
  },
  "admin": {
    "title": "管理后台",
    ...
  }
}
```

#### 2.2 需要修改的文件列表
| 文件 | 文本数量(估) |
|------|-------------|
| `app/page.tsx` | ~10 |
| `app/layout.tsx` | ~3 |
| `app/login/page.tsx` | ~10 |
| `app/checkin/page.tsx` | ~25 |
| `app/approval/page.tsx` | ~5 |
| `app/approval/initiate/page.tsx` | ~15 |
| `app/approval/pending/page.tsx` | ~10 |
| `app/approval/initiated/page.tsx` | ~10 |
| `app/approval/[id]/page.tsx` | ~15 |
| `app/schedule/my/page.tsx` | ~10 |
| `app/schedule/calendar/page.tsx` | ~10 |
| `app/schedule/stats/page.tsx` | ~10 |
| `app/profile/page.tsx` | ~15 |
| `app/employees/page.tsx` | ~10 |
| `app/admin/page.tsx` | ~10 |
| `app/admin/approval-flow/page.tsx` | ~20 |
| `src/components/BottomNav.tsx` | ~5 |
| `src/components/UserCard.tsx` | ~5 |
| `src/components/QuickActions.tsx` | ~10 |
| `src/components/TodaySchedule.tsx` | ~5 |
| `src/components/PendingApproval.tsx` | ~5 |
| `src/components/Announcements.tsx` | ~5 |

### 第三阶段：实现语言切换组件

#### 3.1 创建语言切换组件
创建 `src/components/LanguageSwitcher.tsx`
- 显示当前语言
- 下拉选择其他语言
- 保存到 Cookie

#### 3.2 添加到设置页面
在 `app/settings/page.tsx` 或 `app/profile/page.tsx` 添加语言设置入口

### 第四阶段：API 错误消息国际化

#### 4.1 创建 API 消息映射
在 API 路由中返回消息 key，前端根据语言显示对应文本

#### 4.2 修改文件
- `app/api/approval/route.ts`
- `app/api/checkin/route.ts`
- `app/api/approve/route.ts`

## 文件变更清单

### 新增文件
1. `messages/zh.json` - 中文翻译
2. `messages/en.json` - 英文翻译
3. `src/i18n/request.ts` - 客户端 i18n 配置
4. `src/i18n/routing.ts` - 路由配置
5. `src/i18n/index.ts` - 导出
6. `src/components/LanguageSwitcher.tsx` - 语言切换组件

### 修改文件
1. `package.json` - 添加 next-intl 依赖
2. `next.config.js` - 添加 next-intl 插件
3. `middleware.ts` - 添加语言检测
4. `app/layout.tsx` - 使用 i18n Provider
5. 所有页面和组件 - 替换硬编码文本

## 验证步骤
1. 访问应用，检查默认语言是否正确
2. 切换语言，检查所有页面文本是否正确切换
3. 刷新页面，检查语言设置是否持久化
4. 检查 API 错误消息是否正确显示

## 注意事项
1. 服务端组件和客户端组件使用不同的 API
2. 日期、时间格式需要根据语言调整
3. 复数形式处理（英文需要）
4. 翻译文件保持同步

## 预计工作量
- 配置阶段: ~30 分钟
- 文本提取和翻译: ~2 小时
- 语言切换组件: ~30 分钟
- 测试和调整: ~30 分钟
