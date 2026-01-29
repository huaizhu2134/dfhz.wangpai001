import { DATA_MODEL_KEY } from '../../config/model';
import { getAll, model } from '../_utils/model';

const GAME_ACCOUNT_MODEL_KEY = DATA_MODEL_KEY.GAME_ACCOUNT;

export function getAllAddress(uid) {
  return getAll({
    name: GAME_ACCOUNT_MODEL_KEY,
    select: {
      _id: true,
      gameName: true,
      gameId: true,
      gamePlatform: true,
      user: {
        _id: true,
      }
    },
    filter: {
        relateWhere: {
          user: {
            where: {
              _id: {
                $eq: uid,
              },
            },
          },
        },
      },
  });
}

/**
 *
 * @param {{
 *   gameName: String,
 *   gameId: String,
 *   gamePlatform: String,
 *   uid: String
 * }} param0
 * @returns
 */
export function createAddress({ gameName, gameId, gamePlatform, uid }) {
  return model()[GAME_ACCOUNT_MODEL_KEY].create({
    data: {
      gameName,
      gameId,
      gamePlatform,
      user:{
          _id: uid,
      }
    },
  });
}

/**
 *
 * @param {{
 *   gameName: String,
 *   gameId: String,
 *   gamePlatform: String,
 *   _id: String
 * }} param0
 */
export function updateAddress({ gameName, gameId, gamePlatform, _id }) {
  return model()[GAME_ACCOUNT_MODEL_KEY].update({
    data: {
      gameName,
      gameId,
      gamePlatform,
    },
    filter: {
      where: {
        _id: { $eq: _id },
      },
    },
  });
}

export function deleteAddress({ id }) {
  return model()[GAME_ACCOUNT_MODEL_KEY].delete({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
  });
}

export async function getAddress({ id }) {
  return (
    await model()[GAME_ACCOUNT_MODEL_KEY].get({
      filter: {
        where: {
          _id: {
            $eq: id,
          },
        },
      },
    })
  ).data;
}
