'use strict';
const Controller = require('egg').Controller;
const { FILE_PATHS } = require('../../const');

class UploadController extends Controller {
  // 上传文件
  async upload() {
    const { ctx, service } = this;
    const { type } = ctx.request.header;
    let targetDir;
    switch (type) {
      case 'userAvatar': // 用户头像
        targetDir = FILE_PATHS.USER_AVATARS_DIR;
        break;
      case 'returnImage': // 退货图片
        targetDir = FILE_PATHS.RETURN_IMAGES_DIR;
        break;
      case 'categoryImage': // 分类图片
        targetDir = FILE_PATHS.CATEGORY_IMAGES_DIR;
        break;
      case 'miniprogram_payment_files': // 公钥
        targetDir = FILE_PATHS.MINIPROGRAM_PAYMENT_FILES_DIR;
        break;
      default:
        ctx.body = { code: 1001, success: false, message: 'Invalid type' };
        return;
    }
    try {
      const result = await service.upload.uploadFile(ctx, targetDir);
      ctx.body = { code: 0, success: true, message: '', data: result };
    } catch (error) {
      ctx.body = { code: 1000, success: false, message: 'File upload failed', error: error.message };
    }
  }
}
module.exports = UploadController;
