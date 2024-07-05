'use strict';

const Controller = require('egg').Controller;

class CommonController extends Controller {
  async getAppIdList() {
    const { ctx, service } = this;
    const result = await service.common.getAppIdList();
    ctx.body = result;
  }
}

module.exports = CommonController;
