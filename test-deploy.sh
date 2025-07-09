#!/bin/bash

# Test deployment script - minimal steps for troubleshooting
set -e

echo "🔧 Testing deployment process..."

# Check if we can authenticate
echo "Testing gcloud authentication..."
gcloud auth list

# Check if we can access the project
echo "Testing project access..."
gcloud config get-value project

# Check if the image exists
echo "Testing image existence..."
gcloud container images list --repository=us-central1-docker.pkg.dev/roastah-d/roastah-d

# Try a simple deployment
echo "🚀 Attempting deployment..."
gcloud run deploy roastah-d \
  --image=us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --quiet

echo "✅ Deployment test complete!" 