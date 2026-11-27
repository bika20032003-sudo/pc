-- Database Schema for Ministry of Interior (منظومة وزارة الداخلية)
CREATE DATABASE IF NOT EXISTS interior_ministry_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE interior_ministry_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    badge_number VARCHAR(50) DEFAULT 'MOI-001',
    rank_title VARCHAR(100) DEFAULT 'لواء / مدير النظام',
    department VARCHAR(100) DEFAULT 'الإدارة العامة للعمليات والاتصالات',
    role ENUM('super_admin', 'officer', 'operator', 'auditor') DEFAULT 'super_admin',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    avatar VARCHAR(255) NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Departments Table (متوافق مع قاعدة بيانات SQLite المعتمدة)
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    head_name VARCHAR(150) DEFAULT 'غير محدد',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL,
    status ENUM('success', 'failed') DEFAULT 'success',
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles Table (سجل الآليات والمركبات والقوة الآلية)
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_no INT NULL,
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type VARCHAR(150) NOT NULL,
    category ENUM('سيارة مراكز وأقسام', 'سيارة عهدة شخصية', 'دراجة نارية شرطية', 'حافلة نقل وشاحنة خدمات') DEFAULT 'سيارة مراكز وأقسام',
    model_year VARCHAR(20) NULL,
    chassis_number VARCHAR(100) NULL,
    department VARCHAR(150) NOT NULL,
    custodian_name VARCHAR(150) NULL,
    custodian_rank VARCHAR(100) NULL,
    status ENUM('جاهزة للعمل', 'عاطلة', 'حادث سير / في الصيانة') DEFAULT 'جاهزة للعمل',
    fuel_type ENUM('بنزين', 'ديزل') DEFAULT 'بنزين',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
