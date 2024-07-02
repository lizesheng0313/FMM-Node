ALTER TABLE program_swiper
ADD COLUMN `display` int(1) DEFAULT NULL COMMENT '1显示0隐藏',
ADD COLUMN `title` varchar(255) DEFAULT NULL COMMENT '标题',
ADD COLUMN `created_time` datetime DEFAULT NULL COMMENT '创建时间',
ADD COLUMN `updated_time` datetime DEFAULT NULL COMMENT '更新时间';

