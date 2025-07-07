-- Roastah Database Complete Replication Script
-- This script replicates the entire database structure and data from old to new database

-- Connect to new database and execute this script
-- Make sure to run: npm run db:push first to create the schema

\echo 'Starting complete database replication...'

-- 1. First, create the schema in the new database (run this separately)
-- npm run db:push

-- 2. Replicate all data from source database
-- Note: Replace the connection string with your actual old DATABASE_URL

-- Create dblink extension if not exists
CREATE EXTENSION IF NOT EXISTS dblink;

-- Test connection to source database
SELECT dblink_connect('source_db', 'postgresql://neondb_owner:npg_QGvT8dxgBbu0@ep-dark-mountain-a5hv1hro.us-east-2.aws.neon.tech/neondb?sslmode=require');

\echo 'Connected to source database, starting data replication...'

-- Disable triggers for faster import
SET session_replication_role = replica;

-- Clear existing data in new database
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE roasters CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE wishlist CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE order_tracking CASCADE;
TRUNCATE TABLE realtime_connections CASCADE;
TRUNCATE TABLE favorite_roasters CASCADE;
TRUNCATE TABLE commissions CASCADE;
TRUNCATE TABLE seller_analytics CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE bulk_uploads CASCADE;
TRUNCATE TABLE disputes CASCADE;
TRUNCATE TABLE message_subjects CASCADE;
TRUNCATE TABLE seller_messages CASCADE;
TRUNCATE TABLE message_recipients CASCADE;
TRUNCATE TABLE gift_cards CASCADE;

\echo 'Cleared existing data, importing users...'

-- Import users
INSERT INTO users 
SELECT * FROM dblink('source_db', 'SELECT id, email, first_name, last_name, profile_image_url, role, is_roaster_approved, stripe_customer_id, stripe_connect_account_id, address_line_1, address_line_2, city, state, zip_code, mfa_enabled, mfa_secret, backup_codes, last_backup_code_used, created_at, updated_at FROM users') 
AS t(id varchar, email varchar, first_name varchar, last_name varchar, profile_image_url varchar, role varchar, is_roaster_approved boolean, stripe_customer_id varchar, stripe_connect_account_id varchar, address_line_1 varchar, address_line_2 varchar, city varchar, state varchar, zip_code varchar, mfa_enabled boolean, mfa_secret varchar, backup_codes text[], last_backup_code_used timestamp, created_at timestamp, updated_at timestamp);

\echo 'Imported users, importing roasters...'

-- Import roasters
INSERT INTO roasters 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, business_name, business_type, business_address, city, state, zip_code, description, roasting_experience, philosophy, is_active, total_reviews, average_rating, total_sales, total_revenue, response_time, completion_rate, leaderboard_score, created_at, updated_at FROM roasters') 
AS t(id serial, user_id varchar, business_name varchar, business_type varchar, business_address varchar, city varchar, state varchar, zip_code varchar, description text, roasting_experience text, philosophy text, is_active boolean, total_reviews integer, average_rating numeric, total_sales integer, total_revenue numeric, response_time integer, completion_rate integer, leaderboard_score integer, created_at timestamp, updated_at timestamp);

\echo 'Imported roasters, importing products...'

-- Import products
INSERT INTO products 
SELECT * FROM dblink('source_db', 'SELECT id, roaster_id, name, description, price, stock_quantity, origin, roast_level, process, altitude, varietal, tasting_notes, images, state, is_unlisted, is_preorder, is_private, is_out_of_stock, is_scheduled, published_at, scheduled_publish_at, preorder_shipping_date, archived_at, rejected_at, rejection_reason, reviewed_by, reviewed_at, review_notes, is_active, created_at, updated_at FROM products') 
AS t(id serial, roaster_id integer, name varchar, description text, price numeric, stock_quantity integer, origin varchar, roast_level varchar, process varchar, altitude varchar, varietal varchar, tasting_notes text, images text[], state varchar, is_unlisted boolean, is_preorder boolean, is_private boolean, is_out_of_stock boolean, is_scheduled boolean, published_at timestamp, scheduled_publish_at timestamp, preorder_shipping_date date, archived_at timestamp, rejected_at timestamp, rejection_reason text, reviewed_by varchar, reviewed_at timestamp, review_notes text, is_active boolean, created_at timestamp, updated_at timestamp);

