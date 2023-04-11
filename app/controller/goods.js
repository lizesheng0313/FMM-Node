/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-11 13:38:12
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/goods.js
 */
'use strict';
const { successMsg, errorMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class GoodsController extends Controller {
  async add() {
    const { ctx } = this;
    const { pictureList, sku } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      createTime: Date.now(),
      is_deleted: 0,
      latest: true,
      online: false,
      recommend: false,
    }
    delete rows.sku // sku表
    delete rows.pictureList // goods表没有图片列表字段
    const result = await this.app.mysql.insert('goods', rows)
    await skuProcess(result.insertId, pictureList, sku, this)
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
    else {
      ctx.body = errorMsg('添加错误')
    }
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.request.body
    const { pictureList, sku } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      updateTime: Date.now(),
    }
    delete rows.sku // sku表
    delete rows.pictureList // goods表没有图片列表字段
    const result = await this.app.mysql.update('goods', rows, {
      where: {
        id
      }
    })
    if (pictureList) {
      await this.app.mysql.query(`DELETE FROM goods_picture_list WHERE goodsId = ${id}`)
      await this.app.mysql.query(`DELETE FROM sku_goods WHERE goodsId = ${id}`)
      await skuProcess(id, pictureList, sku, this)
    }
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
    else {
      ctx.body = errorMsg('更新错误')
    }
  }
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
  async delete() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const SQL = `UPDATE goods SET is_deleted = 1 WHERE id = ${id}`;
    const result = await this.app.mysql.query(SQL);
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    } else {
      ctx.body = errorMsg('Delete failed');
    }
  }
  async get() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query;
    const TOTALSQL = `SELECT COUNT(*) as total FROM goods WHERE is_deleted != 1;`
    const total = await this.app.mysql.query(TOTALSQL)
    const SQL = `SELECT g.id, g.name,g.number, g.volume, g.createTime, g.updateTime, g.classiFication, g.online, g.latest, g.recommend, g.order, GROUP_CONCAT(p.url) AS pictureList
    FROM goods g 
    LEFT JOIN goods_picture_list p ON g.id = p.goodsId 
    WHERE g.is_deleted != 1 
    GROUP BY g.id 
    ORDER BY g.createTime DESC 
    LIMIT ? OFFSET ?
    `;
    const result = await this.app.mysql.query(SQL, [parseInt(pageSize), (parseInt(pageIndex) - 1) * parseInt(pageSize)]);
    result.forEach((item) => {
      if (item.pictureList) {
        item.pictureList = item.pictureList.split(",");
      }
    });
    ctx.body = successMsg({
      list: result,
      total,
      pageSize: pageSize,
      pageIndex
    });
  }

}
async function skuProcess(goodsId, pictureList, sku, that) {
  // 图片插入
  const goodsPictUreList = pictureList?.map(url => ({
    goodsId,
    type: 0,
    url
  }))
  await that.app.mysql.insert('goods_picture_list', goodsPictUreList)
  // sku插入
  const skuRows = sku.map(item => {
    const nameList = Object.keys(item).filter(key => key.startsWith('name'))
    return {
      goodsId,
      skuStock: item.skuStock,
      skuPrice: item.skuPrice,
      skuOriginPrice: item.skuOriginPrice,
      goods_picture: item.goods_picture,
      cost_price: item.cost_price,
      skuId: nameList.map(key => item[key]).join(',')
    }
  })
  await that.app.mysql.insert('sku_goods', skuRows)
}

module.exports = GoodsController;
