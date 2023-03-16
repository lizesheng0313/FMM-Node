/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-11 18:03:14
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/constant.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ConstantController extends Controller {
  async getClassiFication() {
    const { ctx } = this;
    let classiFicationList = await this.app.mysql.select('class_ification')
    classiFicationList && classiFicationList.forEach((item) => {
      if (item.parentId) {
        const parentItem = classiFicationList.find((element) => item.parentId === element.value)
        if (!parentItem?.children) {
          parentItem.children = []
        }
        parentItem.children.push(item)
      }
    })
    classiFicationList = classiFicationList.filter(item => !item.parentId)
    ctx.body = successMsg({
      list: classiFicationList
    });
  }
}

module.exports = ConstantController;
