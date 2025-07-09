#!/bin/bash

# Simple deployment script for Roastah
set -e

echo "🔧 Authenticating to Artifact Registry..."
gcloud auth configure-docker us-central1-docker.pkg.dev

echo "🏗️ Building Docker image..."
docker build -t us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest .

echo "📤 Pushing Docker image..."
PUSH_OUTPUT=$(docker push us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d:latest 2>&1)
echo "$PUSH_OUTPUT"

echo "🔍 Getting image digest..."
DIGEST=$(echo "$PUSH_OUTPUT" | grep "latest: digest:" | awk '{print $3}' | sed 's/sha256://')

echo "🚀 Deploying to Cloud Run with digest: $DIGEST"
gcloud run deploy roastah-d \
  --image=us-central1-docker.pkg.dev/roastah-d/roastah-d/roastah-d@sha256:$DIGEST \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars="DATABASE_URL=sm://roastah-d/database-url,SESSION_SECRET=sm://roastah-d/session-secret" \
  --set-secrets="REPLIT_DOMAINS=REPLIT_DOMAINS:latest,REPL_ID=REPL_ID:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest" \
  --quiet

echo "✅ Deployment complete!"  