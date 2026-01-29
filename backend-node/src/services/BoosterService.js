import { BoosterModel } from "../models/Booster.js";
import { transaction } from "../db.js";

export class BoosterService {
  static async listOrders(tab) {
    let status = 'TO_SEND';
    if (tab === 'TAKEN') status = 'TO_RECEIVE';
    
    const rows = await BoosterModel.listOrders(status);
    
    return rows.map(r => ({
      ...r,
      _id: String(r.id),
      boosters: r.boosters_json ? (typeof r.boosters_json === 'string' ? JSON.parse(r.boosters_json) : r.boosters_json) : [],
      maxBoosters: r.max_boosters
    }));
  }

  static async takeOrder(orderId, uid) {
    return transaction(async (conn) => {
      // Re-implement with manual locking logic or just use optimistic check inside transaction
      // Since we need row locking, we use raw SQL in transaction for locking
      const [rows] = await conn.execute("SELECT * FROM booster_order WHERE id = ? FOR UPDATE", [orderId]);
      if (!rows.length) throw new Error("ORDER_NOT_FOUND");
      
      const order = rows[0];
      if (order.status !== 'TO_SEND') throw new Error("ORDER_NOT_AVAILABLE");
      
      let boosters = [];
      try { boosters = JSON.parse(order.boosters_json || "[]"); } catch(e) {}
      
      if (boosters.includes(uid)) throw new Error("ALREADY_TAKEN");
      
      boosters.push(uid);
      
      await BoosterModel.updateStatusAndBoosters(conn, orderId, 'TO_RECEIVE', JSON.stringify(boosters));
      return true;
    });
  }

  static async increaseManpower(orderId, uid) {
    return transaction(async (conn) => {
      const [rows] = await conn.execute("SELECT * FROM booster_order WHERE id = ? FOR UPDATE", [orderId]);
      if (!rows.length) throw new Error("ORDER_NOT_FOUND");
      
      const order = rows[0];
      let boosters = [];
      try { boosters = JSON.parse(order.boosters_json || "[]"); } catch(e) {}
      
      if (boosters[0] !== uid) throw new Error("PERMISSION_DENIED");
      if (order.max_boosters >= 3) throw new Error("MAX_LIMIT_REACHED");
      
      await BoosterModel.increaseManpower(conn, orderId);
      return true;
    });
  }
}
