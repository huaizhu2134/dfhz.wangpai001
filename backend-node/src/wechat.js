export async function code2Session({ appId, secret, code }) {
  // If no appId configured (dev mode), return mock
  if (!appId || !secret) {
    console.warn("Using MOCK code2Session because WECHAT_APPID is missing");
    return {
      openId: `mock_openid_${Date.now()}`,
      sessionKey: "mock_session_key",
    };
  }

  const url =
    "https://api.weixin.qq.com/sns/jscode2session" +
    `?appid=${encodeURIComponent(appId)}` +
    `&secret=${encodeURIComponent(secret)}` +
    `&js_code=${encodeURIComponent(code)}` +
    "&grant_type=authorization_code";

  const res = await fetch(url, { method: "GET" });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(`WECHAT_HTTP_${res.status}`);
  }

  if (body.errcode) {
    const err = new Error("WECHAT_CODE2SESSION_ERROR");
    err.code = body.errcode;
    err.message = body.errmsg || err.message;
    throw err;
  }

  return {
    openId: body.openid,
    sessionKey: body.session_key,
    unionId: body.unionid || null,
  };
}
