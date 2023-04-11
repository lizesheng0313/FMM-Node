/*
 * @Author: lizesheng
 * @Date: 2023-03-29 17:23:28
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-08 08:24:45
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programGoods.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ProgrmGoodsController extends Controller {
  async getDetails() {
    const { ctx } = this;
    const { id } = ctx.query;

    // 获取商品信息
    const goodsSQL = `SELECT * FROM goods WHERE id = ${id} AND is_deleted != 1`;
    const goodsResult = await this.app.mysql.query(goodsSQL);
    const goods = goodsResult[0];

    // 获取商品图片列表
    const pictureSQL = `SELECT url FROM goods_picture_list WHERE goodsId = ${id}`;
    const pictureResult = await this.app.mysql.query(pictureSQL);
    const pictureList = pictureResult.map(item => item.url);

    // 获取SKU信息
    const skuSQL = `SELECT * FROM sku_goods WHERE goodsId = ${id}`;
    const skuResult = await this.app.mysql.query(skuSQL);
    const sku = skuResult.map(item => {
      const skuIdArr = item.skuId.split(',');
      const skuObj = { skuId: item.skuId, skuStock: item.skuStock, skuPrice: item.skuPrice, goods_picture: item.goods_picture, skuOriginPrice: item.skuOriginPrice };
      skuIdArr.forEach((name, index) => {
        skuObj[`name${index}`] = name;
      });
      return skuObj;
    });

    // 组装数据
    const data = {
      ...goods,
      pictureList,
      sku,
    };

    ctx.body = successMsg(data);
  }
  async getClassiFication() {
    const { ctx } = this;
    const { value } = ctx.query;
    let classiFicationList = await this.app.mysql.select('class_ification');
    if (value) {
      classiFicationList = classiFicationList.filter(item => item.parentId === value);
    } else {
      classiFicationList = classiFicationList.filter(item => !item.parentId);
    }
    classiFicationList && classiFicationList.forEach((item) => {
      if (item.parentId) {
        const parentItem = classiFicationList.find((element) => item.parentId === element.value)
        if (!parentItem?.children) {
          parentItem.children = []
        }
        parentItem.children.push(item)
      }
    })
    ctx.body = successMsg({
      list: classiFicationList
    });
  }
}


module.exports = ProgrmGoodsController