import { query, transaction } from "../db.js";

export class BoosterModel {
  static async listOrders(status) {
    const [rows] = await query("SELECT * FROM booster_order WHERE status = ? ORDER BY id DESC", [status]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await query("SELECT * FROM booster_order WHERE id = ?", [id]);
    return rows[0];
  }

  // Transactional operations should be handled in Service layer calling transaction()
  // But for simple updates we can have methods here.
  static async updateStatusAndBoosters(conn, id, status, boostersJson) {
    await conn.execute(
      "UPDATE booster_order SET status = ?, boosters_json = ? WHERE id = ?", 
      [status, boostersJson, id]
    );
  }
  
  static async increaseManpower(conn, id) {
    await conn.execute("UPDATE booster_order SET max_boosters = max_boosters + 1 WHERE id = ?", [id]);
  }
}
