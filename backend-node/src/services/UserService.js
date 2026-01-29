import { UserModel } from "../models/User.js";

export class UserService {
  static async getUserById(uid) {
    const user = await UserModel.findById(uid);
    if (!user) return null;
    return this.normalizeUser(user);
  }

  static async updateUser(uid, data) {
    const patch = {};
    // White list fields
    if (typeof data.nickName === "string") patch.nickName = data.nickName;
    if (typeof data.avatarUrl === "string") patch.avatarUrl = data.avatarUrl;
    if (typeof data.phone === "string") patch.phone = data.phone;
    if (typeof data.name === "string") patch.name = data.name;
    if (typeof data.address === "string") patch.address = data.address;
    if (data.location) patch.location = JSON.stringify(data.location);

    const updated = await UserModel.update(uid, patch);
    return this.normalizeUser(updated);
  }

  static normalizeUser(row) {
    if (!row) return null;
    return {
      _id: String(row.id),
      openId: row.openId,
      nickName: row.nickName || "",
      avatarUrl: row.avatarUrl || "",
      phone: row.phone || "",
      name: row.name || "",
      address: row.address || "",
      role: row.role || 1,
      location: row.location ? (typeof row.location === 'string' ? JSON.parse(row.location) : row.location) : null,
    };
  }
}
