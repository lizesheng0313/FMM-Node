const PAYSTATUS = {
  0: '待支付',
  1: '已支付',
};

const ORDERSTATUS = {
  10: '待发货',
  20: '已发货',
  21: '待揽件',
  30: '已收货',
  40: '已完成',
  50: '退货中',
  60: '已取消',
  70: '待评价',
  80: '退款中',
  90: '已退款',
};

// 退货状态
const RETURNSTATUS = {
  1: '待审核',
  2: '待退货',
  3: '已拒绝',
  4: '退货中',
  5: '已退款',
  6: '已退货',
  20: '待退款',
};

// 文件路径常量
const BASE_DIR = '/var/web/fmm_zero_files';
const IMAGE_DIR = `${BASE_DIR}/images`;
const FILE_DIR = `${BASE_DIR}/files`;

const FILE_PATHS = {
  BASE_DIR,
  IMAGE_DIR,
  USER_AVATARS_DIR: `${IMAGE_DIR}/user_avatars`, // 用户头像
  RETURN_IMAGES_DIR: `${IMAGE_DIR}/return_images`, // 退货图片
  CATEGORY_IMAGES_DIR: `${IMAGE_DIR}/category_images`, // 分类图片
  MINIPROGRAM_PAYMENT_FILES_DIR: `${FILE_DIR}/miniprogram_payment_files`, // 小程序支付文件
  MYSQL_FILES_DIR: `${FILE_DIR}/mysql_files`, // mysql文件
};

module.exports = {
  FILE_PATHS,
  PAYSTATUS,
  ORDERSTATUS,
  RETURNSTATUS,
};
