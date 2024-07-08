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