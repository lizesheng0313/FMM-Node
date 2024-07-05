'use strict';

const Controller = require('egg').Controller;

class AdController extends Controller {
  async fetchAdList() {
    const { ctx, service } = this;
    const adList = await service.ad.fetchAdList();
    ctx.body = adList;
  }

  async fetchAddAd() {
    const { ctx, service } = this;
    const result = await service.ad.fetchAddAd(ctx.request.body);
    ctx.body = result;
  }

  async fetchUpdateAd() {
    const { ctx, service } = this;
    const result = await service.ad.fetchUpdateAd(ctx.request.body);
    ctx.body = result;
  }

  async fetchDeleteAd() {
    const { ctx, service } = this;
    const result = await service.ad.fetchDeleteAd(ctx.request.body);
    ctx.body = result;
  }
}

module.exports = AdController;
