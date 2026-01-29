# 开发流程（轻量服务器 + TDSQL(MySQL) + COS）

这份文档用于你后续的“日常开发节奏”，默认你已经不再依赖云开发数据模型/云函数来承载业务。

## 一句话原则
- 小程序只做 UI + 调用 HTTPS API
- 服务端负责：鉴权、业务逻辑、SQL、支付回调、生成上传凭证/转存
- TDSQL 负责：结构化数据与事务一致性
- COS 负责：图片/附件；尽量 CDN/自定义域名直出

## 1. 基础设施准备（一次性）
### 1.1 轻量服务器
- 安装：Node.js（建议 18+）、Nginx、pm2
- 网络：80/443 对外开放；服务内部端口（如 8080）只给本机回环
- 域名：`api.xxx.com` 指向轻量服务器，申请并配置 HTTPS 证书（Nginx）

### 1.2 TDSQL(MySQL)
推荐两种连接方式（二选一）：
- **同 VPC 访问**：最稳也最省心（轻量服务器和 TDSQL 走内网）
- **公网访问 + 白名单**：TDSQL 开公网，放行轻量服务器出口公网 IP（注意 IP 变更）

### 1.3 COS
- 建桶、设置 CORS（允许小程序端或服务端访问）
- 绑定 CDN/自定义域名（推荐），得到公开访问前缀，比如 `https://img.xxx.com`

## 2. 本地开发（每天都用）
你仓库里已有最小后端骨架：`server/`

### 2.1 配置环境变量
复制：
- `server/.env.example` → `server/.env`

填写：
- `WECHAT_APPID/WECHAT_SECRET`（用于 code2session）
- `MYSQL_*`（TDSQL 连接信息）
- `COS_*`（COS 密钥、桶、地域、公开域名）
- `JWT_SECRET`（用于签发 accessToken）

### 2.2 初始化数据库（第一次）
在 TDSQL 上执行：
- `server/sql/001_init.sql`

后续每增加一个业务表，都新增一个 `server/sql/xxx.sql`，并在发布前执行到线上。

### 2.3 启动后端
在 `server/`：
- `npm i`
- `npm run dev`

用健康检查判断是否连上 TDSQL：
- `GET /healthz` 返回 `{ ok: true, db: true }`

### 2.4 小程序改 API 域名
修改：
- `config/api.js` 的 `API_BASE_URL` 为你的后端域名（本地可填局域网/本机代理域名；真机调试必须是 HTTPS 域名且在小程序后台合法域名里）

### 2.5 先用 Mock 跑前端（推荐先做）
当前默认使用 Mock，以保证不依赖 CloudBase/不依赖后端也能跑通页面：
- `config/api.js`：`USE_MOCK = true`

当你后端与 TDSQL/COS 准备好后再切换：
- `config/api.js`：`USE_MOCK = false`，并把 `API_BASE_URL` 改成你的 `https://api.xxx.com`

## 3. 开发顺序（从你当前项目出发的推荐路径）
你现在项目里主要有四类云开发依赖：用户、图片、数据模型 CRUD、业务云函数（接单/支付）。

推荐顺序：
1) **用户链路**（已打通）：登录/资料更新/头像上传
2) **只读查询**：首页轮播、分类、商品列表/详情（先把“浏览”跑通）
3) **下单链路**：购物车/创建订单/订单列表（SQL + 事务）
4) **接单广场**：抢单/加人（SQL 原子更新避免并发抢单）
5) **支付/退款**：微信支付 V3（服务端生成预支付参数 + 回调更新订单）

每做完一块，就把对应的 `services/*` 从 `dataModel` 调用替换为 HTTP API 调用。

## 4. 线上发布（每次上线）
推荐固定流程：
1) 本地确认：`/healthz` 连库正常
2) 执行 SQL 迁移：把新增的 `server/sql/*.sql` 应用到线上 TDSQL
3) 发布后端：上传代码 → `npm i --omit=dev` → pm2 reload
4) Nginx 配置：HTTPS、反代、请求体大小（上传需要）
5) 小程序后台：request/uploadFile 合法域名保持正确

## 5. 常见坑位
- 小程序真机调试必须是 HTTPS 域名且已配置合法域名
- TDSQL 公网模式时，白名单要放行“轻量服务器出口公网 IP”
- COS 最好绑定自定义域名/CDN，否则跨域/访问速度/防盗链策略会更麻烦
- 订单/接单这类并发逻辑不要在前端写状态机，必须服务端用事务/行锁保证一致性
