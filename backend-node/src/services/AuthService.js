import { UserModel } from "../models/User.js";
import { signAccessToken } from "../auth.js";
import { code2Session } from "../wechat.js";
import { loadConfig } from "../config.js";

const config = loadConfig(process.env);

export class AuthService {
  static async login(code) {
    let openId = "";
    
    if (code === "mock") {
      openId = "o_mock_openid";
    } else {
      const session = await code2Session({ ...config.wechat, code });
      if (!session.openId) throw new Error("NO_OPENID");
      openId = session.openId;
    }

    const user = await UserModel.create(openId);
    if (!user) throw new Error("USER_CREATE_FAILED");

    const token = signAccessToken({ 
      jwtSecret: config.jwtSecret, 
      uid: String(user.id), 
      openId: user.openId 
    });

    return { token, user };
  }
}
