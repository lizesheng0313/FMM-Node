'use strict';
const { successMsg, errorMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ProgrmHomeController extends Controller {
  // 获取banner
  async getBanner() {
    const { ctx } = this;
    const { eid } = ctx.query;
    try {
      const result = await this.app.mysql.select('program_swiper', {
        where: { eid, display: 1 },
      });
      ctx.body = successMsg({
        list: result,
      });
    } catch (error) {
      ctx.logger.error('swiper', error);
      ctx.status = 500;
      ctx.body = errorMsg(error);
    }
  }
  // 获取分类
  async getClassifcation() {
    const { ctx } = this;
    const { is_show_home, eid } = ctx.query;
    const whereConditions = [`eid = ?`, `(is_delete = 0 OR is_delete IS NULL)`];
    const queryParams = [eid];
    if (is_show_home !== undefined) {
      whereConditions.push(`is_show_home = ?`);
      queryParams.push(is_show_home);
    }
    const sql = `
    SELECT *,
      CASE 
        WHEN parentId IS NULL THEN id
        ELSE parentId
      END AS newParentId
    FROM class_ification
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY \`order\` ASC
  `;
    try {
      const result = await this.app.mysql.query(sql, queryParams);
      result.forEach((item) => {
        if (item.newParentId === null) {
          item.newParentId = item.id;
        }
      });
      ctx.body = successMsg({
        list: result,
      });
    } catch (error) {
      ctx.logger.error('getClassificationList', error);
      ctx.status = 500;
      ctx.body = errorMsg(error);
    }
  }

  // 获取推荐分类
  async getClassRecommendIfcation() {
    const { ctx } = this;
    const { eid } = ctx.query;
    const whereConditions = [`eid = ?`, `(is_delete = 0 OR is_delete IS NULL)`, `recommend_class = 1`];
    const queryParams = [eid];
    const sql = `
    SELECT *,
      CASE 
        WHEN parentId IS NULL THEN id
        ELSE parentId
      END AS newParentId
    FROM class_ification
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY \`order\` ASC
   `;
    try {
      const result = await this.app.mysql.query(sql, queryParams);
      result.forEach((item) => {
        if (item.newParentId === null) {
          item.newParentId = item.id;
        }
      });
      ctx.body = successMsg({
        list: result,
      });
    } catch (error) {
      ctx.logger.error('获取推荐分类报错', error);
      ctx.status = 500;
      ctx.body = errorMsg(error);
    }
  }

  // 获取推荐
  async getHomeGoods() {
    const { ctx } = this;
    const { recommend, latest, eid } = ctx.query;
    // 构建查询条件和参数
    const conditions = ['g.is_deleted != 1', 'g.online = 1', 'g.eid = ?'];
    const params = [eid];
    if (latest) {
      conditions.push('g.latest = 1');
    }
    if (recommend) {
      conditions.push('g.recommend = 1');
    }
    const conditionsStr = conditions.join(' AND ');
    const SQL = `
    SELECT g.id, g.name, g.online, g.volume,
    (SELECT sku_goods.skuPrice
     FROM sku_goods
     WHERE sku_goods.goodsId = (SELECT sku_goods.goodsId FROM sku_goods WHERE sku_goods.goodsId = g.id LIMIT 1)
     LIMIT 1) AS skuPrice, 
    (SELECT p.url
     FROM goods_picture_list p
     WHERE p.goodsId = g.id
     LIMIT 1) AS pictureUrl
    FROM goods g
    WHERE ${conditionsStr}
    ORDER BY CAST(g.volume AS UNSIGNED) DESC;
  `;

    try {
      const result = await this.app.mysql.query(SQL, params);
      ctx.body = successMsg({
        list: result,
      });
    } catch (error) {
      ctx.logger.error('home_get_recommed', error);
      ctx.status = 500;
      ctx.body = errorMsg(error);
    }
  }

  // 获取某一个分类下的商品
  async getClassGoods() {
    const { ctx } = this;
    const { classification, pageIndex = 1, pageSize = 10, eid } = ctx.query;
    const limit = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;

    // 查询商品列表
    const result = await ctx.app.mysql.query(
      `SELECT g.id, g.name, g.online, g.volume, g.classification,
    (SELECT url FROM goods_picture_list WHERE goodsId = g.id LIMIT 1) AS pictureUrl,
    (SELECT skuPrice FROM sku_goods WHERE goodsId = g.id LIMIT 1) AS price
    FROM goods g
    WHERE g.is_deleted != ? AND JSON_CONTAINS(classification, ?) AND g.online = 1 AND g.eid = ?
    ORDER BY g.order DESC, g.volume DESC
    LIMIT ?, ?`,
      [1, classification, eid, offset, limit]
    );

    // 查询商品总数
    const totalResult = await ctx.app.mysql.query('SELECT COUNT(*) as total FROM goods WHERE is_deleted != 1 AND JSON_CONTAINS(classification, ?) AND online = 1 AND eid = ?', [classification, eid]);
    const total = totalResult[0].total;

    ctx.body = successMsg({
      list: result,
      total,
    });
  }

  // 搜索接口
  async searchGoods() {
    const { ctx } = this;
    const { keyword, pageIndex = 1, pageSize = 10, eid } = ctx.query;
    const limit = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;

    const [result, totalCount] = await Promise.all([
      ctx.app.mysql.query(
        `SELECT DISTINCT g.id, g.name, g.introduction, g.online, g.createTime, g.volume,
          (SELECT url FROM goods_picture_list WHERE goodsId = g.id LIMIT 1) AS pictureUrl, 
          (SELECT skuPrice FROM sku_goods WHERE goodsId = g.id LIMIT 1) AS price 
        FROM goods g 
        LEFT JOIN class_ification c ON g.classification LIKE CONCAT('%', c.id, '%')
        WHERE g.is_deleted != ? AND g.eid = ? AND (
          g.name LIKE ? OR g.introduction LIKE ? OR c.label LIKE ?
        ) AND g.online = 1 
        ORDER BY g.createTime DESC
        LIMIT ?, ?`,
        [1, eid, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, offset, limit]
      ),
      ctx.app.mysql.query(
        `SELECT COUNT(DISTINCT g.id) AS totalCount FROM goods g
        LEFT JOIN class_ification c ON g.classification LIKE CONCAT('%', c.id, '%')
        WHERE g.is_deleted != ? AND g.eid = ? AND (
          g.name LIKE ? OR g.introduction LIKE ? OR c.label LIKE ?
        ) AND g.online = 1`,
        [1, eid, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      ),
    ]);

    ctx.body = successMsg({
      list: result,
      total: totalCount[0].totalCount,
      pageIndex,
      pageSize,
    });
  }
}

module.exports = ProgrmHomeController;
