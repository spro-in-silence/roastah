#!/bin/bash
# Complete Roastah database export script

echo "Exporting Roastah database data..."

# Create backup directory
mkdir -p migration_backup/data_exports

# Export all table data using SQL queries
psql "$DATABASE_URL" -c "\copy (SELECT * FROM users) TO 'migration_backup/data_exports/users.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM roasters) TO 'migration_backup/data_exports/roasters.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM products) TO 'migration_backup/data_exports/products.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM orders) TO 'migration_backup/data_exports/orders.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM order_items) TO 'migration_backup/data_exports/order_items.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM cart_items) TO 'migration_backup/data_exports/cart_items.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM reviews) TO 'migration_backup/data_exports/reviews.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM wishlist) TO 'migration_backup/data_exports/wishlist.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM notifications) TO 'migration_backup/data_exports/notifications.csv' WITH CSV HEADER"
psql "$DATABASE_URL" -c "\copy (SELECT * FROM sessions) TO 'migration_backup/data_exports/sessions.csv' WITH CSV HEADER"

echo "Export complete! Files saved in migration_backup/data_exports/"
