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
      const skuObj = { skuStock: item.skuStock, skuPrice: item.skuPrice, goods_picture: item.goods_picture, cost_price: item.cost_price, skuOriginPrice: item.skuOriginPrice };
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
}

module.exports = ProgrmGoodsController