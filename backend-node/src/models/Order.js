import { query } from "../db.js";

export class OrderModel {
  static async listByUserId(uid, status) {
    let sql = "SELECT * FROM shop_order WHERE user_id = ?";
    const params = [uid];
    
    if (status && status !== 'ALL') {
      sql += " AND status = ?";
      params.push(status);
    }
    
    sql += " ORDER BY id DESC";
    
    const [rows] = await query(sql, params);
    return rows;
  }

  // Create order logic would go here
}
