'use strict';

const Service = require('egg').Service;
const { fetchAdList, fetchAddAd, fetchDeleteAd } = require('../mapper/ad');
const { successMsg } = require('../../utils/utils');
class AdService extends Service {
  // 获取广告列表
  async fetchAdList() {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const adList = await ctx.app.mysql.query(fetchAdList, [eid]);
    return successMsg(adList);
  }

  // 添加广告
  async fetchAddAd(data) {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const { url, path, display, title } = data;
    const result = await ctx.app.mysql.query(fetchAddAd, [eid, url, path, display, title, new Date(), new Date()]);
    return successMsg(result);
  }

  // 更新广告
  async fetchUpdateAd(data) {
    const { id, url, path, display, title } = data;
    const result = await this.app.mysql.update(
      'program_swiper',
      {
        url,
        path,
        display,
        title,
        updated_time: new Date(),
      },
      {
        where: { id },
      }
    );
    return successMsg(result);
  }

  async fetchDeleteAd(data) {
    const { ctx } = this;
    const { id } = data;
    const result = await ctx.app.mysql.query(fetchDeleteAd, [id]);
    return successMsg(result);
  }
}

module.exports = AdService;
