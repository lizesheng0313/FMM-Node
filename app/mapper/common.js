module.exports = {
  getAppIdList: 'SELECT appid FROM user WHERE is_del = 0 or is_del is NULL',
};
