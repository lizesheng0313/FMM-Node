module.exports = {
  getAppIdList: 'SELECT eid FROM user WHERE is_delete = 0 or is_delete is NULL',
};
