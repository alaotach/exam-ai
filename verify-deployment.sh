#!/bin/bash

# AWS Deployment Verification Script
# Tests all components after deployment

set -e

echo "🔍 Exam AI - AWS Deployment Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Check if running on EC2
echo "1. Environment Check"
echo "--------------------"

if [ -f /sys/hypervisor/uuid ] && [ `head -c 3 /sys/hypervisor/uuid` == "ec2" ]; then
    pass "Running on EC2 instance"
else
    warn "Not running on EC2 (may be local/other cloud)"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    pass "Node.js installed: $NODE_VERSION"
else
    fail "Node.js not installed"
fi

# Check Python
if command -v python3.11 &> /dev/null; then
    PYTHON_VERSION=$(python3.11 --version)
    pass "Python installed: $PYTHON_VERSION"
else
    fail "Python 3.11 not installed"
fi

# Check PM2
if command -v pm2 &> /dev/null; then
    pass "PM2 installed"
else
    fail "PM2 not installed"
fi

# Check Nginx
if command -v nginx &> /dev/null; then
    pass "Nginx installed"
    if systemctl is-active --quiet nginx; then
        pass "Nginx is running"
    else
        fail "Nginx is not running"
    fi
else
    fail "Nginx not installed"
fi

echo ""
echo "2. Application Check"
echo "--------------------"

# Check if app directory exists
if [ -d "/home/ubuntu/exam-ai" ]; then
    pass "Application directory exists"
    cd /home/ubuntu/exam-ai
else
    fail "Application directory not found"
    exit 1
fi

# Check if server is built
if [ -f "server/dist/index.js" ]; then
    pass "Server build exists"
else
    fail "Server not built"
fi

# Check if .env exists
if [ -f "server/.env" ]; then
    pass ".env file exists"
    
    # Check required env variables
    if grep -q "AWS_ACCESS_KEY_ID" server/.env; then
        pass "AWS credentials configured"
    else
        warn "AWS credentials not found in .env"
    fi
    
    if grep -q "GEMINI_API_KEY" server/.env; then
        pass "Gemini API key configured"
    else
        warn "Gemini API key not found in .env"
    fi
else
    fail ".env file not found"
fi

# Check PM2 process
echo ""
echo "3. PM2 Process Check"
echo "--------------------"

if pm2 list | grep -q "exam-ai-server"; then
    pass "PM2 process exists"
    
    if pm2 list | grep "exam-ai-server" | grep -q "online"; then
        pass "Server is running"
    else
        fail "Server is not running"
    fi
else
    fail "PM2 process not found"
fi

# Check ports
echo ""
echo "4. Port Check"
echo "-------------"

if netstat -tuln | grep -q ":3000"; then
    pass "Port 3000 is listening"
else
    fail "Port 3000 is not listening"
fi

if netstat -tuln | grep -q ":80"; then
    pass "Port 80 is listening (Nginx)"
else
    warn "Port 80 is not listening"
fi

# Check API health
echo ""
echo "5. API Health Check"
echo "-------------------"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    pass "API health endpoint responding"
else
    fail "API health endpoint not responding"
fi

# Check S3 connectivity
echo ""
echo "6. AWS S3 Check"
echo "---------------"

if command -v aws &> /dev/null; then
    pass "AWS CLI installed"
    
    # Check if buckets exist
    if aws s3 ls s3://exam-ai-testpapers &> /dev/null; then
        pass "Test papers bucket accessible"
    else
        warn "Test papers bucket not accessible"
    fi
    
    if aws s3 ls s3://exam-ai-answers &> /dev/null; then
        pass "Answers bucket accessible"
    else
        warn "Answers bucket not accessible"
    fi
else
    warn "AWS CLI not installed (optional)"
fi

# Check Nginx configuration
echo ""
echo "7. Nginx Configuration"
echo "----------------------"

if sudo nginx -t &> /dev/null; then
    pass "Nginx configuration is valid"
else
    fail "Nginx configuration has errors"
fi

if [ -f /etc/nginx/sites-enabled/exam-ai ]; then
    pass "Exam AI site is enabled"
else
    warn "Exam AI site not enabled in Nginx"
fi

# Check SSL
if [ -f /etc/letsencrypt/live/*/fullchain.pem ]; then
    pass "SSL certificate installed"
else
    warn "SSL certificate not found (run certbot)"
fi

# Check disk space
echo ""
echo "8. System Resources"
echo "-------------------"

DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    pass "Disk usage: ${DISK_USAGE}%"
else
    warn "Disk usage high: ${DISK_USAGE}%"
fi

# Check memory
FREE_MEM=$(free -m | awk 'NR==2 {print $4}')
if [ $FREE_MEM -gt 200 ]; then
    pass "Free memory: ${FREE_MEM}MB"
else
    warn "Low memory: ${FREE_MEM}MB"
fi

# Check logs
echo ""
echo "9. Logs Check"
echo "-------------"

if [ -d "logs" ]; then
    pass "Logs directory exists"
    
    if [ -f "logs/pm2-error.log" ]; then
        ERROR_COUNT=$(tail -100 logs/pm2-error.log | grep -i "error" | wc -l)
        if [ $ERROR_COUNT -eq 0 ]; then
            pass "No recent errors in PM2 logs"
        else
            warn "Found $ERROR_COUNT errors in PM2 logs"
        fi
    fi
else
    warn "Logs directory not found"
fi

# Summary
echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your deployment is healthy.${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Deployment is functional but has warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ Deployment has failures. Please review and fix.${NC}"
    exit 1
fi
