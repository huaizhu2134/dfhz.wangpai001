import { putObject } from "../cos.js";
import { UserModel } from "../models/User.js";
import { UserService } from "./UserService.js";
import { loadConfig } from "../config.js";

const config = loadConfig(process.env);

export class UploadService {
  static async uploadAvatar(uid, file, cosClient) {
    if (!file?.buffer) throw new Error("FILE_REQUIRED");

    const safeName = String(file.originalname || "avatar").replace(/[^\w.\-]+/g, "_");
    const key = `avatars/${uid}/${Date.now()}_${safeName}`;

    await putObject({
      cos: cosClient,
      bucket: config.cos.bucket,
      region: config.cos.region,
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    const base = config.cos.publicBaseUrl.replace(/\/+$/, "");
    const url = `${base}/${key}`;

    await UserModel.update(uid, { avatarUrl: url });
    return UserService.getUserById(uid);
  }
}
