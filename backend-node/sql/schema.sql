-- 用户表
CREATE TABLE IF NOT EXISTS shop_user (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openId VARCHAR(64) NOT NULL,
  nickName VARCHAR(64) NOT NULL DEFAULT '',
  avatarUrl VARCHAR(512) NOT NULL DEFAULT '',
  phone VARCHAR(32) NOT NULL DEFAULT '',
  name VARCHAR(64) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL DEFAULT '',
  location JSON NULL,
  role INT DEFAULT 1 COMMENT '1:User, 2:Booster',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_openId (openId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 首页轮播图
CREATE TABLE IF NOT EXISTS home_swiper (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  images JSON NOT NULL COMMENT 'Array of image URLs',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品SPU表
CREATE TABLE IF NOT EXISTS spu (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  cover_image VARCHAR(512) NOT NULL,
  swiper_images JSON NOT NULL COMMENT 'Array of image URLs',
  status VARCHAR(32) NOT NULL DEFAULT 'selling',
  priority INT DEFAULT 0,
  cate_id VARCHAR(64) DEFAULT '',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品SKU表
CREATE TABLE IF NOT EXISTS sku (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  spu_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(128) NOT NULL,
  image VARCHAR(512) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  attr_json JSON NULL COMMENT 'Attributes like mode, etc.',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_spu (spu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表 (普通商品)
CREATE TABLE IF NOT EXISTS shop_order (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  address_json JSON NULL,
  items_json JSON NOT NULL COMMENT 'Snapshot of items',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 接单广场订单表 (代练/陪玩)
CREATE TABLE IF NOT EXISTS booster_order (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  status VARCHAR(32) NOT NULL DEFAULT 'TO_SEND',
  total_amount DECIMAL(10, 2) NOT NULL,
  max_boosters INT DEFAULT 1,
  boosters_json JSON NULL COMMENT 'Array of booster user IDs',
  creator_id BIGINT UNSIGNED NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化数据 (可选)
INSERT INTO home_swiper (images) VALUES ('["https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/1.png", "https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/2.png"]') ON DUPLICATE KEY UPDATE id=id;

INSERT INTO spu (name, cover_image, swiper_images, status, priority) VALUES 
('王者荣耀上分', 'https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/2.png', '["https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/2.png"]', 'selling', 10),
('和平精英上分', 'https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/3.png', '["https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/3.png"]', 'selling', 5);

INSERT INTO sku (spu_id, name, image, price, stock) VALUES 
(1, '王者荣耀上分', 'https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/2.png', 9.9, 999),
(2, '和平精英上分', 'https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/3.png', 12.9, 999);

INSERT INTO booster_order (status, total_amount, max_boosters, createdAt) VALUES 
('TO_SEND', 50.00, 1, NOW()),
('TO_RECEIVE', 80.00, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR));
