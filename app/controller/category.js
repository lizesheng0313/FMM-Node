/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-14 15:18:16
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/category.js
 */
"use strict";
const { successMsg, errorMsg } = require("../../utils/utils");
const { Controller } = require("egg");

class CategoryController extends Controller {
  async addCategory() {
    const { ctx } = this;
    const {
      parentId,
      label,
      icon = null,
      order,
      is_show_home = null,
    } = ctx.request.body;
    const result = await this.app.mysql.insert("class_ification", {
      parentId,
      label,
      icon,
      is_show_home,
      order,
      eid: ctx.user.eid,
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg(result.insertId);
    } else {
      ctx.body = errorMsg("添加分类失败");
    }
  }
  async editCategory() {
    const { ctx } = this;
    const {
      id,
      parentId,
      label,
      icon = null,
      order,
      is_show_home = null,
    } = ctx.request.body;
    // 检查分类是否存在
    const category = await this.app.mysql.get("class_ification", { id });
    if (!category) {
      ctx.body = errorMsg("该分类不存在");
      return;
    }
    const result = await this.app.mysql.update(
      "class_ification",
      {
        parentId,
        label,
        icon,
        order,
        is_show_home,
      },
      { where: { id } }
    );
    if (result.affectedRows === 1) {
      ctx.body = successMsg(null, "编辑分类成功");
    } else {
      ctx.body = errorMsg("编辑分类失败");
    }
  }
  async deleteCategory() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const category = await this.app.mysql.get("class_ification", { id });
    if (!category) {
      ctx.body = errorMsg("该分类不存在");
      return;
    }
    // 检查是否有子分类
    const children = await this.app.mysql.select("class_ification", {
      where: { parentId: id },
    });
    if (children.length > 0) {
      ctx.body = errorMsg("该分类存在子分类，无法删除");
      return;
    }
    // 删除分类
    const result = await this.app.mysql.update("class_ification", {
      id,
      is_delete: 1,
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    } else {
      ctx.body = errorMsg("删除分类失败");
    }
  }
}

module.exports = CategoryController;
