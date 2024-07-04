const { Service } = require('egg');
const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const { v4: uuidv4 } = require('uuid');

class UploadService extends Service {
  /**
   * 通用文件上传方法
   * @param {object} ctx - Egg.js 上下文
   * @param {string} targetDir - 目标目录
   * @returns {Promise<object>} - 返回文件上传结果
   */
  async uploadFile(ctx, targetDir) {
    const stream = await ctx.getFileStream();
    const uuid = uuidv4();
    const ext = path.extname(stream.filename);
    const baseName = path.basename(stream.filename, ext);
    const fileName = `${baseName}-${uuid}${ext}`;
    ensureDirExist(targetDir); // 确保目录存在
    const target = path.join(targetDir, fileName);
    return new Promise((resolve, reject) => {
      const remoteFileStream = fs.createWriteStream(target);
      stream.pipe(remoteFileStream);
      let errFlag;
      remoteFileStream.on('error', (err) => {
        errFlag = true;
        sendToWormhole(stream);
        remoteFileStream.destroy();
        reject(err);
      });
      remoteFileStream.on('finish', () => {
        if (errFlag) return;
        resolve({ fileName, path: target });
      });
    });
  }
}

/**
 * 确保目录存在，如果不存在则创建目录
 * @param {string} dir - 目录路径
 */
const ensureDirExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports = UploadService;
