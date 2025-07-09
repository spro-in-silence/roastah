#!/bin/bash

# Simple deployment script for Roastah
set -e

echo "🔧 Authenticating to Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev

echo "🏗️ Building Docker image..."
docker build -t us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest .

echo "📤 Pushing Docker image..."
docker push us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest

if [ $? -eq 0 ]; then
    echo "✅ Image pushed successfully"
else
    echo "❌ Image push failed"
    exit 1
fi

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy roastah-d \
  --image=us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080,DATABASE_URL=sm://roastah-d/database-url,SESSION_SECRET=sm://roastah-d/session-secret" \
  --set-secrets="REPLIT_DOMAINS=REPLIT_DOMAINS:latest,REPL_ID=REPL_ID:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest" \
  --verbosity=info

if [ $? -eq 0 ]; then
    echo "✅ Deployment complete!"
    echo "🔗 Getting service URL..."
    gcloud run services describe roastah-d --platform managed --region us-central1 --format 'value(status.url)'
else
    echo "❌ Deployment failed"
    exit 1
fi 