#!/bin/bash

# Vocilio Dashboard Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REGION="us-central1"
SERVICE_NAME="vocilio-dashboard"
PROJECT_ID=""
BACKEND_URL=""
DEPLOY_METHOD="cloud-build"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if logged into gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_error "Not logged into gcloud. Please run 'gcloud auth login' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup project
setup_project() {
    print_status "Setting up project..."
    
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project)
        if [ -z "$PROJECT_ID" ]; then
            print_error "No project ID set. Please run 'gcloud config set project YOUR_PROJECT_ID' or set PROJECT_ID environment variable."
            exit 1
        fi
    fi
    
    print_status "Using project: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    print_status "Enabling required APIs..."
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    print_success "Project setup complete!"
}

# Function to build application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --silent
    
    # Build the application
    print_status "Building for production..."
    npm run build
    
    print_success "Application build complete!"
}

# Function to deploy using Cloud Build
deploy_cloud_build() {
    print_status "Deploying using Cloud Build..."
    
    # Create substitutions
    SUBSTITUTIONS="_REGION=$REGION"
    if [ -n "$BACKEND_URL" ]; then
        SUBSTITUTIONS="$SUBSTITUTIONS,_BACKEND_URL=$BACKEND_URL"
    fi
    
    gcloud builds submit \
        --config cloudbuild.yaml \
        --substitutions $SUBSTITUTIONS \
        --timeout=1200s
    
    print_success "Deployment via Cloud Build complete!"
}

# Function to deploy directly
deploy_direct() {
    print_status "Deploying directly to Cloud Run..."
    
    ENV_VARS="NODE_ENV=production"
    if [ -n "$BACKEND_URL" ]; then
        ENV_VARS="$ENV_VARS,BACKEND_URL=$BACKEND_URL"
    fi
    
    gcloud run deploy $SERVICE_NAME \
        --source . \
        --port 8080 \
        --region $REGION \
        --allow-unauthenticated \
        --platform managed \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --set-env-vars "$ENV_VARS" \
        --timeout 300
    
    print_success "Direct deployment complete!"
}

# Function to get service info
get_service_info() {
    print_status "Getting service information..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    
    print_success "Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}Service URL:${NC} $SERVICE_URL"
    echo -e "${GREEN}Health Check:${NC} $SERVICE_URL/health"
    echo ""
    print_status "You can now access your Vocilio Dashboard at the URL above."
}

# Function to setup CDN (optional)
setup_cdn() {
    print_status "Setting up Cloud CDN (optional)..."
    print_warning "CDN setup requires additional configuration. Please refer to DEPLOYMENT.md for detailed instructions."
    
    read -p "Do you want to continue with CDN setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Skipping CDN setup."
        return
    fi
    
    # This is a placeholder - full CDN setup is complex and depends on domain configuration
    print_status "For CDN setup, please follow the detailed instructions in DEPLOYMENT.md"
}

# Function to show help
show_help() {
    echo "Vocilio Dashboard Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project-id PROJECT_ID    GCP Project ID"
    echo "  -r, --region REGION           Deployment region (default: us-central1)"
    echo "  -b, --backend-url URL         Backend API URL"
    echo "  -m, --method METHOD           Deployment method: cloud-build|direct (default: cloud-build)"
    echo "  -s, --service-name NAME       Service name (default: vocilio-dashboard)"
    echo "  --cdn                         Setup CDN after deployment"
    echo "  -h, --help                    Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PROJECT_ID                    GCP Project ID"
    echo "  BACKEND_URL                   Backend API URL"
    echo "  REGION                        Deployment region"
    echo ""
    echo "Examples:"
    echo "  $0 --project-id my-project --backend-url https://api.example.com"
    echo "  $0 -p my-project -b https://api.example.com -m direct"
    echo "  PROJECT_ID=my-project BACKEND_URL=https://api.example.com $0"
}

# Parse command line arguments
SETUP_CDN=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -b|--backend-url)
            BACKEND_URL="$2"
            shift 2
            ;;
        -m|--method)
            DEPLOY_METHOD="$2"
            shift 2
            ;;
        -s|--service-name)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --cdn)
            SETUP_CDN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Use environment variables if not set via command line
PROJECT_ID=${PROJECT_ID:-$PROJECT_ID}
BACKEND_URL=${BACKEND_URL:-$BACKEND_URL}

# Main deployment flow
main() {
    echo -e "${BLUE}🚀 Vocilio Dashboard Deployment${NC}"
    echo "================================="
    echo ""
    
    check_prerequisites
    setup_project
    build_app
    
    case $DEPLOY_METHOD in
        "cloud-build")
            deploy_cloud_build
            ;;
        "direct")
            deploy_direct
            ;;
        *)
            print_error "Invalid deployment method: $DEPLOY_METHOD"
            print_error "Valid methods: cloud-build, direct"
            exit 1
            ;;
    esac
    
    get_service_info
    
    if [ "$SETUP_CDN" = true ]; then
        setup_cdn
    fi
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"
