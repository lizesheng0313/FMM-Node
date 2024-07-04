-- 系统用户管理
ALTER TABLE user
ADD COLUMN `created_time` bigint DEFAULT NULL COMMENT '创建时间',
ADD COLUMN `updated_time` bigint DEFAULT NULL COMMENT '更新时间',
ADD COLUMN `is_delete` int(1) DEFAULT NULL COMMENT '是否删除';


-- 基础设置
CREATE TABLE `basic_config` (
  `id` int(11) NOT NULL,
  `domin` varchar(255) DEFAULT NULL COMMENT '小程序域名',
  `privacy_policy` varchar(5000) DEFAULT NULL COMMENT '隐私政策',
  `user_agreement` varchar(5000) DEFAULT NULL COMMENT '用户协议',
  `contact_phone` int(15) DEFAULT NULL COMMENT '联系方式',
  `contact_email` varchar(30) DEFAULT NULL COMMENT '联系邮箱',
  `company_addrescompany_address` varchar(255) DEFAULT NULL COMMENT '公司地址',
  `company_description` varchar(255) DEFAULT NULL COMMENT '公司简介',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;