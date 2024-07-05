'use strict';

const Service = require('egg').Service;
const { fetchUserList, fetchAddUser, fetchUpdateUser, fetchDeleteUser, fetchUserByUsernameOrAppid } = require('../mapper/user');
const { fetchAddSecret, fetchUpdateSecret } = require('../mapper/program_secret');
const { successMsg, errorMsg } = require('../../utils/utils');

class UserService extends Service {
  // 获取用户列表
  async fetchUserList() {
    const { ctx } = this;
    const userList = await ctx.app.mysql.query(fetchUserList);
    return successMsg(userList);
  }

  // 添加用户
  async fetchAddUser(data) {
    const { ctx } = this;
    const { appid, username, password, role, avatar, secret, mchid, public_key, private_key } = data;
    // 判断appid是否已存在
    const existingAppid = await ctx.app.mysql.query(fetchUserByUsernameOrAppid, [username, appid]);
    if (existingAppid.length > 0) {
      return errorMsg('用户名或 appid 已存在');
    }
    // 插入到user表
    const userResult = await ctx.app.mysql.query(fetchAddUser, [appid, username, password, role, avatar, new Date().getTime(), new Date().getTime()]);
    // 插入到program_secret表
    const secretResult = await ctx.app.mysql.query(fetchAddSecret, [appid, secret, mchid, public_key, private_key]);
    ctx.logger.info('添加用户', userResult);
    ctx.logger.info('添加密钥', secretResult);
    return successMsg({ userResult, secretResult });
  }

  // 更新用户
  async fetchUpdateUser(data) {
    const { ctx } = this;
    const { appid, username, password, email, role, avatar, secret, mchid, public_key, private_key } = data;
    // 更新user表
    const userResult = await ctx.app.mysql.query(fetchUpdateUser, [username, password, email, role, avatar, new Date().getTime(), appid]);
    // 更新program_secret表
    const secretResult = await ctx.app.mysql.query(fetchUpdateSecret, [secret, mchid, public_key, private_key, appid]);
    ctx.logger.info('更新用户', userResult);
    ctx.logger.info('更新密钥', secretResult);
    return successMsg({ userResult, secretResult });
  }

  // 删除用户
  async fetchDeleteUser(data) {
    const { ctx } = this;
    const { appid } = data;
    const userResult = await ctx.app.mysql.query(fetchDeleteUser, [appid]);
    ctx.logger.info('删除用户', userResult);
    return successMsg(userResult);
  }
}

module.exports = UserService;
