#!/bin/bash

# Thriftika Deployment Script
echo "🚀 Starting Thriftika Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v fly &> /dev/null; then
        print_error "Fly CLI is not installed. Please install it from: https://fly.io/docs/flyctl/install/"
        exit 1
    fi

    if ! command -v vercel &> /dev/null && ! command -v netlify &> /dev/null; then
        print_warning "Neither Vercel CLI nor Netlify CLI is installed. You'll need to deploy frontend manually."
    fi

    print_success "Dependencies check passed!"
}

# Deploy backend to Fly.io
deploy_backend() {
    print_status "Deploying backend to Fly.io..."

    # Check if already logged in
    if ! fly auth whoami &> /dev/null; then
        print_status "Please login to Fly.io:"
        fly auth login
    fi

    # Launch the app
    print_status "Launching Fly.io app..."
    fly launch --name thriftika-backend --region lhr --no-postgres --no-redis

    # Set environment variables
    print_status "Setting environment variables..."
    fly secrets set NODE_ENV=production
    fly secrets set MONGODB_URI="$MONGODB_URI"
    fly secrets set JWT_SECRET="$JWT_SECRET"
    fly secrets set SESSION_SECRET="$SESSION_SECRET"

    # Optional: Set OAuth and email if provided
    if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
        fly secrets set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
        fly secrets set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
    fi

    if [ ! -z "$EMAIL_USER" ]; then
        fly secrets set EMAIL_USER="$EMAIL_USER"
        fly secrets set EMAIL_PASS="$EMAIL_PASS"
    fi

    # Deploy
    print_status "Deploying to Fly.io..."
    fly deploy

    # Get the URL
    BACKEND_URL=$(fly status --json | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4)
    print_success "Backend deployed at: https://$BACKEND_URL"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."

    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        cd client
        vercel --prod
        cd ..
        print_success "Frontend deployed to Vercel!"
    elif command -v netlify &> /dev/null; then
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=client/dist
        print_success "Frontend deployed to Netlify!"
    else
        print_warning "Please deploy frontend manually:"
        print_warning "1. Build the client: cd client && npm run build"
        print_warning "2. Deploy the 'client/dist' folder to Vercel or Netlify"
    fi
}

# Main deployment flow
main() {
    echo "🎨 Welcome to Thriftika Deployment!"
    echo ""

    check_dependencies

    # Get required environment variables
    read -p "Enter MongoDB Atlas connection string: " MONGODB_URI
    read -p "Enter JWT secret (generate a long random string): " JWT_SECRET
    read -p "Enter session secret (generate a long random string): " SESSION_SECRET

    # Optional configurations
    read -p "Google Client ID (optional, press Enter to skip): " GOOGLE_CLIENT_ID
    if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
        read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
    fi

    read -p "Gmail address for emails (optional, press Enter to skip): " EMAIL_USER
    if [ ! -z "$EMAIL_USER" ]; then
        read -p "Gmail App Password: " EMAIL_PASS
    fi

    # Deploy backend
    deploy_backend

    # Deploy frontend
    deploy_frontend

    print_success "🎉 Deployment complete!"
    print_status "Don't forget to:"
    print_status "1. Update frontend environment variables with backend URL"
    print_status "2. Test the deployed application"
    print_status "3. Set up monitoring and alerts"
}

# Run main function
main