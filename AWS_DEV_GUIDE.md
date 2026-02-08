# AWS Deployment Guide - Exam AI Platform

## Architecture Overview

### Recommended AWS Services

1. **EC2 (Node.js Server)** - Main API server
2. **S3** - Store compressed test papers, generated answers, and user uploads
3. **RDS (Optional)** - Can use instead of Firestore for better AWS integration
4. **CloudFront** - CDN for faster content delivery
5. **Route 53** - DNS management
6. **Application Load Balancer** - For auto-scaling
7. **Elastic Beanstalk (Alternative)** - Simpler deployment option
8. **Lambda + API Gateway (Future)** - For specific microservices

## Deployment Options

### Option 1: EC2 + S3 (Recommended for Start)
- **Best for**: Full control, easier debugging, file operations
- **Cost**: ~$10-30/month for small instance
- **Complexity**: Medium

### Option 2: Elastic Beanstalk + S3
- **Best for**: Quick deployment, auto-scaling
- **Cost**: ~$15-40/month
- **Complexity**: Low

### Option 3: ECS (Docker) + S3
- **Best for**: Container-based deployment, scalability
- **Cost**: ~$20-50/month
- **Complexity**: High

## Step-by-Step Deployment (Option 1: EC2 + S3)

### Phase 1: S3 Setup

1. **Create S3 Buckets**
```bash
# Bucket for test papers (compressed .json.gz files)
aws s3 mb s3://exam-ai-testpapers

# Bucket for generated answers
aws s3 mb s3://exam-ai-answers

# Bucket for user uploads
aws s3 mb s3://exam-ai-uploads

# Bucket for user reports
aws s3 mb s3://exam-ai-reports
```

2. **Configure Bucket Policies**
- Enable versioning for answers bucket
- Set lifecycle policies to archive old data
- Configure CORS for web access

3. **Upload Existing Data**
```bash
# Upload test papers
aws s3 sync ./testseries s3://exam-ai-testpapers/testseries

# Upload generated answers
aws s3 sync ./ai_generated_answers s3://exam-ai-answers/
```

### Phase 2: EC2 Instance Setup

1. **Launch EC2 Instance**
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.small (2 vCPU, 2GB RAM) - can upgrade later
- Storage: 30GB EBS (gp3)
- Security Group:
  - Port 22 (SSH)
  - Port 3000 (Node.js)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)

2. **Connect and Install Dependencies**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx
```

3. **Clone Repository**
```bash
git clone https://github.com/your-username/exam-ai.git
cd exam-ai
```

4. **Install Project Dependencies**
```bash
# Server dependencies
cd server
npm install
npm run build

# Python dependencies
cd ../
python3.11 -m pip install -r requirements.txt
```

5. **Configure Environment Variables**
```bash
# Create .env file
nano server/.env
```

Add the following:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 Buckets
S3_TESTPAPERS_BUCKET=exam-ai-testpapers
S3_ANSWERS_BUCKET=exam-ai-answers
S3_UPLOADS_BUCKET=exam-ai-uploads
S3_REPORTS_BUCKET=exam-ai-reports

# Firebase (keep existing or migrate to RDS)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# HackClub AI API Keys
HACKCLUB_API_KEY=your-hackclub-key
TRANSLATOR_API_KEY=your-hackclub-key
TRANSLATOR_BASE_URL=https://ai.hackclub.com/proxy/v1
```

6. **Setup Nginx Reverse Proxy**
```bash
sudo nano /etc/nginx/sites-available/exam-ai
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/exam-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Start Application with PM2**
```bash
cd server
pm2 start dist/index.js --name exam-ai-server
pm2 save
pm2 startup
```

### Phase 3: Configure App to Use AWS

Update the React Native app to point to your EC2 instance:

**project/services/testseries-service.ts** and other service files:
```typescript
const API_URL = 'https://your-domain.com/api';
// or use EC2 public IP temporarily
const API_URL = 'http://your-ec2-ip:3000/api';
```

### Phase 4: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Code Modifications for AWS S3

### 1. Install AWS SDK

```bash
cd server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Create S3 Service

Create `server/src/services/s3-service.ts` - see the file I'll create below.

### 3. Update Routes to Use S3

Modify testseries routes, answer generation routes, and reports routes to use S3 instead of local filesystem.

## Cost Estimation

### Monthly Costs (Approximate)

**Small Scale (Starting)**:
- EC2 t3.small: $15-20/month
- S3 Storage (100GB): $2-3/month
- Data Transfer: $5-10/month
- **Total**: ~$25-35/month

**Medium Scale (Growth)**:
- EC2 t3.medium: $30-40/month
- S3 Storage (500GB): $10-15/month
- CloudFront CDN: $10-20/month
- Data Transfer: $20-30/month
- **Total**: ~$70-105/month

**Large Scale (Mature)**:
- EC2 Auto Scaling (2-4 instances): $100-200/month
- S3 Storage (1TB+): $20-25/month
- RDS PostgreSQL: $50-100/month
- CloudFront CDN: $30-50/month
- Application Load Balancer: $20/month
- **Total**: ~$220-395/month

## Performance Optimization

1. **Enable S3 Transfer Acceleration**
2. **Use CloudFront for test papers** (CDN caching)
3. **Implement Redis for caching** (ElastiCache)
4. **Auto Scaling Groups** for traffic spikes
5. **Use S3 Intelligent-Tiering** for cost optimization

## Monitoring & Logging

1. **CloudWatch Logs** - Application logs
2. **CloudWatch Metrics** - CPU, Memory, Network
3. **CloudWatch Alarms** - Alert on high usage
4. **PM2 Monitoring** - Process monitoring

```bash
# View logs
pm2 logs exam-ai-server

# Monitor performance
pm2 monit
```

## Backup Strategy

1. **S3 Versioning** - Enabled on all buckets
2. **EC2 Snapshots** - Daily EBS snapshots
3. **RDS Automated Backups** - If using RDS
4. **Cross-Region Replication** - For critical data

## Deployment Checklist

- [ ] Create AWS account
- [ ] Create S3 buckets
- [ ] Upload test papers to S3
- [ ] Launch EC2 instance
- [ ] Configure Security Groups
- [ ] Install Node.js, Python, PM2
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Setup Nginx reverse proxy
- [ ] Start application with PM2
- [ ] Configure DNS (Route 53 or external)
- [ ] Setup SSL certificate
- [ ] Update app API endpoints
- [ ] Test all features
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Document access credentials

## Rollback Plan

1. Keep PM2 running previous version
2. Use S3 versioning to restore files
3. EC2 snapshots for quick recovery
4. Blue-Green deployment for zero downtime

## Next Steps After Initial Deployment

1. **Setup CI/CD Pipeline** (GitHub Actions)
2. **Add Auto Scaling**
3. **Implement Redis Caching**
4. **Add CloudFront CDN**
5. **Migrate to RDS** (if needed)
6. **Setup Monitoring Dashboard**
7. **Implement Rate Limiting**
8. **Add Load Balancer**

## Support & Troubleshooting

**Common Issues**:
- Port 3000 not accessible → Check Security Group
- Out of memory → Upgrade instance type
- Slow file operations → Use S3 instead of local storage
- High costs → Review S3 lifecycle policies, use Reserved Instances

**Useful Commands**:
```bash
# Check server status
pm2 status

# Restart server
pm2 restart exam-ai-server

# View logs
pm2 logs --lines 100

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check disk space
df -h

# Check memory
free -h

# Monitor network
sudo netstat -tulpn | grep :3000
```
