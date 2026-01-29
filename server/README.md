# server（后端 API）

## 你会用到的接口
- `GET /healthz`：健康检查（包含数据库连通性）
- `POST /api/auth/wxlogin`：小程序 `wx.login()` 的 code 换取 `token + user`
- `GET /api/user/me`：获取当前登录用户
- `PUT /api/user/me`：更新当前用户资料
- `POST /api/upload/avatar`：上传头像（multipart/form-data, field=`file`），服务端转存 COS 并写回用户 `avatarUrl`

## 本地启动
1) 复制环境变量：
- `.env.example` → `.env`
2) 初始化数据库：
- 执行 `sql/001_init.sql`
3) 安装与启动：
- `npm i`
- `npm run dev`

启动后访问 `/healthz`，返回 `{ ok: true, db: true }` 表示已连接到 MySQL。

## 线上部署（轻量服务器）
推荐：Nginx(HTTPS) + pm2

### pm2
在 `server/` 目录：
- `npm i --omit=dev`
- `pm2 start src/index.js --name ace-esports-api`
- `pm2 save`

### Nginx 反代要点
- 反代到 `http://127.0.0.1:8080`
- 设置上传大小（否则头像上传会 413）：
  - `client_max_body_size 10m;`

## 环境变量说明
见 `.env.example`：
- `MYSQL_*`：TDSQL(MySQL) 连接信息
- `WECHAT_APPID/WECHAT_SECRET`：用于 `code2session`
- `COS_*`：COS 上传所需配置
- `COS_PUBLIC_BASE_URL`：建议填 COS 绑定的 CDN/自定义域名（用于拼接公开访问 URL）
- `JWT_SECRET`：签发 accessToken 的密钥（务必设置强密码）

## 前端配置示例
小程序侧在 `config/api.js` 配置：
- `USE_MOCK=true`：不依赖后端，先用 Mock 数据跑通
- `USE_MOCK=false`：连接你部署在轻量服务器上的 API
  - `API_BASE_URL=https://api.xxx.com`
