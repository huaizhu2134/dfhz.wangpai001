export function loadConfig(env) {
  const port = Number(env.PORT || 8080);
  const jwtSecret = String(env.JWT_SECRET || "");

  const mysql = {
    host: String(env.MYSQL_HOST || ""),
    port: Number(env.MYSQL_PORT || 3306),
    user: String(env.MYSQL_USER || ""),
    password: String(env.MYSQL_PASSWORD || ""),
    database: String(env.MYSQL_DATABASE || ""),
  };

  const wechat = {
    appId: String(env.WECHAT_APPID || ""),
    secret: String(env.WECHAT_SECRET || ""),
  };

  const cos = {
    secretId: String(env.COS_SECRET_ID || ""),
    secretKey: String(env.COS_SECRET_KEY || ""),
    bucket: String(env.COS_BUCKET || ""),
    region: String(env.COS_REGION || ""),
    publicBaseUrl: String(env.COS_PUBLIC_BASE_URL || ""),
  };

  // Only check critical envs if not in CI/Test mode strictly
  // but here we just warn or throw.
  const missing = [];
  if (!jwtSecret) missing.push("JWT_SECRET");
  if (!mysql.host) missing.push("MYSQL_HOST");
  
  // You might want to relax this for local dev if using mocks on backend too?
  // But backend usually needs real DB.
  
  if (missing.length) {
    console.warn(`[Config] Missing critical envs: ${missing.join(", ")}`);
  }

  return { port, jwtSecret, mysql, wechat, cos };
}
