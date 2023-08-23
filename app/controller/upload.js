"use strict";
const path = require("path");
const fs = require("fs");
const Controller = require("egg").Controller;
const sendToWormhole = require("stream-wormhole");
const { successMsg } = require("../../utils/utils");

class UploadController extends Controller {
  async uploadImage() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const fileName = stream.filename;
    const target = path.join("../", `showImage/${stream.filename}`);
    const result = await new Promise((resolve, reject) => {
      const remoteFileStream = fs.createWriteStream(target);
      stream.pipe(remoteFileStream);
      let errFlag;
      remoteFileStream.on("error", (err) => {
        errFlag = true;
        sendToWormhole(stream);
        remoteFileStream.destroy();
        reject(err);
      });

      remoteFileStream.on("finish", async () => {
        if (errFlag) return;
        resolve({ fileName, name: stream.fields.name });
      });
    });
    ctx.body = successMsg(result);
  }
  // 上传分类
  async uploadTypeImage() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const fileName = stream.filename;
    const target = path.join("../", `showImage/type_icon/${stream.filename}`);
    const result = await new Promise((resolve, reject) => {
      const remoteFileStream = fs.createWriteStream(target);
      stream.pipe(remoteFileStream);
      let errFlag;
      remoteFileStream.on("error", (err) => {
        errFlag = true;
        sendToWormhole(stream);
        remoteFileStream.destroy();
        reject(err);
      });

      remoteFileStream.on("finish", async () => {
        if (errFlag) return;
        resolve({ fileName, name: stream.fields.name });
      });
    });
    ctx.body = successMsg(result);
  }
}
module.exports = UploadController;
