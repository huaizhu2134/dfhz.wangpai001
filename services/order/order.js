import { model, getAll } from '../../services/_utils/model';
import { DATA_MODEL_KEY } from '../../config/model';
import { request } from '../_utils/request';

const ORDER_MODEL_KEY = DATA_MODEL_KEY.ORDER;

const ORDER_STATUS_INFO = {
  TO_PAY: { value: 'TO_PAY', label: '待付款' },
  TO_SEND: { value: 'TO_SEND', label: '未接单' },
  TO_RECEIVE: { value: 'TO_RECEIVE', label: '已接单' },
  FINISHED: { value: 'FINISHED', label: '已完成' },
  CANCELED: { value: 'CANCELED', label: '已取消' },
  RETURN_APPLIED: { value: 'RETURN_APPLIED', label: '申请退货' },
  RETURN_REFUSED: { value: 'RETURN_REFUSED', label: '拒绝退货申请' },
  RETURN_FINISH: { value: 'RETURN_FINISH', label: '退货完成' },
  RETURN_MONEY_REFUSED: { value: 'RETURN_MONEY_REFUSED', label: '拒绝退款' },
};

export const ORDER_STATUS = Object.keys(ORDER_STATUS_INFO).reduce((acc, k) => {
  acc[k] = ORDER_STATUS_INFO[k].value;
  return acc;
}, {});


export const orderStatusToName = (status) => Object.values(ORDER_STATUS_INFO).find((x) => x.value === status)?.label;

/**
 *
 * @param {{
 *   status: String,
 *   accountId: String
 *   uid: String
 * }} param0
 * @returns
 */
export async function createOrder({ status, accountId, uid }) {
    console.log('md', uid);
  return (
    await model()[ORDER_MODEL_KEY].create({
      data: {
        status,
        game_account: {
          _id: accountId,
        },
        purchaser:{
            _id: uid,
        },
        type:'1',
        delivery_mode:1,
        payment_mode:0
      },
    })
  ).data;
}

export function getAllOrder() {
  return getAll({
    name: ORDER_MODEL_KEY,
  });
}

/**
 *
 * @param {{
 *   pageSize: Number,
 *   pageNumber: Number,
 *   status?: String
 * }}} param0
 * @returns
 */
export async function listOrder({ pageSize, pageNumber, status,uid }) {
  if (status != null) {
    return (
      await model()[ORDER_MODEL_KEY].list({
        filter: {
          where: {
            status: {
              $eq: status,
            },
          },
          relateWhere: {
            purchaser: {
              where: {
                _id: {
                  $eq: uid,
                },
              },
            },
          },
        },
        pageSize,
        pageNumber,
        getCount: true,
      })
    ).data;
  }
  return (
    await model()[ORDER_MODEL_KEY].list({
      filter: {
        relateWhere: {
            purchaser: {
              where: {
                _id: {
                  $eq: uid,
                },
              },
            },
          },
      },
      pageSize,
      pageNumber,
      getCount: true,
    })
  ).data;
}

export async function listOrderByStatuses({ pageSize, pageNumber, statuses, uid }) {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    return (
      await model()[ORDER_MODEL_KEY].list({
        filter: {
          relateWhere: {
            purchaser: {
              where: {
                _id: {
                  $eq: uid,
                },
              },
            },
          },
        },
        pageSize,
        pageNumber,
        getCount: true,
      })
    ).data;
  }

  return (
    await model()[ORDER_MODEL_KEY].list({
      filter: {
        where: {
          status: {
            $in: statuses,
          },
        },
        relateWhere: {
          purchaser: {
            where: {
              _id: {
                $eq: uid,
              },
            },
          },
        },
      },
      pageSize,
      pageNumber,
      getCount: true,
    })
  ).data;
}

async function getOrderCountOfStatus(status,uid) {
  return (
    await model()[ORDER_MODEL_KEY].list({
      filter: { where: { status: { $eq: status } },relateWhere: { purchaser: { where: { _id: { $eq: uid } } } }},
      select: { _id: true },
      getCount: true,
    })
  ).data.total;
}

export async function getToPayOrderCount(uid) {
  return getOrderCountOfStatus(ORDER_STATUS.TO_PAY,uid);
}

export async function getToSendOrderCount(uid) {
  return getOrderCountOfStatus(ORDER_STATUS.TO_SEND,uid);
}

export async function getToReceiveOrderCount(uid) {
  return getOrderCountOfStatus(ORDER_STATUS.TO_RECEIVE,uid);
}

export async function getFinishedOrderCount(uid) {
  return getOrderCountOfStatus(ORDER_STATUS.FINISHED,uid);
}

/**
 *
 * @param {String} orderId
 */
export async function getOrder(orderId) {
  return (
    await model()[ORDER_MODEL_KEY].get({
      filter: {
        where: {
          _id: { $eq: orderId },
        },
      },
      select: {
        $master: true,
        game_account: {
          _id: true,
          gameName: true,
          gameId: true,
          gamePlatform: true,
        },
      },
    })
  ).data;
}

export async function updateOrderDeliveryInfo({ orderId, accountId }) {
  return model()[ORDER_MODEL_KEY].update({
    data: {
      game_account: {
        _id: accountId,
      },
    },
    filter: {
      where: {
        _id: {
          $eq: orderId,
        },
      },
    },
  });
}

/**
 *
 * @param {{orderId: String, status: String}}} param0
 * @returns
 */
export async function updateOrderStatus({ orderId, status }) {
  return request({ url: '/order/status', method: 'POST', data: { orderId, status } });
}
