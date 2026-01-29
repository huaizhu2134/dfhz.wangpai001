import { request, setAccessToken, getAccessToken } from "../_utils/request";
import { USE_MOCK } from "../../config/api";

const USER_STORAGE_KEY = "userInfo";

/**
 * 获取用户信息
 * @param {boolean} forceRefresh 是否强制从云端刷新
 */
export function getUser(forceRefresh = false){
    return new Promise((resolve, reject) => {
        if (forceRefresh) {
            getUserFromCloud().then(resolve).catch(reject);
            return;
        }
        // 获取本地用户缓存
        wx.getStorage({
            key: USER_STORAGE_KEY,
            success (res) {
                if(typeof(res.data) != 'undefined'){
                    // 如果缓存中有数据，先返回缓存数据，同时异步更新缓存
                    resolve(res.data);
                    getUserFromCloud();
                } else {
                    getUserFromCloud().then(resolve).catch(reject);
                }
            },
            fail(_error){
                getUserFromCloud().then(resolve).catch(reject);
            }
        })
    })
}

async function getUserFromCloud() {
  const token = getAccessToken();
  if (token) {
    try {
      const res = await request({ url: "/user/me", method: "GET" });
      const userInfo = res?.user || {};
      wx.setStorage({ key: USER_STORAGE_KEY, data: userInfo });
      return userInfo;
    } catch (e) {
      if (Number(e?.status || 0) !== 401) throw e;
    }
  }

  const code = USE_MOCK ? "mock" : await wxLoginCode();
  const loginRes = await request({ url: "/auth/wxlogin", method: "POST", data: { code } });
  const nextToken = loginRes?.token || "";
  const userInfo = loginRes?.user || {};
  if (nextToken) setAccessToken(nextToken);
  wx.setStorage({ key: USER_STORAGE_KEY, data: userInfo });
  return userInfo;
}

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res?.code) resolve(res.code);
        else reject(new Error("WX_LOGIN_NO_CODE"));
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

/**
 *
 * @param {{
 *   name,
 *   address,
 *   phone,
 *   _id,
 *   location
 * }} param0
 */
export async function updateUser({ uid, data }) {
  const res = await request({ url: "/user/me", method: "PUT", data: { uid, data } });
  const userInfo = res?.user || {};
  wx.setStorage({ key: USER_STORAGE_KEY, data: userInfo });
  return userInfo;
}
