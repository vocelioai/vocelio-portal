# Vocilio Portal - AWS S3 + CloudFront Deployment
# High-performance global CDN deployment

## Prerequisites
- AWS CLI installed and configured
- AWS account with appropriate permissions

## Configuration
$BUCKET_NAME = "vocilio-portal-app"
$REGION = "us-east-1"
$CLOUDFRONT_COMMENT = "Vocilio Portal CDN"

Write-Host "🚀 Deploying to AWS S3 + CloudFront..."

## Step 1: Create S3 bucket for static hosting
Write-Host "📦 Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

## Step 2: Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

## Step 3: Set bucket policy for public read access
$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
"@

$bucketPolicy | Out-File -FilePath "./bucket-policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

## Step 4: Upload application files with optimized headers
Write-Host "📤 Uploading application files..."
aws s3 sync ./dist s3://$BUCKET_NAME --delete `
    --cache-control "public, max-age=31536000" `
    --exclude "*.html" `
    --exclude "*.json"

# Upload HTML and JSON files with shorter cache
aws s3 sync ./dist s3://$BUCKET_NAME --delete `
    --cache-control "public, max-age=0, must-revalidate" `
    --include "*.html" `
    --include "*.json"

## Step 5: Create CloudFront distribution
Write-Host "🌐 Setting up CloudFront CDN..."
$distributionConfig = @"
{
    "CallerReference": "vocilio-portal-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Comment": "$CLOUDFRONT_COMMENT",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "$BUCKET_NAME-origin",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "$BUCKET_NAME-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_All"
}
"@

$distributionConfig | Out-File -FilePath "./cloudfront-config.json" -Encoding utf8
$distribution = aws cloudfront create-distribution --distribution-config file://cloudfront-config.json | ConvertFrom-Json

$DOMAIN_NAME = $distribution.Distribution.DomainName

Write-Host "✅ Deployment complete!"
Write-Host "🌍 CloudFront Domain: https://$DOMAIN_NAME"
Write-Host "📊 S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
Write-Host "⚡ CDN propagation may take 10-15 minutes"

# Clean up temp files
Remove-Item "./bucket-policy.json" -ErrorAction SilentlyContinue
Remove-Item "./cloudfront-config.json" -ErrorAction SilentlyContinue
