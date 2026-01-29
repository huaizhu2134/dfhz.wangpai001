# 部署到腾讯云轻量服务器 + TDSQL + COS（从云开发迁移）

## 目标架构
- 小程序：不再直连云开发数据模型/云存储；改为调用你自建的 HTTPS API
- 轻量服务器：跑 API 服务（Node.js），负责鉴权、业务逻辑、微信登录、支付下单、上传转存等
- TDSQL（MySQL）：存业务数据（用户、商品、订单、评论、接单等）
- COS：存图片/附件；建议绑定 CDN/自定义域名，前端直接用公开 URL 展示

## 先看开发流程文档
日常开发建议按这份来推进：`DEV_GUIDE.md`

## 你现在项目里需要迁移的核心点
- 用户：`services/usercenter/user.js` 当前用云函数 `get_wxuser_id/update_user`
- 图片：`wx.cloud.uploadFile` + `wx.cloud.getTempFileURL`（头像、轮播、商品图）
- 数据：大量 `globalThis.dataModel` 的 `list/get/create/update`（商品、分类、订单、评论、地址等）
- 业务云函数：`booster_order_ops/order_status_ops/shop_pay/shop_refund`（接单、状态机、支付、退款）

## 轻量服务器端（已在仓库内新增基础API骨架）
目录：`server/`

### 1) 准备环境变量
复制 `server/.env.example` 为 `server/.env`，填写：
- `WECHAT_APPID/WECHAT_SECRET`：小程序 AppID/密钥（用于 `code2session` 拿 openid）
- `MYSQL_*`：TDSQL 连接信息
- `COS_*`：COS 密钥、桶、地域、公开访问域名
  - `COS_PUBLIC_BASE_URL` 建议填你绑定的 CDN/自定义域名，比如 `https://img.yourdomain.com`

### 2) 初始化数据库
在 TDSQL 执行：`server/sql/001_init.sql`

### 3) 安装与启动
进入 `server/` 安装依赖并启动（建议用 pm2 守护）：
- `npm i`
- `npm start`

健康检查：`GET /healthz`（返回 `{ ok: true, db: true }` 表示已连上 TDSQL）

### 4) 小程序合法域名
需要在小程序后台配置：
- request 合法域名：你的 API 域名（必须 HTTPS）
- uploadFile 合法域名：你的 API 域名（如果头像上传走 API）

## 小程序侧改动（已做了“登录+头像上传”最小闭环）
### 1) 配置 API 域名
文件：`config/api.js`
- 把 `API_BASE_URL` 改成你的 API 线上域名（例如 `https://api.yourdomain.com`）

### 2) 登录/用户信息
文件：`services/usercenter/user.js`
- `getUser()`：改为 `wx.login` → `POST /api/auth/wxlogin` → 返回 `token + user`
- token 本地存 `accessToken`
- `updateUser()`：改为 `PUT /api/user/me`

### 3) 头像上传
文件：`pages/usercenter/person-info/index.js`
- 原来 `wx.cloud.uploadFile` 改为 `wx.uploadFile` 上传到 `POST /api/upload/avatar`
- 服务端把文件转存到 COS，并把 `avatarUrl` 写回 TDSQL

### 4) 图片展示兼容
文件：`utils/cloudImageHandler.js`
- 统一使用 `https://...`（COS/CDN URL）直接展示，不再需要临时 URL

## 后续你需要继续迁移的部分（建议顺序）
1) 数据模型 CRUD：把 `services/_utils/model.js` 以及所有 `model()[xxx].list/get/create/update` 改成你自建 API（服务端用 SQL 重建分页、过滤、关联）
2) 接单/抢单：把 `booster_order_ops` 的并发更新改为 SQL 原子更新（事务/行锁）
3) 支付/退款：用“微信支付 V3”在服务端生成预支付参数并回调更新订单
4) 文件上传：商品图、轮播图等统一改为 COS URL（尽量用 CDN/自定义域名直出）
