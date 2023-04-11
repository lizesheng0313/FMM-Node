/*
 * @Author: lizesheng
 * @Date: 2023-04-09 16:01:04
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-09 16:11:35
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/upload.js
 */
'use strict';
const path = require('path');
const fs = require('fs');
const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');

class UploadController extends Controller {
  async uploadImage() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const fileName = stream.filename;
    const target = path.join('../', `showImage/${stream.filename}`);
    const result = await new Promise((resolve, reject) => {
      const remoteFileStream = fs.createWriteStream(target);
      stream.pipe(remoteFileStream);
      let errFlag;
      remoteFileStream.on('error', err => {
        errFlag = true;
        sendToWormhole(stream);
        remoteFileStream.destroy();
        reject(err);
      });

      remoteFileStream.on('finish', async () => {
        if (errFlag) return;
        resolve({ fileName, name: stream.fields.name });
      });
    });
    ctx.body = successMsg(result);
  }
}
module.exports = UploadController;