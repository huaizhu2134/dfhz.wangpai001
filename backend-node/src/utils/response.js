// Standard Response Format
export const success = (res, data = null, msg = 'Success') => {
  res.status(200).json({
    code: 0,
    msg,
    data
  });
};

export const fail = (res, error, code = 500) => {
  console.error('[Error]', error);
  res.status(code >= 100 && code < 600 ? code : 500).json({
    code: error?.code || -1,
    msg: error?.message || 'Internal Server Error',
    data: null
  });
};
