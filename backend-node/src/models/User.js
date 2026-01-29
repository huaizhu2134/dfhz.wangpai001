import { query } from "../db.js";

export class UserModel {
  static async findByOpenId(openId) {
    const [rows] = await query("SELECT * FROM shop_user WHERE openId = ? LIMIT 1", [openId]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await query("SELECT * FROM shop_user WHERE id = ? LIMIT 1", [id]);
    return rows[0];
  }

  static async create(openId) {
    await query(
      "INSERT INTO shop_user (openId, createdAt, updatedAt) VALUES (?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updatedAt = NOW()",
      [openId]
    );
    return this.findByOpenId(openId);
  }

  static async update(id, data) {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    const values = fields.map((k) => data[k]);
    const setSql = fields.map((k) => `${k} = ?`).join(", ");
    
    await query(`UPDATE shop_user SET ${setSql}, updatedAt = NOW() WHERE id = ?`, [...values, id]);
    return this.findById(id);
  }
}
