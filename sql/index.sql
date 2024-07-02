ALTER TABLE program_swiper
ADD COLUMN `display` int(1) DEFAULT NULL COMMENT '1显示0隐藏',
ADD COLUMN `title` varchar(255) DEFAULT NULL COMMENT '标题',
ADD COLUMN `created_time` datetime DEFAULT NULL COMMENT '创建时间',
ADD COLUMN `updated_time` datetime DEFAULT NULL COMMENT '更新时间';



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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COMMENT='菜单管理';

-- ----------------------------
-- Records of menu
-- ----------------------------
BEGIN;
INSERT INTO `menu` VALUES (1, '系统首页', '/dashboard', 'Odometer', 0, '1001', NULL, NULL);
INSERT INTO `menu` VALUES (2, '用户管理', '/permission/user_mangae', 'Odometer', 3, '100201', 3, NULL);
INSERT INTO `menu` VALUES (3, '小程序管理', '/permission', 'Odometer', 4, '1002', NULL, NULL);
INSERT INTO `menu` VALUES (6, '商品管理', '/goods', 'Odometer', 2, '1003', NULL, NULL);
INSERT INTO `menu` VALUES (7, '商品列表', '/goods/goods_list', 'Odometer', 1, '100301', 6, NULL);
INSERT INTO `menu` VALUES (8, '订单管理', '/order', 'Odometer', 5, '1004', NULL, NULL);
INSERT INTO `menu` VALUES (9, '订单列表', '/order/list', 'dd', 2, '100401', 8, NULL);
INSERT INTO `menu` VALUES (10, '退货列表', '/order/return', 'd', 45, '100402', 8, NULL);
INSERT INTO `menu` VALUES (11, '分类管理', '/category', 'Odometer', 24, '100202', 3, NULL);
INSERT INTO `menu` VALUES (12, '广告位管理', '/adv', 'Odometer', 24, '100203', 3, NULL);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
