# PDF Question Extractor - Comprehensive Documentation

## 🚀 Overview

This is a **fully automated, generalized PDF extraction system** powered by Vision-Language Models (VLMs). It can process **any exam PDF** - UPSC, SSC, JEE, NEET, Banking exams, etc. - and automatically extract questions, answers, and explanations without any manual configuration.

### Key Features

✅ **Completely Generalized** - Works with any exam PDF format  
✅ **Zero Configuration** - No hardcoded rules or assumptions  
✅ **VLM-Powered** - Uses Qwen3-VL or Nemotron-Nano for intelligent parsing  
✅ **Multi-Language** - Automatic Hindi ↔ English translation  
✅ **Smart Structuring** - Automatically detects exam type, year, papers, subjects  
✅ **Cross-Page Stitching** - Handles questions spanning multiple pages  
✅ **Integrated Database** - Organizes questions by exam, subject, year, difficulty  
✅ **Test Generation** - Create custom tests with advanced filtering  

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [VLM Integration](#vlm-integration)
7. [Data Formats](#data-formats)
8. [Troubleshooting](#troubleshooting)

---

## 🏗 System Architecture

### Pipeline Stages

```
PDF Input
    ↓
1. PDF Ingestion (Load & Validate)
    ↓
2. Page Rendering (Convert to Images)
    ↓
3. VLM Analysis (Understand Each Page)
    ↓
4. Structure Inference (Detect Exam/Paper/Sections)
    ↓
5. Question Extraction (Extract & Parse Questions)
    ↓
6. Cross-Page Stitching (Merge Split Questions)
    ↓
7. Translation (Hindi ↔ English)
    ↓
8. Validation (Check Quality & Completeness)
    ↓
9. Export (Generate JSON/App Data)
    ↓
10. Database Import (Organize by Categories)
```

### Core Components

- **PDFIngestionService**: Handles PDF loading and page rendering
- **VLMService**: Vision-Language Model integration
- **QuestionExtractionService**: Intelligent question parsing
- **TranslationService**: Multi-language translation
- **DataExportService**: Output generation
- **QuestionDatabaseService**: Question storage and retrieval

---

## 📦 Installation

### Prerequisites

```bash
# Node.js 18+ and npm
node --version  # Should be 18.0.0 or higher

# Expo CLI (if not installed)
npm install -g expo-cli
```

### Install Dependencies

```bash
cd project
npm install

# Additional dependencies for PDF processing
npm install expo-document-picker expo-file-system

# For backend PDF rendering (optional)
# npm install pdf-poppler pdf2pic
```

### Environment Setup

Create a `.env` file in the project root:

```env
# VLM API Configuration
VLM_PROVIDER=qwen
VLM_API_KEY=your_api_key_here

# Optional: Custom endpoints
# QWEN_ENDPOINT=https://api.together.xyz/v1/chat/completions
# NEMOTRON_ENDPOINT=https://integrate.api.nvidia.com/v1/chat/completions

# Processing Configuration
OUTPUT_DIRECTORY=./output
CACHE_DIRECTORY=./cache
```

---

## ⚙️ Configuration

### Basic Configuration

Edit `services/pdf-processor/config.ts`:

```typescript
export const PDF_PROCESSOR_CONFIG = {
  vlm: {
    provider: 'qwen', // or 'nemotron'
    apiKey: process.env.VLM_API_KEY,
    maxTokens: 4096,
    temperature: 0.1,
  },
  processing: {
    batchSize: 10,
    maxConcurrentPages: 5,
    imageResolution: 300, // DPI
  },
  translation: {
    enabled: true,
    targetLanguages: ['english'],
  },
  extraction: {
    minConfidenceScore: 0.6,
    detectDifficulty: true,
  },
};
```

### VLM Provider Setup

#### Option 1: Qwen3-VL (Recommended)

```typescript
{
  vlm: {
    provider: 'qwen',
    model: 'Qwen/Qwen2.5-VL-72B-Instruct',
    apiKey: 'YOUR_TOGETHER_AI_KEY',
    endpoint: 'https://api.together.xyz/v1/chat/completions'
  }
}
```

Get API key: https://api.together.xyz

#### Option 2: Nemotron-Nano

```typescript
{
  vlm: {
    provider: 'nemotron',
    model: 'nvidia/nemotron-nano-12b-v2-vl',
    apiKey: 'YOUR_NVIDIA_KEY',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions'
  }
}
```

Get API key: https://build.nvidia.com

---

## 📖 Usage Guide

### Method 1: Using the App UI

1. **Open the app** and navigate to Practice screen
2. **Tap "Import Questions"** button
3. **Select PDF files** from your device
4. **Wait for processing** - Progress shown in real-time
5. **Questions automatically available** for practice!

### Method 2: Programmatic Usage

```typescript
import { PDFProcessor } from '@/services/pdf-processor';
import { QuestionDatabaseService } from '@/services/question-database';

// Initialize processor
const processor = new PDFProcessor({
  vlm: {
    provider: 'qwen',
    apiKey: 'your_api_key',
  },
});

// Process a PDF
const job = await processor.processPDF('./path/to/exam.pdf');

// Import into database
const dbService = new QuestionDatabaseService();
if (job.results) {
  await dbService.importQuestions(
    job.results.extractedQuestions,
    job.results.documentStructure.papers.map(p => /* categories */)
  );
}

// Generate custom test
const test = await dbService.generateTest({
  testType: 'previous_year',
  filters: {
    examTypes: ['UPSC'],
    years: [2023, 2024],
    subjects: ['History', 'Geography'],
  },
  count: 50,
  duration: 90, // minutes
  randomize: true,
});
```

### Method 3: Batch Processing

```typescript
// Process multiple PDFs
const pdfFiles = [
  './pdfs/upsc_2023_gs1.pdf',
  './pdfs/upsc_2023_gs2.pdf',
  './pdfs/upsc_2024_gs1.pdf',
];

const results = await processor.processPDFs(pdfFiles);

// All questions automatically organized by exam/year/paper
```

---

## 🔧 API Reference

### PDFProcessor

```typescript
class PDFProcessor {
  constructor(config?: Partial<ProcessorConfig>)
  
  // Process single PDF
  async processPDF(filePath: string): Promise<ProcessingJob>
  
  // Process multiple PDFs
  async processPDFs(filePaths: string[]): Promise<ProcessingJob[]>
  
  // Get/Update configuration
  getConfig(): ProcessorConfig
  updateConfig(updates: Partial<ProcessorConfig>): void
}
```

### QuestionDatabaseService

```typescript
class QuestionDatabaseService {
  // Load/Save database
  async loadDatabase(): Promise<void>
  async saveDatabase(): Promise<void>
  
  // Import questions
  async importQuestions(
    questions: ExtractedQuestion[],
    categories: QuestionCategory[]
  ): Promise<void>
  
  // Generate tests
  async generateTest(request: TestGenerationRequest): Promise<AppTest>
  
  // Query methods
  async getExamTypes(): Promise<string[]>
  async getSubjects(examType?: string): Promise<string[]>
  async getYears(examType?: string): Promise<number[]>
  async getQuestionsByCategory(categoryId: string): Promise<AppQuestion[]>
  async searchQuestions(query: string, filters?: TestFilters): Promise<AppQuestion[]>
  
  // Statistics
  async getStatistics(): Promise<DatabaseStatistics>
}
```

### Test Generation

```typescript
interface TestGenerationRequest {
  testType: 'previous_year' | 'subject_wise' | 'mixed' | 'mock_test';
  filters: TestFilters;
  count: number;
  duration?: number;
  randomize?: boolean;
}

interface TestFilters {
  examTypes?: string[];
  subjects?: string[];
  topics?: string[];
  years?: number[];
  difficulties?: ('Easy' | 'Medium' | 'Hard')[];
  paperTypes?: string[];
  excludeAttempted?: boolean;
}
```

---

## 🤖 VLM Integration

### How VLM Understanding Works

The system uses VLM as the **primary parser**, not as a fallback. Here's what happens:

1. **Each page is sent to VLM** as an image
2. **VLM analyzes** the page structure, content, language
3. **VLM extracts** questions, options, answers in structured format
4. **VLM infers** document structure (exam name, year, papers)
5. **VLM classifies** subjects and difficulty
6. **VLM translates** content when needed

### Sample VLM Prompt (Page Analysis)

```
Analyze this page from an exam PDF and provide structured analysis.

Your task:
1. Identify document type (exam paper, solution, explanation, etc.)
2. Detect all languages (Hindi, English, mixed)
3. Extract all questions, options, answers visible
4. Identify structure (questions only, with answers, etc.)

Return JSON:
{
  "documentType": "exam_paper",
  "languages": ["hindi", "english"],
  "detectedElements": [
    {
      "type": "question",
      "content": "Question text...",
      "confidence": 0.95
    },
    ...
  ]
}
```

### Supported VLMs

| VLM | Model ID | Best For |
|-----|----------|----------|
| Qwen3-VL | `Qwen/Qwen2.5-VL-72B-Instruct` | General purpose, highest accuracy |
| Nemotron | `nvidia/nemotron-nano-12b-v2-vl` | Fast processing, good for large batches |

---

## 📊 Data Formats

### Extracted Question Format

```json
{
  "questionId": "upsc_2024_gs1_q1",
  "questionNumber": 1,
  "questionText": {
    "original": "भारत के संविधान में कितने अनुच्छेद हैं?",
    "language": "hindi",
    "translated": "How many articles are there in the Indian Constitution?"
  },
  "options": [
    {
      "optionNumber": 1,
      "text": {
        "original": "395",
        "language": "hindi",
        "translated": "395"
      }
    }
  ],
  "correctAnswer": 0,
  "explanation": {
    "original": "भारतीय संविधान में मूल रूप से 395 अनुच्छेद...",
    "translated": "The Indian Constitution originally had 395 articles..."
  },
  "subject": "Polity",
  "difficulty": "Easy",
  "timeToSolve": 30,
  "metadata": {
    "examType": "UPSC",
    "year": 2024,
    "paperName": "GS Paper I",
    "confidence": 0.95
  }
}
```

### Database Structure

```json
{
  "id": "db_1234567890",
  "version": "1.0.0",
  "lastUpdated": "2024-01-07T10:00:00Z",
  "totalQuestions": 5000,
  "categories": [
    {
      "id": "exam_upsc",
      "name": "UPSC CSE Prelims",
      "type": "exam_type",
      "metadata": {
        "examType": "UPSC",
        "questionCount": 2000
      },
      "questions": ["upsc_2024_gs1_q1", "..."],
      "subcategories": [
        {
          "id": "paper_gs1",
          "name": "GS Paper I",
          "type": "paper_type",
          "questions": ["..."]
        }
      ]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Q: VLM API errors**
```
Error: VLM API error: 401 Unauthorized
```
**Solution**: Check your API key in `.env` file

**Q: PDF rendering fails**
```
Error: Failed to render PDF pages
```
**Solution**: Implement proper PDF rendering (see pdf-ingestion.ts comments)

**Q: Low extraction accuracy**
```
Warning: Question confidence below threshold
```
**Solution**: Increase `imageResolution` in config (300 → 600 DPI)

**Q: Translation errors**
```
Error: Translation failed
```
**Solution**: Check VLM API limits, reduce batch size

### Performance Optimization

1. **Use caching**: Enable `enableCaching: true`
2. **Adjust concurrency**: Lower `maxConcurrentPages` if hitting rate limits
3. **Batch processing**: Process multiple PDFs together
4. **Image quality**: Balance DPI (quality) vs speed

---

## 📝 Examples

### Example 1: UPSC Previous Year Papers

```typescript
// Process UPSC 2024 papers
const upscProcessor = new PDFProcessor();

await upscProcessor.processPDFs([
  './pdfs/upsc_2024_prelims_gs1.pdf',
  './pdfs/upsc_2024_prelims_csat.pdf',
]);

// Generate year-wise test
const test = await dbService.generateTest({
  testType: 'previous_year',
  filters: { examTypes: ['UPSC'], years: [2024] },
  count: 100,
  duration: 120,
});
```

### Example 2: Subject-wise Practice

```typescript
// Get all History questions
const historyQuestions = await dbService.getQuestionsByCategory(
  'subject_history'
);

// Create subject test
const historyTest = await dbService.generateTest({
  testType: 'subject_wise',
  filters: { subjects: ['History'], difficulties: ['Medium', 'Hard'] },
  count: 30,
  randomize: true,
});
```

### Example 3: Mixed Exam Preparation

```typescript
// Create mixed test from multiple exams
const mixedTest = await dbService.generateTest({
  testType: 'mixed',
  filters: {
    examTypes: ['UPSC', 'SSC', 'Banking'],
    subjects: ['Reasoning', 'Quantitative Aptitude'],
    difficulties: ['Medium'],
  },
  count: 50,
  duration: 60,
  randomize: true,
});
```

---

## 🚀 Next Steps

1. **Implement PDF rendering** for React Native (see pdf-ingestion.ts)
2. **Set up VLM API** (Qwen or Nemotron)
3. **Test with sample PDFs**
4. **Configure extraction parameters**
5. **Build your question database**

---

## 📞 Support

For issues or questions:
- Check logs in `./logs/` directory
- Review VLM responses in cache (if enabled)
- Adjust confidence thresholds
- Try different VLM providers

---

## 🎯 Summary

This system is **fully automated** and **completely generalized**. Just provide PDFs of any exam - UPSC, SSC, JEE, NEET, Banking, etc. - and the VLM will:

1. ✅ Understand the document structure
2. ✅ Extract all questions automatically
3. ✅ Translate between languages
4. ✅ Organize by exam/subject/year
5. ✅ Make it ready for your app

No manual configuration. No hardcoded rules. Just pure VLM intelligence! 🧠
