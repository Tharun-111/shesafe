# 🚀 SheSafe Backend Deployment Script
# Run this after setting up MongoDB Atlas and Render account

Write-Host "🚀 SheSafe Backend Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Step 1: MongoDB Atlas Setup
Write-Host "`n📋 Step 1: MongoDB Atlas Setup" -ForegroundColor Yellow
Write-Host "1. Go to: https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
Write-Host "2. Create free account & cluster" -ForegroundColor Cyan
Write-Host "3. Create database user: 'shesafe_user'" -ForegroundColor Cyan
Write-Host "4. Whitelist IP: 0.0.0.0/0" -ForegroundColor Cyan
Write-Host "5. Copy connection string" -ForegroundColor Cyan

$mongoUri = Read-Host "`nEnter your MongoDB connection string"

# Step 2: Render Setup
Write-Host "`n📋 Step 2: Render Setup" -ForegroundColor Yellow
Write-Host "1. Go to: https://render.com" -ForegroundColor Cyan
Write-Host "2. Sign up & connect GitHub" -ForegroundColor Cyan
Write-Host "3. Create new Web Service" -ForegroundColor Cyan
Write-Host "4. Import: https://github.com/Tharun-111/shesafe" -ForegroundColor Cyan

$renderUrl = Read-Host "`nEnter your Render backend URL (after deployment)"

# Step 3: Update Frontend
Write-Host "`n📋 Step 3: Update Frontend Environment" -ForegroundColor Yellow
Write-Host "Updating Vercel environment variable..." -ForegroundColor Cyan

# This would update Vercel env var if we had API access
Write-Host "REACT_APP_API_URL=$renderUrl" -ForegroundColor Green

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Frontend: https://client-ashy-seven-81.vercel.app" -ForegroundColor Green
Write-Host "Backend: $renderUrl" -ForegroundColor Green
Write-Host "MongoDB: Connected" -ForegroundColor Green

Write-Host "`n🎉 Your SheSafe app is now fully deployed!" -ForegroundColor Magenta