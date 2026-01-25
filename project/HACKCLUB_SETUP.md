# 🎉 Hack Club AI Proxy Setup Guide

## Overview

Your PDF extraction system is configured to use **Hack Club's AI Proxy** with the **Qwen VL 235B** vision-language model. This is a powerful, free-to-use API that's perfect for processing exam PDFs!

---

## ✅ Already Configured!

Your system is pre-configured with:

- **Endpoint**: `https://ai.hackclub.com/proxy/v1/chat/completions`
- **Model**: `qwen/qwen3-vl-235b-a22b-instruct`
- **API Key**: `sk-hc-v1-585d31a80b044b01ab41ecf032ead7563f2fdb647b574b69a906ecd966a6a24a`

---

## 🚀 Quick Test

Test your setup is working:

```bash
# Test the API connection
curl https://ai.hackclub.com/proxy/v1/chat/completions \
-H "Authorization: Bearer sk-hc-v1-585d31a80b044b01ab41ecf032ead7563f2fdb647b574b69a906ecd966a6a24a" \
-H "Content-Type: application/json" \
-d '{
  "model": "qwen/qwen3-vl-235b-a22b-instruct",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Describe what you see in this image"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,YOUR_BASE64_IMAGE_HERE"
          }
        }
      ]
    }
  ]
}'
```

---

## 🔧 Setup Server

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env` file is already created with your API key. Just verify it's correct:

```bash
cat .env
```

Should show:
```env
VLM_PROVIDER=qwen
VLM_API_KEY=sk-hc-v1-585d31a80b044b01ab41ecf032ead7563f2fdb647b574b69a906ecd966a6a24a
PORT=3000
```

### 4. Start Server

```bash
npm run dev
```

You should see:
```
🚀 PDF Processing Server running on http://localhost:3000
📊 Admin Dashboard: http://localhost:3000/admin
```

---

## 📤 Process Your First PDF

### Option 1: Using Web Dashboard

1. Open http://localhost:3000/admin
2. Click "Upload PDF"
3. Select your exam PDF
4. Watch the processing in real-time!

### Option 2: Using cURL

```bash
curl -X POST http://localhost:3000/api/process \
  -F "file=@./path/to/exam.pdf" \
  -F "options={\"translation\":true}"
```

### Option 3: Using CLI

```bash
# Process single PDF
npm run cli process ./path/to/exam.pdf

# Process multiple PDFs
npm run cli batch ./pdfs/*.pdf

# Import to database
npm run cli import ./output/upsc_2024_gs1.json
```

---

## 🎯 Example: UPSC Paper Processing

Here's a complete example processing a UPSC exam paper:

```bash
# 1. Start server
npm run dev

# 2. In another terminal, process PDF
curl -X POST http://localhost:3000/api/process \
  -F "file=@./UPSC_2024_GS_Paper1.pdf" \
  -F "options={
    \"translation\": true,
    \"detectDifficulty\": true,
    \"minConfidence\": 0.7
  }"

# Response:
{
  "jobId": "job_1234567890",
  "status": "processing",
  "progress": 0
}

# 3. Check progress
curl http://localhost:3000/api/jobs/job_1234567890

# 4. When complete, questions are auto-imported to database!
```

---

## 📊 API Endpoints

### Process PDF
```bash
POST /api/process
Content-Type: multipart/form-data

Body:
- file: PDF file
- options: JSON configuration
```

### Check Job Status
```bash
GET /api/jobs/:jobId
```

### Get Questions
```bash
GET /api/questions?examType=UPSC&year=2024
```

### Generate Test
```bash
POST /api/tests/generate
Content-Type: application/json

{
  "testType": "previous_year",
  "filters": {
    "examTypes": ["UPSC"],
    "subjects": ["History"],
    "count": 50
  }
}
```

### Search Questions
```bash
GET /api/questions/search?q=constitution&examType=UPSC
```

---

## 🔥 Model Capabilities

**Qwen VL 235B** can understand:

✅ **Languages**: Hindi, English, mixed content  
✅ **Layouts**: Single-column, multi-column, complex  
✅ **Content**: Text, tables, diagrams, formulas  
✅ **Quality**: Scanned PDFs, digital PDFs  
✅ **Structure**: Auto-detects exam structure, papers, sections  

---

## 💰 Usage & Limits

**Hack Club AI Proxy** provides:
- Free access for students/learners
- Generous rate limits
- No credit card required

**Best Practices**:
- Process PDFs during off-peak hours
- Enable caching to avoid reprocessing
- Batch process multiple PDFs together

---

## 🐛 Troubleshooting

### "API Key Invalid"

Check your `.env` file has the correct key:
```bash
VLM_API_KEY=sk-hc-v1-585d31a80b044b01ab41ecf032ead7563f2fdb647b574b69a906ecd966a6a24a
```

### "Rate Limit Exceeded"

The Hack Club proxy has rate limits. Solutions:
- Reduce `MAX_CONCURRENT_PAGES` in config
- Add delays between requests
- Process in smaller batches

### "Poor Extraction Quality"

Increase image resolution:
```env
IMAGE_RESOLUTION=600  # Instead of 300
```

---

## 🎨 Connect Mobile App

Update your React Native app to connect to the server:

```typescript
// services/api-client.ts
const API_BASE_URL = 'http://localhost:3000/api';

export async function getQuestions(filters: TestFilters) {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  return response.json();
}

export async function generateTest(request: TestGenerationRequest) {
  const response = await fetch(`${API_BASE_URL}/tests/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.json();
}
```

---

## 📈 Monitoring

View processing stats:
```bash
# Get stats
curl http://localhost:3000/api/stats

# Response:
{
  "totalQuestions": 5000,
  "byExamType": {
    "UPSC": 2000,
    "SSC": 1500,
    "Banking": 1500
  },
  "processingJobs": {
    "completed": 50,
    "failed": 2,
    "pending": 0
  }
}
```

---

## 🎉 You're All Set!

Your PDF extraction system is ready to use with Hack Club's AI proxy. Start processing exam PDFs and building your question bank!

**Next Steps**:
1. Start the server: `npm run dev`
2. Open dashboard: http://localhost:3000/admin
3. Upload your first PDF
4. Watch the magic happen! ✨

For detailed documentation, see `PDF_EXTRACTOR_README.md`
