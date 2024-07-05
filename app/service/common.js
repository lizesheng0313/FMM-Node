'use strict';

const Service = require('egg').Service;
const { getAppIdList } = require('../mapper/common');
const { successMsg } = require('../../utils/utils');
class CommonService extends Service {
  // 获取appId列表
  async getAppIdList() {
    const { ctx } = this;
    const appIdList = await ctx.app.mysql.query(getAppIdList);
    const result = appIdList.map((item) => ({
      label: item.eid,
      value: item.eid,
    }));
    return successMsg(result);
  }
}

module.exports = CommonService;
