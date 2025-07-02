-- KeyPanel MySQL Database Schema
-- cPanel Compatible Version

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: keypanel

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `replit_user_id` varchar(100) DEFAULT NULL,
  `replit_username` varchar(50) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `sessions`
CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `api_settings`
CREATE TABLE `api_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `api_url` text NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `last_balance_check` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `services`
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api_settings_id` int(11) NOT NULL,
  `service_id` varchar(50) NOT NULL,
  `name` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `rate` decimal(10,4) NOT NULL,
  `min_quantity` int(11) DEFAULT 1,
  `max_quantity` int(11) DEFAULT 10000,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `api_settings_id` (`api_settings_id`),
  KEY `category` (`category`),
  KEY `is_active` (`is_active`),
  CONSTRAINT `services_api_fk` FOREIGN KEY (`api_settings_id`) REFERENCES `api_settings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `keys`
CREATE TABLE `keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_value` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `used_at` timestamp NULL DEFAULT NULL,
  `used_by_ip` varchar(45) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_value` (`key_value`),
  KEY `category` (`category`),
  KEY `service_id` (`service_id`),
  KEY `is_used` (`is_used`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `keys_service_fk` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `keys_user_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `orders`
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `api_order_id` varchar(100) DEFAULT NULL,
  `api_settings_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `key_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `target_url` text,
  `charge` decimal(10,4) DEFAULT NULL,
  `start_count` int(11) DEFAULT NULL,
  `status` enum('Pending','In progress','Completed','Partial','Canceled','Processing') DEFAULT 'Pending',
  `remains` int(11) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'TRY',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_checked` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `api_settings_id` (`api_settings_id`),
  KEY `service_id` (`service_id`),
  KEY `key_id` (`key_id`),
  KEY `status` (`status`),
  KEY `api_order_id` (`api_order_id`),
  CONSTRAINT `orders_api_fk` FOREIGN KEY (`api_settings_id`) REFERENCES `api_settings` (`id`),
  CONSTRAINT `orders_service_fk` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `orders_key_fk` FOREIGN KEY (`key_id`) REFERENCES `keys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `logs`
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `user_id` (`user_id`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `login_attempts`
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `attempt_type` enum('admin','user') NOT NULL,
  `status` enum('success','failed_password','failed_security','blocked','failed_math') DEFAULT 'success',
  `user_agent` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ip_address` (`ip_address`),
  KEY `attempt_type` (`attempt_type`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `feedback`
CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) DEFAULT NULL,
  `rating` int(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `message` text,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('pending','responded') DEFAULT 'pending',
  `admin_response` text,
  `admin_response_date` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `rating` (`rating`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `complaints`
CREATE TABLE `complaints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `issue_type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('pending','investigating','resolved','rejected') DEFAULT 'pending',
  `admin_response` text,
  `admin_response_date` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `issue_type` (`issue_type`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Insert sample admin user
INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@keypanel.com', 'admin');

-- Insert sample API settings
INSERT INTO `api_settings` (`name`, `api_url`, `api_key`, `balance`) VALUES
('MedyaBayim', 'https://medyabayim.com/api/v2', 'sample-api-key-123', 100.00),
('ResellerProvider', 'https://resellerprovider.com/api/v2', 'sample-api-key-456', 250.00);

COMMIT;