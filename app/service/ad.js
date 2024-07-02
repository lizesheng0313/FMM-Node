'use strict';

const Service = require('egg').Service;
const { fetchAdList, fetchAddAd, fetchDeleteAd } = require('../mapper/ad');

class AdService extends Service {
  // 获取广告列表
  async fetchAdList() {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const adList = await ctx.app.mysql.query(fetchAdList, [eid]);
    return adList;
  }

  // 添加广告
  async fetchAddAd(data) {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const { url, path, display, title } = data;
    const result = await ctx.app.mysql.query(fetchAddAd, [eid, url, path, display, title, new Date(), new Date()]);
    return result;
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
    return result;
  }

  async fetchDeleteAd(data) {
    const { ctx } = this;
    const { id } = data;
    const result = await ctx.app.mysql.query(fetchDeleteAd, [id]);
    return { code: 0 };
  }
}

module.exports = AdService;
