-- OtoKiwi Database Setup for MySQL/cPanel
-- This file creates all necessary tables for the OtoKiwi system

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS otokiwi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE otokiwi_db;

-- Users table (required for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table (for session management)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT NOT NULL,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APIs table (for API management)
CREATE TABLE IF NOT EXISTS apis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    last_balance_check TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table (for service management)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_id INT NOT NULL,
    service_id VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    min_quantity INT NOT NULL,
    max_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE
);

-- Keys table (for key management)
CREATE TABLE IF NOT EXISTS `keys` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    key_value TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Orders table (for order management)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    key_id INT NOT NULL,
    service_id INT NOT NULL,
    external_order_id VARCHAR(255),
    quantity INT NOT NULL,
    target_url TEXT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'partial') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (key_id) REFERENCES `keys`(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Logs table (for activity logging)
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Feedback table (for user feedback)
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NULL,
    type ENUM('feedback', 'complaint') NOT NULL,
    rating INT NULL,
    message TEXT NOT NULL,
    admin_response TEXT NULL,
    status ENUM('pending', 'responded', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Login attempts table (for security logging)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    status ENUM('success', 'failed_password', 'failed_security', 'blocked') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_expires ON sessions(expires);
CREATE INDEX idx_keys_service ON `keys`(service_id);
CREATE INDEX idx_keys_used ON `keys`(is_used);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_created ON logs(created_at);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);

-- Insert default admin user
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@otokiwi.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

-- Insert some sample APIs (optional)
INSERT INTO apis (name, base_url, api_key) VALUES 
('MedyaBayim', 'https://api.medyabayim.com/v2', 'your-api-key-here'),
('ResellerProvider', 'https://api.resellerprovider.com/v2', 'your-api-key-here')
ON DUPLICATE KEY UPDATE name = VALUES(name);

COMMIT;