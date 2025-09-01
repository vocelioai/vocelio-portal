@echo off
setlocal enabledelayedexpansion

REM Vocilio Dashboard Deployment Script for Windows
echo.
echo ===========================================
echo    Vocilio Dashboard Deployment Script
echo ===========================================
echo.

REM Default values
set "REGION=us-central1"
set "SERVICE_NAME=vocilio-dashboard"
set "DEPLOY_METHOD=cloud-build"

REM Colors (limited support in Windows)
set "INFO_PREFIX=[INFO]"
set "SUCCESS_PREFIX=[SUCCESS]"
set "WARNING_PREFIX=[WARNING]"
set "ERROR_PREFIX=[ERROR]"

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %ERROR_PREFIX% gcloud CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if node is installed
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %ERROR_PREFIX% Node.js is not installed. Please install it first.
    exit /b 1
)

echo %INFO_PREFIX% Prerequisites check passed!
echo.

REM Get project ID if not set
if "%PROJECT_ID%"=="" (
    for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
    if "!PROJECT_ID!"=="" (
        echo %ERROR_PREFIX% No project ID set. Please run 'gcloud config set project YOUR_PROJECT_ID' or set PROJECT_ID environment variable.
        exit /b 1
    )
)

echo %INFO_PREFIX% Using project: %PROJECT_ID%
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo %INFO_PREFIX% Enabling required APIs...
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

echo %SUCCESS_PREFIX% APIs enabled!
echo.

REM Install dependencies
echo %INFO_PREFIX% Installing dependencies...
call npm ci --silent
if !errorlevel! neq 0 (
    echo %ERROR_PREFIX% Failed to install dependencies
    exit /b 1
)

REM Build the application
echo %INFO_PREFIX% Building for production...
call npm run build
if !errorlevel! neq 0 (
    echo %ERROR_PREFIX% Build failed
    exit /b 1
)

echo %SUCCESS_PREFIX% Application build complete!
echo.

REM Deploy based on method
if "%DEPLOY_METHOD%"=="cloud-build" (
    echo %INFO_PREFIX% Deploying using Cloud Build...
    
    set "SUBSTITUTIONS=_REGION=%REGION%"
    if not "%BACKEND_URL%"=="" (
        set "SUBSTITUTIONS=!SUBSTITUTIONS!,_BACKEND_URL=%BACKEND_URL%"
    )
    
    gcloud builds submit --config cloudbuild.yaml --substitutions !SUBSTITUTIONS! --timeout=1200s
    if !errorlevel! neq 0 (
        echo %ERROR_PREFIX% Cloud Build deployment failed
        exit /b 1
    )
    
    echo %SUCCESS_PREFIX% Deployment via Cloud Build complete!
    
) else if "%DEPLOY_METHOD%"=="direct" (
    echo %INFO_PREFIX% Deploying directly to Cloud Run...
    
    set "ENV_VARS=NODE_ENV=production"
    if not "%BACKEND_URL%"=="" (
        set "ENV_VARS=!ENV_VARS!,BACKEND_URL=%BACKEND_URL%"
    )
    
    gcloud run deploy %SERVICE_NAME% --source . --port 8080 --region %REGION% --allow-unauthenticated --platform managed --memory 1Gi --cpu 1 --max-instances 10 --set-env-vars "!ENV_VARS!" --timeout 300
    if !errorlevel! neq 0 (
        echo %ERROR_PREFIX% Direct deployment failed
        exit /b 1
    )
    
    echo %SUCCESS_PREFIX% Direct deployment complete!
    
) else (
    echo %ERROR_PREFIX% Invalid deployment method: %DEPLOY_METHOD%
    echo Valid methods: cloud-build, direct
    exit /b 1
)

REM Get service URL
echo %INFO_PREFIX% Getting service information...
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)" 2^>nul') do set SERVICE_URL=%%i

echo.
echo %SUCCESS_PREFIX% Deployment completed successfully!
echo.
echo Service URL: %SERVICE_URL%
echo Health Check: %SERVICE_URL%/health
echo.
echo %INFO_PREFIX% You can now access your Vocilio Dashboard at the URL above.
echo.

pause
exit /b 0
