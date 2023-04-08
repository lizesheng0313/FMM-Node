/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-07 11:16:25
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/category.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class CategoryController extends Controller {
  async addCategory() {
    const { ctx } = this;
    const { name, parentId } = ctx.request.body;
    // 检查分类名是否已存在
    const category = await this.app.mysql.get('category', { name });
    if (category) {
      ctx.body = failMsg('该分类名已存在');
      return;
    }
    // 添加分类
    const result = await this.app.mysql.insert('category', { name, parentId });
    if (result.affectedRows === 1) {
      ctx.body = successMsg(result.insertId, '添加分类成功');
    } else {
      ctx.body = failMsg('添加分类失败');
    }
  }
  async editCategory() {
    const { ctx } = this;
    const { id, name } = ctx.request.body;
    // 检查分类是否存在
    const category = await this.app.mysql.get('category', { id });
    if (!category) {
      ctx.body = failMsg('该分类不存在');
      return;
    }
    // 检查分类名是否已存在
    const existingCategory = await this.app.mysql.get('category', { name });
    if (existingCategory && existingCategory.id !== category.id) {
      ctx.body = failMsg('该分类名已存在');
      return;
    }
    // 编辑分类
    const result = await this.app.mysql.update('category', { name }, { where: { id } });
    if (result.affectedRows === 1) {
      ctx.body = successMsg(null, '编辑分类成功');
    } else {
      ctx.body = failMsg('编辑分类失败');
    }
  }
  async deleteCategory() {
    const { ctx } = this;
    const { id } = ctx.params;
    // 检查分类是否存在
    const category = await this.app.mysql.get('category', { id });
    if (!category) {
      ctx.body = failMsg('该分类不存在');
      return;
    }
    // 检查是否有子分类
    const children = await this.app.mysql.select('category', { where: { parentId: id } });
    if (children.length > 0) {
      ctx.body = failMsg('该分类存在子分类，无法删除');
      return;
    }
    // 删除分类
    const result = await this.app.mysql.delete('category', { id });
    if (result.affectedRows === 1) {
      ctx.body = successMsg(null, '删除分类成功');
    } else {
      ctx.body = failMsg('删除分类失败');
    }
  }
}

module.exports = CategoryController;
