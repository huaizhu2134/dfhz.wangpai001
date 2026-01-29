import { HomeModel } from "../models/Home.js";

export class HomeService {
  static async getSwiper() {
    return HomeModel.getSwiper();
  }
}
