CREATE DATABASE IF NOT EXISTS demo_db;
USE demo_db;

-- Create customer_details table
CREATE TABLE IF NOT EXISTS customer_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data (8 records)
INSERT IGNORE INTO customer_details (first_name, last_name, email, phone) VALUES
('Amit', 'Sharma', 'amit.sharma@example.com', '9876543210'),
('Priya', 'Verma', 'priya.verma@example.com', '9876501234'),
('Rohan', 'Mehta', 'rohan.mehta@example.com', '9867123456'),
('Neha', 'Kapoor', 'neha.kapoor@example.com', '9856123478'),
('Arjun', 'Singh', 'arjun.singh@example.com', '9845236789'),
('Kavita', 'Jain', 'kavita.jain@example.com', '9834567890'),
('Sahil', 'Gupta', 'sahil.gupta@example.com', '9823456789'),
('Meera', 'Joshi', 'meera.joshi@example.com', '9812345678'),
('Vikas', 'Nair', 'vikas.nair@example.com', '9801234567'),
('Ananya', 'Reddy', 'ananya.reddy@example.com', '9790123456');