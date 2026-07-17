#!/usr/bin/env bash
# Build script for Render deployment
# Builds frontend first, then installs backend dependencies

set -e  # Exit immediately on any error

echo "==> Installing frontend dependencies..."
cd frontend
npm install

echo "==> Building frontend..."
npm run build

echo "==> Frontend built successfully at frontend/dist"
cd ..

echo "==> Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "==> Build complete!"
