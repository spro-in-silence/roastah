-- Users table data export
-- Generated from ep-dark-mountain-a5hv1hro database

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear existing data
TRUNCATE TABLE users CASCADE;

-- Insert users data
INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, is_roaster_approved, stripe_customer_id, stripe_connect_account_id, address_line_1, address_line_2, city, state, zip_code, mfa_enabled, mfa_secret, backup_codes, last_backup_code_used, created_at, updated_at) VALUES 
('sample1', 'john@summitcoffee.com', 'John', 'Mitchell', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample2', 'sarah@bluemountain.com', 'Sarah', 'Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample3', 'mike@goldengate.com', 'Mike', 'Rodriguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample4', 'emily@cascade.com', 'Emily', 'Thompson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample5', 'david@desertbloom.com', 'David', 'Martinez', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample6', 'anna@lonestar.com', 'Anna', 'Johnson', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample7', 'robert@newengland.com', 'Robert', 'Williams', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample8', 'lisa@sunshine.com', 'Lisa', 'Garcia', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample9', 'alex@mountainview.com', 'Alex', 'Brown', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('sample10', 'maria@coastal.com', 'Maria', 'Davis', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-21 05:47:39.185594', '2025-06-21 05:47:39.185594'),
('dev-buyer-001', 'dev-buyer@roastah.com', NULL, NULL, NULL, 'user', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-07-06 21:49:27.768537', '2025-07-06 22:16:42.256'),
('dev-seller-001', 'dev-seller@roastah.com', NULL, NULL, NULL, 'roaster', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-07-06 21:49:42.043492', '2025-07-06 22:16:54.582'),
('buyer01', 'buyer01@test.com', 'Alice', 'Johnson', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer02', 'buyer02@test.com', 'Bob', 'Smith', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer03', 'buyer03@test.com', 'Carol', 'Davis', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer04', 'buyer04@test.com', 'David', 'Wilson', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer05', 'buyer05@test.com', 'Emma', 'Brown', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer06', 'buyer06@test.com', 'Frank', 'Miller', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer07', 'buyer07@test.com', 'Grace', 'Taylor', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer08', 'buyer08@test.com', 'Henry', 'Anderson', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer09', 'buyer09@test.com', 'Iris', 'Thomas', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('buyer10', 'buyer10@test.com', 'Jack', 'Jackson', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:49.447517', '2025-06-22 14:02:49.447517'),
('seller01', 'seller01@test.com', 'Artisan', 'Coffee', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:59.680836', '2025-06-22 14:02:59.680836'),
('seller02', 'seller02@test.com', 'Mountain', 'Roasts', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:59.680836', '2025-06-22 14:02:59.680836'),
('seller03', 'seller03@test.com', 'City', 'Beans', 'https://replit.com/public/images/mark.png', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-06-22 14:02:59.680836', '2025-06-22 14:02:59.680836'),
('39708187', 'awinash@gmail.com', 'Awinash', 'Raj', 'https://lh3.googleusercontent.com/a/ACg8ocKKKf5oGOOKP4kXJrJrhh7KO1tI9ZQUFJaHYzF5bUJ9kqz9eNQ=s96-c', 'buyer', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '2025-07-06 20:09:24.899', '2025-07-06 20:09:24.899');

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;