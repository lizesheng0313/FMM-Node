"use strict";
const { successMsg, errorMsg } = require("../../utils/utils");
const { Controller } = require("egg");

class PermissionController extends Controller {
  async getUserList() {
    const { ctx } = this;
    const { eid } = ctx.user;
    const { pageIndex = 1, pageSize = 10 } = ctx.query;
    const limit = parseInt(pageSize);
    const offset = (parseInt(pageIndex) - 1) * limit;

    try {
      const userListQuery = `
        SELECT 
          u.*,
          o1.id AS order_id,
          o1.create_time AS order_create_time,
          o1.goods_name
        FROM program_user u
        LEFT JOIN goods_order o1 ON u.user_id = o1.user_id
        WHERE u.eid = ?
        ORDER BY 
          CASE
            WHEN u.create_time IS NOT NULL THEN u.create_time
            ELSE o1.create_time
          END DESC; 
      `;
      const userList = await this.app.mysql.query(userListQuery, [eid]);

      const processedUserList = userList.reduce((result, user) => {
        const existingUser = result.find(
          (item) => item.user_id === user.user_id
        );
        if (existingUser) {
          if (user.order_id) {
            existingUser.children.push({
              order_id: user.order_id,
              order_create_time: user.order_create_time,
              goods_name: user.goods_name,
            });
          }
        } else {
          const { order_id, order_create_time, goods_name, ...rest } = user;
          const newUser = {
            ...rest,
            children: order_id
              ? [
                  {
                    order_id,
                    order_create_time,
                    goods_name,
                  },
                ]
              : [],
          };
          result.push(newUser);
        }
        return result;
      }, []);

      const paginatedUserList = processedUserList.slice(offset, offset + limit);
      ctx.body = successMsg({
        list: paginatedUserList,
        total: processedUserList.length,
        pageIndex: parseInt(pageIndex),
        pageSize: limit,
      });
    } catch (error) {
      // 处理错误并返回错误响应
      console.log(error);
      ctx.status = 500;
      ctx.body = { error };
    }
  }
}

module.exports = PermissionController;
