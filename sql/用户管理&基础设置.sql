-- 系统用户管理
ALTER TABLE user
ADD COLUMN `created_time` bigint DEFAULT NULL COMMENT '创建时间',
ADD COLUMN `updated_time` bigint DEFAULT NULL COMMENT '更新时间',
ADD COLUMN `is_delete` int(1) DEFAULT NULL COMMENT '是否删除';


-- 基础设置
CREATE TABLE `basic_config` (
  `eid` varchar(30) CHARACTER SET utf8 NOT NULL COMMENT '小程序id',
  `domin` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '小程序域名',
  `privacy_policy` varchar(5000) CHARACTER SET utf8 DEFAULT NULL COMMENT '隐私政策',
  `user_agreement` varchar(5000) CHARACTER SET utf8 DEFAULT NULL COMMENT '用户协议',
  `contact_phone` varchar(20) CHARACTER SET utf8 DEFAULT NULL COMMENT '联系方式',
  `contact_email` varchar(30) CHARACTER SET utf8 DEFAULT NULL COMMENT '联系邮箱',
  `company_address` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '公司地址',
  `company_description` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '公司简介',
  `created_time` bigint(11) DEFAULT NULL,
  `updated_time` bigint(11) DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '网站标题',
  PRIMARY KEY (`eid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='基础设置';


-- 菜单 调整
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(20) NOT NULL,
  `menuUrl` varchar(40) DEFAULT NULL,
  `icon` varchar(10) NOT NULL,
  `order` int(11) NOT NULL,
  `funcode` varchar(100) NOT NULL,
  `parentId` int(11) DEFAULT NULL,
  `display` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COMMENT='菜单管理';

-- ----------------------------
-- Records of menu
-- ----------------------------
BEGIN;
INSERT INTO `menu` VALUES (1, '系统首页', '/dashboard', 'Odometer', 0, '1001', NULL, NULL);
INSERT INTO `menu` VALUES (2, '小程序用户管理', '/permission/user_mangae', 'Odometer', 3, '100201', 3, NULL);
INSERT INTO `menu` VALUES (3, '小程序设置\n', '/permission', 'Odometer', 4, '1002', NULL, NULL);
INSERT INTO `menu` VALUES (6, '商品管理', '/goods', 'Odometer', 2, '1003', NULL, NULL);
INSERT INTO `menu` VALUES (7, '商品列表', '/goods/goods_list', 'Odometer', 1, '100301', 6, NULL);
INSERT INTO `menu` VALUES (8, '订单管理', '/order', 'Odometer', 5, '1004', NULL, NULL);
INSERT INTO `menu` VALUES (9, '订单列表', '/order/list', 'dd', 2, '100401', 8, NULL);
INSERT INTO `menu` VALUES (10, '退货列表', '/order/return', 'd', 45, '100402', 8, NULL);
INSERT INTO `menu` VALUES (11, '分类管理', '/category', 'Odometer', 24, '100202', 3, NULL);
INSERT INTO `menu` VALUES (12, '广告位管理', '/adv', 'Odometer', 24, '100203', 3, NULL);
INSERT INTO `menu` VALUES (14, '基础设置', '/basic', 'Odometer', 6, '100501', NULL, NULL);
INSERT INTO `menu` VALUES (15, '后台用户管理', '/user', 'Odometer', 6, '100502', NULL, NULL);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
