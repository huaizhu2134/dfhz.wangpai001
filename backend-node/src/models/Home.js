import { query } from "../db.js";

export class HomeModel {
  static async getSwiper() {
    const [rows] = await query("SELECT images FROM home_swiper LIMIT 1");
    if (!rows.length) return [];
    
    let images = rows[0].images;
    if (typeof images === "string") {
      try { images = JSON.parse(images); } catch(e) { images = []; }
    }
    return images;
  }
}
