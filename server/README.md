# Exam AI Server - PDF Processing & Question Database API

## 🚀 Server-Side Architecture

This is the **backend server** that handles:
- ✅ PDF upload and processing
- ✅ VLM-based question extraction
- ✅ Multi-language translation
- ✅ Question database management
- ✅ Test generation API
- ✅ RESTful API for mobile/web apps

## 📦 Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your VLM API:
```env
VLM_PROVIDER=qwen
VLM_API_KEY=your_api_key_here
```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📂 CLI Tools

### Process Single PDF
```bash
npm run process-pdf -- ./pdfs/upsc_2024_gs1.pdf
```

### Process Folder of PDFs
```bash
npm run process-folder -- ./pdfs
```

### View Database Stats
```bash
npm run db:stats
```

## 🌐 API Endpoints

### Upload & Processing

**Upload Single PDF**
```bash
POST /api/upload
Content-Type: multipart/form-data

{
  "pdf": <file>
}
```

**Upload Multiple PDFs**
```bash
POST /api/upload/batch
Content-Type: multipart/form-data

{
  "pdfs": [<file1>, <file2>, ...]
}
```

### Question Queries

**Get Questions**
```bash
GET /api/questions?examTypes=UPSC&subjects=History&limit=50
```

**Search Questions**
```bash
GET /api/questions/search/constitution?subjects=Polity
```

**Get Question by ID**
```bash
GET /api/questions/:id
```

**Get Metadata**
```bash
GET /api/questions/meta/exam-types
GET /api/questions/meta/subjects?examType=UPSC
GET /api/questions/meta/years?examType=UPSC
```

### Test Generation

**Generate Custom Test**
```bash
POST /api/tests/generate
Content-Type: application/json

{
  "testType": "mixed",
  "filters": {
    "examTypes": ["UPSC"],
    "subjects": ["History", "Geography"],
    "years": [2024, 2023],
    "difficulties": ["Medium", "Hard"]
  },
  "count": 50,
  "duration": 60,
  "randomize": true
}
```

**Get Previous Year Paper**
```bash
GET /api/tests/previous-year?examType=UPSC&year=2024&paperName=GS%20Paper%20I
```

**Get Subject-wise Test**
```bash
GET /api/tests/subject-wise?subjects=History,Geography&count=30
```

**Get Daily Practice**
```bash
GET /api/tests/daily-practice?count=20&examType=UPSC
```

### Statistics

**Overall Stats**
```bash
GET /api/stats
```

**Exam-specific Stats**
```bash
GET /api/stats/exam/UPSC
```

**Subject-specific Stats**
```bash
GET /api/stats/subject/History
```

### Health Check
```bash
GET /health
```

## 📱 Mobile App Integration

In your React Native app, configure API client:

```typescript
// services/api.ts
const API_BASE_URL = 'http://your-server:3000/api';

export const api = {
  async getQuestions(filters) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/questions?${params}`);
    return response.json();
  },

  async generateTest(request) {
    const response = await fetch(`${API_BASE_URL}/tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  async getExamTypes() {
    const response = await fetch(`${API_BASE_URL}/questions/meta/exam-types`);
    return response.json();
  },

  // Add more methods as needed
};
```

## 🏗️ Project Structure

```
server/
├── src/
│   ├── index.ts              # Main server
│   ├── routes/
│   │   ├── upload.ts         # PDF upload routes
│   │   ├── questions.ts      # Question query routes
│   │   ├── tests.ts          # Test generation routes
│   │   ├── stats.ts          # Statistics routes
│   │   └── processing.ts     # Job status routes
│   ├── services/
│   │   ├── database.ts       # SQLite database service
│   │   └── pdf-processor.ts  # PDF processing wrapper
│   └── cli/
│       ├── process-pdf.ts    # CLI for processing PDFs
│       └── db-stats.ts       # CLI for database stats
├── uploads/                  # Uploaded PDFs (temp)
├── output/                   # Processed data
├── cache/                    # Processing cache
├── data/                     # SQLite database
└── logs/                     # Server logs
```

## 🔧 Advanced Configuration

### Enable API Authentication

```env
API_KEY=your_secure_api_key
```

Then add middleware:
```typescript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### Configure CORS

```env
CORS_ORIGIN=https://yourapp.com,https://admin.yourapp.com
```

### Adjust Processing Limits

```env
MAX_FILE_SIZE_MB=100
MAX_CONCURRENT_JOBS=10
MAX_PAGES_PER_BATCH=20
```

## 📊 Monitoring

View logs:
```bash
tail -f logs/server.log
```

Monitor database size:
```bash
du -h data/questions.db
```

Check processing queue:
```bash
curl http://localhost:3000/api/processing/jobs
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VLM_API_KEY=${VLM_API_KEY}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./cache:/app/cache
```

### Deploy to VPS
```bash
# On your server
git clone <repo>
cd server
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name exam-ai-server
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
export PORT=3001
npm run dev
```

**Database locked:**
```bash
# Close all connections
pm2 restart exam-ai-server
```

**VLM API errors:**
```bash
# Check API key
echo $VLM_API_KEY

# Test connection
curl -H "Authorization: Bearer $VLM_API_KEY" \
  https://api.together.xyz/v1/models
```

## 📈 Performance Tips

1. **Enable caching** for repeated page processing
2. **Use connection pooling** for database
3. **Implement rate limiting** for API endpoints
4. **Add Redis** for job queue in production
5. **Use CDN** for serving processed data

## 🎯 Next Steps

1. ✅ Set up VLM API keys
2. ✅ Run the server
3. ✅ Upload test PDFs via API
4. ✅ Integrate with mobile app
5. ✅ Deploy to production

Your PDF processing server is ready! 🎉
