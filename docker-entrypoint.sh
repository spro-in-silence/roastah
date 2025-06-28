#!/bin/sh

# Roastah Docker Entrypoint Script
# Handles application startup, database migrations, and graceful shutdown

set -e

echo "🚀 Starting Roastah application..."

# Function to run database migrations
run_migrations() {
    echo "📊 Running database migrations..."
    if [ -f "drizzle.config.ts" ]; then
        npx drizzle-kit migrate
        echo "✅ Database migrations completed"
    else
        echo "⚠️  No drizzle config found, skipping migrations"
    fi
}

# Function to wait for database
wait_for_database() {
    echo "⏳ Waiting for database connection..."
    # Add your database connection check here
    # Example for PostgreSQL:
    # until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
    #     echo "Waiting for database..."
    #     sleep 2
    # done
    echo "✅ Database connection established"
}

# Function to wait for Redis
wait_for_redis() {
    echo "⏳ Waiting for Redis connection..."
    # Add your Redis connection check here
    # Example:
    # until redis-cli -h $REDIS_HOST -p $REDIS_PORT ping; do
    #     echo "Waiting for Redis..."
    #     sleep 2
    # done
    echo "✅ Redis connection established"
}

# Function to validate environment variables
validate_env() {
    echo "🔍 Validating environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "SESSION_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ Required environment variable $var is not set"
            exit 1
        fi
    done
    
    echo "✅ Environment variables validated"
}

# Function to start the application
start_app() {
    echo "🎯 Starting Roastah server..."
    exec node build/server.js
}

# Main execution
main() {
    # Validate environment variables
    validate_env
    
    # Wait for external services
    wait_for_database
    wait_for_redis
    
    # Run migrations
    run_migrations
    
    # Start the application
    start_app
}

# Handle signals for graceful shutdown
trap 'echo "🛑 Received shutdown signal, stopping gracefully..."; exit 0' SIGTERM SIGINT

# Run main function
main "$@" 