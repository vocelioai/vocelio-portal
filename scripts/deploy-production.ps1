# ===== COPILOT PROMPT #8: Production Deployment Script =====

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Vocelio Portal Deployment to $Environment" -ForegroundColor Green

# Environment-specific configurations
$environments = @{
    "production" = @{
        "registry" = "ghcr.io/vocilio/vocelio-portal"
        "cluster" = "vocelio-prod"
        "namespace" = "vocelio-portal"
        "domain" = "portal.vocelio.com"
        "replicas" = 3
    }
    "staging" = @{
        "registry" = "ghcr.io/vocilio/vocelio-portal"
        "cluster" = "vocelio-staging"
        "namespace" = "vocelio-portal-staging"
        "domain" = "staging-portal.vocelio.com"
        "replicas" = 1
    }
}

$config = $environments[$Environment]
if (-not $config) {
    Write-Error "Unknown environment: $Environment"
    exit 1
}

# Check prerequisites
Write-Host "✅ Checking prerequisites..." -ForegroundColor Blue

$requiredTools = @("docker", "kubectl", "helm")
foreach ($tool in $requiredTools) {
    try {
        & $tool version | Out-Null
        Write-Host "  ✓ $tool is installed" -ForegroundColor Green
    } catch {
        Write-Error "❌ $tool is not installed or not in PATH"
        exit 1
    }
}

# Set up environment variables
$env:NODE_ENV = $Environment
$env:DOCKER_BUILDKIT = "1"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$imageTag = "$($config.registry):$Environment-$timestamp"

Write-Host "🏗️  Building application..." -ForegroundColor Blue

# Install dependencies and run tests
if (-not $SkipTests) {
    Write-Host "  📦 Installing dependencies..." -ForegroundColor Yellow
    npm ci
    
    Write-Host "  🧪 Running tests..." -ForegroundColor Yellow
    npm run test:unit
    
    Write-Host "  🔍 Running linting..." -ForegroundColor Yellow
    npm run lint
    
    Write-Host "  🛡️  Running security audit..." -ForegroundColor Yellow
    npm audit --audit-level moderate
}

# Build the application
if (-not $SkipBuild) {
    Write-Host "  🔨 Building production bundle..." -ForegroundColor Yellow
    npm run build
}

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Blue
docker build -t $imageTag .

# Security scan
Write-Host "🛡️  Scanning Docker image for vulnerabilities..." -ForegroundColor Blue
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock `
    aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL $imageTag

# Push to registry
Write-Host "📤 Pushing image to registry..." -ForegroundColor Blue
docker push $imageTag

# Deploy using Helm
Write-Host "🚢 Deploying to $Environment..." -ForegroundColor Blue

# Create Helm values for environment
$helmValues = @"
image:
  repository: $($config.registry)
  tag: $Environment-$timestamp
  pullPolicy: Always

replicaCount: $($config.replicas)

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: $($config.domain)
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: vocelio-portal-tls
      hosts:
        - $($config.domain)

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: $($config.replicas)
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

nodeSelector: {}
tolerations: []
affinity: {}

env:
  NODE_ENV: $Environment
  PORT: "8080"

configMap:
  OMNICHANNEL_API_URL: "https://api.vocelio.com"
  OMNICHANNEL_WS_URL: "wss://api.vocelio.com"

secrets:
  # Add secrets via kubectl or external secret operator
"@

# Save Helm values to temporary file
$valuesFile = "helm-values-$Environment.yaml"
$helmValues | Out-File -FilePath $valuesFile -Encoding UTF8

try {
    # Switch to correct Kubernetes context
    kubectl config use-context $config.cluster
    
    # Create namespace if it doesn't exist
    kubectl create namespace $config.namespace --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy with Helm
    helm upgrade --install vocelio-portal ./helm-chart `
        --namespace $config.namespace `
        --values $valuesFile `
        --wait `
        --timeout 10m
    
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get deployment status
    Write-Host "📊 Deployment Status:" -ForegroundColor Blue
    kubectl get pods -n $config.namespace
    kubectl get ingress -n $config.namespace
    
    # Run health checks
    Write-Host "🏥 Running health checks..." -ForegroundColor Blue
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
        
        try {
            $response = Invoke-WebRequest -Uri "https://$($config.domain)/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Health check passed!" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "  ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        if ($attempt -eq $maxAttempts) {
            Write-Warning "❌ Health checks failed after $maxAttempts attempts"
            exit 1
        }
        
        Start-Sleep -Seconds 10
    } while ($true)
    
    # Performance test
    Write-Host "⚡ Running performance test..." -ForegroundColor Blue
    try {
        $perfResponse = Invoke-WebRequest -Uri "https://$($config.domain)" -UseBasicParsing -TimeoutSec 30
        $loadTime = (Measure-Command { $perfResponse }).TotalSeconds
        Write-Host "  ✅ Page load time: $([math]::Round($loadTime, 2)) seconds" -ForegroundColor Green
    } catch {
        Write-Warning "⚠️  Performance test failed: $($_.Exception.Message)"
    }
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Application URL: https://$($config.domain)" -ForegroundColor Blue
    
    # Rollback instructions
    Write-Host "📝 Rollback Instructions:" -ForegroundColor Yellow
    Write-Host "  helm rollback vocelio-portal --namespace $($config.namespace)" -ForegroundColor Gray
    
} catch {
    Write-Error "❌ Deployment failed: $($_.Exception.Message)"
    
    # Show rollback command
    Write-Host "🔄 To rollback run:" -ForegroundColor Yellow
    Write-Host "  helm rollback vocelio-portal --namespace $($config.namespace)" -ForegroundColor Gray
    
    exit 1
} finally {
    # Cleanup
    if (Test-Path $valuesFile) {
        Remove-Item $valuesFile
    }
}

Write-Host "✨ All done! 🚀" -ForegroundColor Green
