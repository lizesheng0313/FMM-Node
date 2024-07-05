'use strict';

const Controller = require('egg').Controller;

class BasicController extends Controller {
  async fetchBasic() {
    const { ctx, service } = this;
    const result = await service.basic.fetchBasic();
    ctx.body = result;
  }

  async fetchAddBasic() {
    const { ctx, service } = this;
    const result = await service.basic.fetchAddBasic(ctx.request.body);
    ctx.body = result;
  }

  async fetchUpdateBasic() {
    const { ctx, service } = this;
    const result = await service.basic.fetchUpdateBasic(ctx.request.body);
    ctx.body = result;
  }
}

module.exports = BasicController;
