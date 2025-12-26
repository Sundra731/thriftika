@echo off
REM Thriftika Deployment Script for Windows
echo 🚀 Starting Thriftika Deployment...

REM Check if required tools are installed
where fly >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Fly CLI is not installed. Please install it from: https://fly.io/docs/flyctl/install/
    pause
    exit /b 1
)

echo [INFO] Checking for Vercel/Netlify CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    where netlify >nul 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Neither Vercel CLI nor Netlify CLI found. You'll need to deploy frontend manually.
    )
)

echo [SUCCESS] Dependencies check passed!

REM Get required environment variables
set /p MONGODB_URI="Enter MongoDB Atlas connection string: "
set /p JWT_SECRET="Enter JWT secret (generate a long random string): "
set /p SESSION_SECRET="Enter session secret (generate a long random string): "

REM Optional configurations
set /p GOOGLE_CLIENT_ID="Google Client ID (optional, press Enter to skip): "
if defined GOOGLE_CLIENT_ID (
    set /p GOOGLE_CLIENT_SECRET="Google Client Secret: "
)

set /p EMAIL_USER="Gmail address for emails (optional, press Enter to skip): "
if defined EMAIL_USER (
    set /p EMAIL_PASS="Gmail App Password: "
)

echo [INFO] Deploying backend to Fly.io...

REM Check if already logged in
fly auth whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Please login to Fly.io:
    fly auth login
)

REM Launch the app
echo [INFO] Launching Fly.io app...
fly launch --name thriftika-backend --region lhr --no-postgres --no-redis

REM Set environment variables
echo [INFO] Setting environment variables...
fly secrets set NODE_ENV=production
fly secrets set MONGODB_URI="%MONGODB_URI%"
fly secrets set JWT_SECRET="%JWT_SECRET%"
fly secrets set SESSION_SECRET="%SESSION_SECRET%"

REM Optional: Set OAuth and email if provided
if defined GOOGLE_CLIENT_ID (
    fly secrets set GOOGLE_CLIENT_ID="%GOOGLE_CLIENT_ID%"
    fly secrets set GOOGLE_CLIENT_SECRET="%GOOGLE_CLIENT_SECRET%"
)

if defined EMAIL_USER (
    fly secrets set EMAIL_USER="%EMAIL_USER%"
    fly secrets set EMAIL_PASS="%EMAIL_PASS%"
)

REM Deploy
echo [INFO] Deploying to Fly.io...
fly deploy

REM Get the URL
for /f "tokens=*" %%i in ('fly status --json ^| findstr hostname') do set BACKEND_URL=%%i
echo [SUCCESS] Backend deployed!

echo [INFO] Deploying frontend...

REM Check for Vercel
where vercel >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Deploying to Vercel...
    cd client
    vercel --prod
    cd ..
    echo [SUCCESS] Frontend deployed to Vercel!
) else (
    REM Check for Netlify
    where netlify >nul 2>nul
    if %errorlevel% equ 0 (
        echo [INFO] Deploying to Netlify...
        netlify deploy --prod --dir=client/dist
        echo [SUCCESS] Frontend deployed to Netlify!
    ) else (
        echo [WARNING] Please deploy frontend manually:
        echo [WARNING] 1. Build the client: cd client ^&^& npm run build
        echo [WARNING] 2. Deploy the 'client/dist' folder to Vercel or Netlify
    )
)

echo [SUCCESS] 🎉 Deployment complete!
echo [INFO] Don't forget to:
echo [INFO] 1. Update frontend environment variables with backend URL
echo [INFO] 2. Test the deployed application
echo [INFO] 3. Set up monitoring and alerts

pause