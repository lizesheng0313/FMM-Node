/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-01 21:51:47
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/goods.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class GoodsController extends Controller {
  async add() {
    const { ctx } = this;
    const { pictureList } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      createTime: Date.now(),
      isDelete: 1,
      latest: false,
      online: false,
      recommend: false,
    }
    delete rows.pictureList // goods表没有图片列表字段
    const result = await this.app.mysql.insert('goods', rows)
    const goodsPictUreList = []
    pictureList && pictureList.forEach(item => {
      goodsPictUreList.push({
        goodsId: result.insertId,
        type: 0,
        url: item
      })
    })
    const resultPicture = await this.app.mysql.insert('goodsPictureList', goodsPictUreList)
    if (result.affectedRows === 1 && resultPicture.affectedRows >= 1) {
      ctx.body = successMsg();
    }
  }
  async update() {
    const { ctx } = this;
    const { id } = ctx.request.body
    const { pictureList } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      updateTime: Date.now(),
    }
    delete rows.pictureList // goods表没有图片列表字段
    const result = await this.app.mysql.update('goods', rows, {
      where: {
        id
      }
    })
    if (pictureList) {
      await this.app.mysql.query(`DELETE FROM goodsPictureList WHERE goodsId = ${id}`)
      const goodsPictUreList = []
      pictureList && pictureList.forEach(item => {
        goodsPictUreList.push({
          goodsId: id,
          type: 0,
          url: item
        })
      })
      await this.app.mysql.insert('goodsPictureList', goodsPictUreList)
    }
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async getDetails() {
    const { ctx } = this
    const { id } = ctx.query
    const SQL = `SELECT g.*, GROUP_CONCAT(p.url) AS pictureList 
    FROM goods g 
    LEFT JOIN goodsPictureList p ON g.id = p.goodsId 
    WHERE g.id = ${id} AND g.isDelete = 1 
    GROUP BY g.id`
    const result = await this.app.mysql.query(SQL)
    const goods = result[0];
    const pictureList = goods.pictureList ? goods.pictureList.split(",") : [];
    goods.pictureList = pictureList;
    ctx.body = successMsg(goods);
  }
  async deleteGoodsInfo() {
    const { ctx } = this
    const { id } = ctx.request.body
    const SQL = `DELETE g, p FROM goods g LEFT JOIN goodsPictureList p ON g.id = p.goodsId WHERE g.id = ${id}`
    const result = await this.app.mysql.query(SQL)
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    }
  }
  async get() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query
    const SQL = `select g.id, g.name, g.picture, g.price, g.number, g.volume, g.createTime, g.updateTime, g.classiFication, g.online,g.latest, g.quantity, g.recommend, g.order, GROUP_CONCAT(p.url) as pictureList from goods g left join goodsPictureList p on g.id = p.goodsId  WHERE g.isDelete = 1 GROUP BY g.id ORDER BY g.createTime desc limit ${parseInt(pageSize)} offset ${(pageIndex - 1) * pageSize}`
    const totalResult = await this.app.mysql.query(`SELECT COUNT(*) AS total FROM goods WHERE isDelete = 1`)
    const result = await this.app.mysql.query(SQL)
    result.forEach((item) => {
      if (item.pictureList) {
        item.pictureList = item.pictureList.split(",")
      }
    });
    ctx.body = successMsg({
      list: result,
      total: totalResult[0].total,
      pageSize: pageSize,
      pageIndex
    });
  }
}

module.exports = GoodsController;
