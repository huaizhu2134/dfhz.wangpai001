import { API_BASE_URL, API_PATH_PREFIX, TOKEN_STORAGE_KEY, USE_MOCK } from '../../config/api';
import { mockApiRequest } from '../../mocks/api';

export function getAccessToken() {
  try {
    return wx.getStorageSync(TOKEN_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setAccessToken(token) {
  wx.setStorage({ key: TOKEN_STORAGE_KEY, data: token || '' });
}

export function request({ url, method = 'GET', data, header = {} }) {
  if (USE_MOCK) {
    return Promise.resolve(mockApiRequest({ url, method, data }));
  }
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    const h = { ...header };
    if (token && !h.Authorization) h.Authorization = `Bearer ${token}`;

    wx.request({
      url: `${API_BASE_URL}${API_PATH_PREFIX}${url}`,
      method,
      data,
      header: h,
      success(res) {
        const status = Number(res.statusCode || 0);
        if (status >= 200 && status < 300) resolve(res.data);
        else reject(Object.assign(new Error('REQUEST_FAILED'), { status, data: res.data }));
      },
      fail(err) {
        reject(err);
      },
    });
  });
}
