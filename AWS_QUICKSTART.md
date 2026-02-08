# AWS Quick Start Guide

## Prerequisites

1. **AWS Account** - Sign up at https://aws.amazon.com
2. **AWS CLI** - Install from https://aws.amazon.com/cli/
3. **SSH Key Pair** - For EC2 access
4. **Domain Name** (optional) - For production deployment

## Quick Setup (30 minutes)

### Step 1: Configure AWS CLI

```bash
aws configure
# Enter:
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region: us-east-1
# Default output format: json
```

### Step 2: Create S3 Buckets

```bash
# Create buckets
aws s3 mb s3://exam-ai-testpapers
aws s3 mb s3://exam-ai-answers
aws s3 mb s3://exam-ai-uploads
aws s3 mb s3://exam-ai-reports

# Enable versioning on answers bucket
aws s3api put-bucket-versioning \
  --bucket exam-ai-answers \
  --versioning-configuration Status=Enabled
```

### Step 3: Launch EC2 Instance

**Via AWS Console:**
1. Go to EC2 Dashboard → Launch Instance
2. Choose: Ubuntu 22.04 LTS
3. Instance type: t3.small
4. Create new key pair (download .pem file)
5. Security group: Allow ports 22, 80, 443, 3000
6. Storage: 30GB gp3
7. Launch instance

**Get instance IP:**
```bash
# Note the Public IPv4 address from console
# or use AWS CLI:
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' --output table
```

### Step 4: Connect to EC2

```bash
# Make key file secure
chmod 400 your-key.pem

# SSH into instance
ssh -i your-key.pem ubuntu@<your-ec2-ip>
```

### Step 5: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 6: Clone and Setup Application

```bash
# Clone repository
cd ~
git clone <your-repo-url> exam-ai
cd exam-ai

# Install server dependencies
cd server
npm install
npm run build

# Install Python dependencies
cd ..
pip3 install -r requirements.txt

# Create .env file
cp server/.env.production server/.env
nano server/.env  # Edit with your AWS credentials
```

**Required .env variables:**
```env
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=us-east-1
S3_TESTPAPERS_BUCKET=exam-ai-testpapers
S3_ANSWERS_BUCKET=exam-ai-answers
S3_UPLOADS_BUCKET=exam-ai-uploads
S3_REPORTS_BUCKET=exam-ai-reports

# HackClub AI Configuration
# Get your API key from: https://ai.hackclub.com/
HACKCLUB_API_KEY=<your-hackclub-api-key>
TRANSLATOR_BASE_URL=https://ai.hackclub.com/proxy/v1
TRANSLATOR_API_KEY=<your-hackclub-api-key>
```

**How to get HackClub API key:**
1. Visit https://ai.hackclub.com/
2. Sign up/login with your account
3. Generate an API key
4. Copy the key (starts with `sk-hc-v1-...`)
5. Use the same key for both HACKCLUB_API_KEY and TRANSLATOR_API_KEY
```

### Step 7: Migrate Data to S3

```bash
# Install AWS SDK for migration script
cd server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Run migration
npx tsx scripts/migrate-to-s3.ts
```

### Step 8: Start Server

```bash
# Start with PM2
cd server
pm2 start dist/index.js --name exam-ai-server

# Save PM2 config
pm2 save
pm2 startup  # Follow the instructions
```

### Step 9: Configure Nginx

```bash
# Copy nginx config
sudo cp ~/exam-ai/nginx.conf /etc/nginx/sites-available/exam-ai

# Edit domain name
sudo nano /etc/nginx/sites-available/exam-ai
# Replace 'your-domain.com' with your actual domain or EC2 IP

# Enable site
sudo ln -s /etc/nginx/sites-available/exam-ai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: Setup SSL (if using domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Update Mobile App

Edit `project/services/testseries-service.ts` and other service files:

```typescript
// Change from localhost to your server
const API_URL = 'https://your-domain.com/api';
// or if no domain yet:
const API_URL = 'http://<your-ec2-ip>/api';
```

Rebuild and test your app!

## Verify Deployment

```bash
# Check server status
pm2 status

# Check logs
pm2 logs exam-ai-server

# Test API
curl http://localhost:3000/health

# Test from outside
curl http://<your-ec2-ip>/health
```

## Automated Deployments (Optional)

### Setup GitHub Actions

1. Add secrets to GitHub repository:
   - `EC2_SSH_PRIVATE_KEY`: Your .pem file content
   - `EC2_HOST`: Your EC2 IP address

2. Push to main branch → auto-deploys!

## Monitoring

```bash
# View real-time logs
pm2 logs exam-ai-server --lines 100

# Monitor resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/exam-ai-access.log
sudo tail -f /var/log/nginx/exam-ai-error.log
```

## Common Commands

```bash
# Restart server
pm2 restart exam-ai-server

# Deploy updates
cd ~/exam-ai
git pull
cd server
npm install
npm run build
pm2 restart exam-ai-server

# Check disk space
df -h

# Check S3 usage
aws s3 ls s3://exam-ai-testpapers --recursive --summarize

# Download logs
pm2 logs exam-ai-server --lines 1000 > server-logs.txt
```

## Troubleshooting

**Server won't start:**
```bash
pm2 logs exam-ai-server --err
# Check for missing env variables or build errors
```

**Can't connect from outside:**
```bash
# Check security group allows port 80/443
# Check Nginx is running: sudo systemctl status nginx
# Check EC2 instance is running
```

**Out of memory:**
```bash
# Upgrade instance type to t3.medium
# Or add swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**High costs:**
- Use S3 Intelligent-Tiering
- Stop EC2 when not in use (dev only)
- Use Reserved Instances for production
- Monitor with AWS Cost Explorer

## Next Steps

- [ ] Setup CloudWatch monitoring
- [ ] Configure auto-scaling
- [ ] Add Redis cache (ElastiCache)
- [ ] Setup CloudFront CDN
- [ ] Implement blue-green deployment
- [ ] Add automated backups
- [ ] Setup alerts (SNS)

## Cost Optimization Tips

1. **Use Spot Instances** for development (up to 90% cheaper)
2. **S3 Lifecycle Policies** - Move old data to Glacier
3. **Reserved Instances** - 1-year commitment saves ~30%
4. **CloudFront** - Reduces S3 costs via caching
5. **Monitor with AWS Budgets** - Set spending alerts

## Support

For issues:
1. Check logs: `pm2 logs exam-ai-server`
2. Check AWS CloudWatch Logs
3. Review security group settings
4. Verify S3 bucket permissions
5. Check environment variables

Happy deploying! 🚀
