'use strict';

const Service = require('egg').Service;
const { fetchBasic, fetchAddBasic, fetchUpdateBasic } = require('../mapper/basic');
const { successMsg } = require('../../utils/utils');

class BasicService extends Service {
  // 获取基本信息
  async fetchBasic() {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const result = await ctx.app.mysql.query(fetchBasic, [eid]);
    if (result.length === 0) {
      return successMsg({});
    }
    return successMsg(result[0]);
  }

  // 添加基本信息
  async fetchAddBasic(data) {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const { domin, privacy_policy, user_agreement, contact_phone, contact_email, company_address, company_description } = data;
    const result = await ctx.app.mysql.query(fetchAddBasic, [
      eid,
      domin,
      privacy_policy,
      user_agreement,
      contact_phone,
      contact_email,
      company_address,
      company_description,
      new Date().getTime(),
      new Date().getTime(),
    ]);
    return successMsg(result);
  }

  // 更新基本信息
  async fetchUpdateBasic(data) {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const { domin, privacy_policy, user_agreement, contact_phone, contact_email, company_address, company_description } = data;
    const result = await this.app.mysql.query(fetchUpdateBasic, [domin, privacy_policy, user_agreement, contact_phone, contact_email, company_address, company_description, new Date().getTime(), eid]);
    return successMsg(result);
  }
}

module.exports = BasicService;
