#!/bin/bash
# =======================
# COPY AND PASTE THESE COMMANDS INTO YOUR VM
# =======================

# 1. UPGRADE NODE.JS TO VERSION 20
echo "=== Step 1: Upgrading Node.js to v20 ==="
sudo apt remove nodejs -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
echo "Node.js version:"
node --version
echo "NPM version:"
npm --version

# 2. CLEAN AND REBUILD PROJECT
echo ""
echo "=== Step 2: Rebuilding Project ==="
cd ~/exam-ai/server
rm -rf node_modules package-lock.json
npm install
npm run build

# 3. CREATE LOGS DIRECTORY
echo ""
echo "=== Step 3: Creating logs directory ==="
cd ~/exam-ai
mkdir -p logs

# 4. START APPLICATION WITH PM2
echo ""
echo "=== Step 4: Starting application ==="
pm2 start ecosystem.config.json
pm2 save
pm2 startup

echo ""
echo "=== IMPORTANT: Copy and run the command PM2 outputs above ==="
echo ""
echo "After running the PM2 startup command, continue with:"
echo "1. Configure Nginx (see VM_SETUP_SSL_GUIDE.md Step 5)"
echo "2. Setup SSL with Certbot (see VM_SETUP_SSL_GUIDE.md Step 8)"
echo ""
echo "Check application status:"
pm2 status
pm2 logs exam-ai-server
