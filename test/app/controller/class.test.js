/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-14 15:31:27
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/test/app/controller/class.test.js
 */
'use strict';

const { app } = require('egg-mock/bootstrap');

describe('GET /api/goods/getClassiFication', () => {
  it('should get classification list successfully', async () => {
    // 模拟请求参数
    const typeId = 1;
    const res = await app.httpRequest()
      .get('/api/goods/getClassiFication')
      .query({ typeId })
      .expect(200);
    console.log(res.body.data.leftList, '---res');
    console.log(res.body.data.rightList, '---res');
  });
});