\echo 'Imported products, importing orders...'

-- Import orders
INSERT INTO orders 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, stripe_payment_intent_id, status, total_amount, shipping_address, billing_address, notes, created_at, updated_at FROM orders') 
AS t(id serial, user_id varchar, stripe_payment_intent_id varchar, status varchar, total_amount numeric, shipping_address jsonb, billing_address jsonb, notes text, created_at timestamp, updated_at timestamp);

\echo 'Imported orders, importing order items...'

-- Import order_items
INSERT INTO order_items 
SELECT * FROM dblink('source_db', 'SELECT id, order_id, product_id, roaster_id, quantity, price, grind_size, status, created_at FROM order_items') 
AS t(id serial, order_id integer, product_id integer, roaster_id integer, quantity integer, price numeric, grind_size varchar, status varchar, created_at timestamp);

\echo 'Imported order items, importing cart items...'

-- Import cart_items
INSERT INTO cart_items 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, product_id, quantity, grind_size, created_at FROM cart_items') 
AS t(id serial, user_id varchar, product_id integer, quantity integer, grind_size varchar, created_at timestamp);

\echo 'Imported cart items, importing remaining tables...'

-- Import remaining tables with data
INSERT INTO reviews 
SELECT * FROM dblink('source_db', 'SELECT id, product_id, user_id, rating, comment, helpful_count, created_at FROM reviews') 
AS t(id serial, product_id integer, user_id varchar, rating integer, comment text, helpful_count integer, created_at timestamp);

INSERT INTO wishlist 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, product_id, created_at FROM wishlist') 
AS t(id serial, user_id varchar, product_id integer, created_at timestamp);

INSERT INTO notifications 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, type, title, message, is_read, created_at FROM notifications') 
AS t(id serial, user_id varchar, type varchar, title varchar, message text, is_read boolean, created_at timestamp);

-- Import other tables that may have data
INSERT INTO favorite_roasters 
SELECT * FROM dblink('source_db', 'SELECT id, user_id, roaster_id, created_at FROM favorite_roasters') 
AS t(id serial, user_id varchar, roaster_id integer, created_at timestamp);

INSERT INTO sessions 
SELECT * FROM dblink('source_db', 'SELECT sid, sess, expire FROM sessions') 
AS t(sid varchar, sess json, expire timestamp);

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Update sequences to match the imported data
SELECT setval('roasters_id_seq', (SELECT MAX(id) FROM roasters));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
SELECT setval('cart_items_id_seq', (SELECT MAX(id) FROM cart_items));
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('wishlist_id_seq', (SELECT MAX(id) FROM wishlist));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('favorite_roasters_id_seq', (SELECT MAX(id) FROM favorite_roasters));

-- Close connection
SELECT dblink_disconnect('source_db');

\echo 'Migration completed! Verifying data...'

-- Verification queries
SELECT 'users' as table_name, count(*) as records FROM users
UNION ALL
SELECT 'roasters', count(*) FROM roasters
UNION ALL  
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'order_items', count(*) FROM order_items
UNION ALL
SELECT 'cart_items', count(*) FROM cart_items
UNION ALL
SELECT 'reviews', count(*) FROM reviews
UNION ALL
SELECT 'wishlist', count(*) FROM wishlist
UNION ALL
SELECT 'notifications', count(*) FROM notifications
UNION ALL
SELECT 'sessions', count(*) FROM sessions;

\echo 'Migration verification complete!'