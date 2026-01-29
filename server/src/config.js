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

  const missing = [];
  if (!jwtSecret) missing.push("JWT_SECRET");
  if (!mysql.host) missing.push("MYSQL_HOST");
  if (!mysql.user) missing.push("MYSQL_USER");
  if (!mysql.database) missing.push("MYSQL_DATABASE");
  if (!wechat.appId) missing.push("WECHAT_APPID");
  if (!wechat.secret) missing.push("WECHAT_SECRET");
  if (!cos.secretId) missing.push("COS_SECRET_ID");
  if (!cos.secretKey) missing.push("COS_SECRET_KEY");
  if (!cos.bucket) missing.push("COS_BUCKET");
  if (!cos.region) missing.push("COS_REGION");
  if (!cos.publicBaseUrl) missing.push("COS_PUBLIC_BASE_URL");

  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }

  return { port, jwtSecret, mysql, wechat, cos };
}

