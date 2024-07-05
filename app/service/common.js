'use strict';

const Service = require('egg').Service;
const { getAppIdList } = require('../mapper/common');
const { successMsg } = require('../../utils/utils');
class CommonService extends Service {
  // 获取广告列表
  async getAppIdList() {
    const { ctx } = this;
    const appIdList = await ctx.app.mysql.query(getAppIdList);
    const result = appIdList.filter((item) => ({
      label: item.eid,
      value: item.eid,
    }));
    return successMsg(result);
  }
}

module.exports = CommonService;
