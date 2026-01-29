import { query } from "../db.js";

export class GoodsModel {
  static async listSpu({ page = 1, size = 20, keyword = '' }) {
    const offset = (page - 1) * size;
    let sql = "SELECT * FROM spu WHERE status = 'selling'";
    const params = [];

    if (keyword) {
      sql += " AND name LIKE ?";
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY priority DESC, id DESC LIMIT ? OFFSET ?";
    params.push(size, offset);

    const [rows] = await query(sql, params);
    
    // Count
    let countSql = "SELECT COUNT(*) as total FROM spu WHERE status = 'selling'";
    const countParams = [];
    if (keyword) {
      countSql += " AND name LIKE ?";
      countParams.push(`%${keyword}%`);
    }
    const [countRows] = await query(countSql, countParams);
    
    return { records: rows, total: countRows[0].total };
  }

  static async getSpuById(id) {
    const [rows] = await query("SELECT * FROM spu WHERE id = ?", [id]);
    return rows[0];
  }

  static async listSku(spuId) {
    const [rows] = await query("SELECT * FROM sku WHERE spu_id = ?", [spuId]);
    return rows;
  }
}
