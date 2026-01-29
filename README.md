# 王牌电竞（小程序端 + 轻量服务器后端）

本仓库为小程序端项目，并配套一个独立 Node.js 后端（`server/`），整体架构为：
- 小程序：只负责 UI 与调用 HTTPS API
- 轻量服务器：承载 API、鉴权、业务逻辑
- TDSQL(MySQL)：业务数据
- COS：图片/附件存储（建议绑定 CDN/自定义域名）

## 快速开始（先保证前端能跑）
1) `config/api.js` 保持：
- `USE_MOCK = true`
2) 用微信开发者工具打开项目并运行即可。

Mock 数据位置：
- `mocks/data.js`（数据模型 Mock）
- `mocks/api.js`（API Mock）

## 切换到真实后端
1) 修改 `config/api.js`：
- `USE_MOCK = false`
- `API_BASE_URL = https://api.xxx.com`
2) 按 `DEV_GUIDE.md` 配好轻量服务器 + TDSQL + COS，并启动 `server/`

## 文档
- 开发流程与迁移顺序：`DEV_GUIDE.md`
- 后端运行与部署：`server/README.md`
