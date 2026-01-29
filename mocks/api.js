import { mockState } from "./state";

export function mockApiRequest({ url, method = "GET", data }) {
  const m = String(method || "GET").toUpperCase();
  const path = String(url || "");

  if (path === "/auth/wxlogin" && m === "POST") {
    return { token: mockState.token, user: mockState.user };
  }

  if (path === "/user/me" && m === "GET") {
    return { user: mockState.user };
  }

  if (path === "/user/me" && m === "PUT") {
    const patch = data?.data && typeof data.data === "object" ? data.data : data;
    mockState.user = { ...mockState.user, ...(patch || {}) };
    return { user: mockState.user };
  }

  if (path === "/upload/avatar" && m === "POST") {
    const avatarUrl = "https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/1.png";
    mockState.user = { ...mockState.user, avatarUrl };
    return { user: mockState.user };
  }

  if (path === "/sku/update" && m === "POST") {
    return { ok: true };
  }

  if (path === "/order/status" && m === "POST") {
    return { ok: true };
  }

  if (path === "/pay/create" && m === "POST") {
    return { payment: null };
  }

  if (path === "/pay/refund" && m === "POST") {
    return { ok: true };
  }

  if (path === "/booster/squareOrders" && m === "POST") {
    const now = Date.now();
    return {
      code: 0,
      data: [
        {
          _id: "sq_order_1",
          status: "TO_SEND",
          total_amount: 50,
          boosters: [],
          maxBoosters: 1,
          createdAt: now,
        },
        {
          _id: "sq_order_2",
          status: "TO_RECEIVE",
          total_amount: 80,
          boosters: ["u_mock_1"],
          maxBoosters: 1,
          createdAt: now - 1000 * 60,
        },
      ],
    };
  }

  if (path === "/booster/takeOrder" && m === "POST") {
    return { code: 0, data: true };
  }

  if (path === "/booster/increaseManpower" && m === "POST") {
    return { code: 0, data: true };
  }

  if (path === "/booster/apply" && m === "POST") {
    return { code: 0, data: true };
  }

  return {};
}
