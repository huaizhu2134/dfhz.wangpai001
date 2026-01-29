import { OrderModel } from "../models/Order.js";

export class OrderService {
  static async listOrders(uid, status) {
    const rows = await OrderModel.listByUserId(uid, status);
    
    return rows.map(r => ({
      ...r,
      _id: String(r.id),
      items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : r.items_json
    }));
  }

  static async createOrder() {
    throw new Error("NOT_IMPLEMENTED");
  }
}
