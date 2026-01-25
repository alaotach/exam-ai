# Quick Start Guide - PDF Question Extractor

## 🚀 Get Started in 5 Minutes

### Step 1: Get VLM API Key

Choose one VLM provider:

**Option A: Qwen (Recommended)**
1. Go to https://api.together.xyz
2. Sign up for free account
3. Get API key from dashboard

**Option B: Nemotron**
1. Go to https://build.nvidia.com
2. Create account
3. Get API key

### Step 2: Configure

Create `.env` file in project root:

```env
VLM_PROVIDER=qwen
VLM_API_KEY=your_actual_api_key_here
```

### Step 3: Test with Example

```typescript
// services/test-processor.ts
import { PDFProcessor } from './pdf-processor';

async function testProcessor() {
  const processor = new PDFProcessor();
  
  // Process a PDF
  const result = await processor.processPDF('./sample.pdf');
  
  console.log('Extracted questions:', result.results?.extractedQuestions.length);
  console.log('Exam type:', result.results?.documentStructure.examType);
}

testProcessor();
```

### Step 4: Use in App

The PDF upload UI is already integrated! Just:

1. Run the app: `npm run dev`
2. Navigate to Practice screen
3. Tap "Import Questions"
4. Select your exam PDFs
5. Wait for processing
6. Start practicing!

---

## 📱 App Integration

### Enable PDF Upload in Practice Screen

Add this to your practice screen:

```tsx
import PDFUploadComponent from '@/components/PDFUpload';

// In your component
<PDFUploadComponent />
```

### Use Test Filters

```tsx
import TestFilterComponent from '@/components/TestFilter';

<TestFilterComponent 
  onApplyFilters={(filters) => {
    // Generate filtered test
    generateTestWithFilters(filters);
  }}
/>
```

---

## 🎯 Processing Your First PDF

### What PDFs work?

✅ **Any exam question paper PDF**
- UPSC CSE (Prelims, Mains)
- SSC (CGL, CHSL, MTS)
- Banking (IBPS, SBI)
- Railway (RRB, RRC)
- State PSC exams
- JEE, NEET
- Any competitive exam!

✅ **Format support**
- Scanned PDFs (images)
- Digital text PDFs
- Mixed format
- Hindi, English, or both

❌ **What doesn't work**
- Handwritten notes
- Image-only with no questions
- Corrupted PDFs

### Example Processing Flow

```typescript
import { PDFProcessor } from '@/services/pdf-processor';
import { QuestionDatabaseService } from '@/services/question-database';

// 1. Initialize services
const processor = new PDFProcessor();
const dbService = new QuestionDatabaseService();

// 2. Process PDF
const job = await processor.processPDF('./upsc_2024_gs1.pdf');

// 3. Check results
if (job.status === 'completed' && job.results) {
  console.log(`✅ Success!`);
  console.log(`Exam: ${job.results.documentStructure.examName}`);
  console.log(`Year: ${job.results.documentStructure.year}`);
  console.log(`Questions: ${job.results.extractedQuestions.length}`);
  
  // 4. Import to database
  await dbService.importQuestions(
    job.results.extractedQuestions,
    [] // Categories auto-generated
  );
  
  console.log('✅ Questions imported to database!');
}
```

---

## 🔧 Customization

### Adjust Extraction Confidence

If getting too many false positives:

```typescript
const processor = new PDFProcessor({
  extraction: {
    minConfidenceScore: 0.8, // Increase from 0.6
  },
});
```

### Enable/Disable Translation

```typescript
const processor = new PDFProcessor({
  translation: {
    enabled: true,
    targetLanguages: ['english'], // or ['hindi']
  },
});
```

### Change Image Quality

Higher quality = better accuracy but slower:

```typescript
const processor = new PDFProcessor({
  processing: {
    imageResolution: 600, // Increase from 300 DPI
  },
});
```

---

## 📊 Database Usage

### Query Questions

```typescript
const dbService = new QuestionDatabaseService();

// Get all exam types
const exams = await dbService.getExamTypes();
console.log(exams); // ['UPSC', 'SSC', 'Banking', ...]

// Get subjects for UPSC
const subjects = await dbService.getSubjects('UPSC');
console.log(subjects); // ['History', 'Geography', 'Polity', ...]

// Get available years
const years = await dbService.getYears('UPSC');
console.log(years); // [2024, 2023, 2022, ...]

// Search questions
const questions = await dbService.searchQuestions('constitution', {
  examTypes: ['UPSC'],
  subjects: ['Polity'],
});
```

### Generate Tests

```typescript
// Previous year test
const prevYearTest = await dbService.generateTest({
  testType: 'previous_year',
  filters: {
    examTypes: ['UPSC'],
    years: [2024, 2023],
  },
  count: 100,
  duration: 120,
  randomize: true,
});

// Subject-wise test
const subjectTest = await dbService.generateTest({
  testType: 'subject_wise',
  filters: {
    subjects: ['History', 'Geography'],
    difficulties: ['Medium', 'Hard'],
  },
  count: 50,
  duration: 60,
});

// Mixed random test
const mixedTest = await dbService.generateTest({
  testType: 'mixed',
  filters: {
    examTypes: ['UPSC', 'SSC'],
  },
  count: 30,
  randomize: true,
});
```

---

## 🎨 UI Components

### PDF Upload Modal

```tsx
import PDFUploadComponent from '@/components/PDFUpload';

function MyScreen() {
  return (
    <View>
      <PDFUploadComponent />
    </View>
  );
}
```

### Test Filter Modal

```tsx
import TestFilterComponent from '@/components/TestFilter';

function TestScreen() {
  const handleFilter = (filters: TestFilters) => {
    // Use filters to generate test
    console.log('Selected filters:', filters);
  };

  return (
    <TestFilterComponent 
      onApplyFilters={handleFilter}
      initialFilters={{ examTypes: ['UPSC'] }}
    />
  );
}
```

---

## 🐛 Common Issues

### "VLM API Error"

**Problem**: API key not set or invalid

**Solution**:
```bash
# Check .env file
VLM_API_KEY=your_actual_key

# Make sure to restart app after changing .env
```

### "PDF Rendering Failed"

**Problem**: PDF rendering not implemented for React Native

**Solution**: Implement one of these:

1. **Native Module** (Best for production)
2. **Backend Service** (Easiest to set up)
3. **WebView + pdf.js** (No backend needed)

See detailed implementation in `pdf-ingestion.ts` comments.

### "Low Confidence Scores"

**Problem**: Scanned PDF with poor quality

**Solution**:
```typescript
// Increase image resolution
const processor = new PDFProcessor({
  processing: {
    imageResolution: 600, // Higher DPI
  },
  extraction: {
    minConfidenceScore: 0.5, // Lower threshold
  },
});
```

---

## 🎯 Production Checklist

Before going to production:

- [ ] ✅ Implement PDF rendering for React Native
- [ ] ✅ Set up proper error logging
- [ ] ✅ Add progress tracking UI
- [ ] ✅ Implement caching for processed PDFs
- [ ] ✅ Add retry logic for failed extractions
- [ ] ✅ Set up backup mechanism for database
- [ ] ✅ Test with various PDF formats
- [ ] ✅ Monitor VLM API usage and costs
- [ ] ✅ Add rate limiting for batch processing
- [ ] ✅ Implement user feedback system

---

## 💡 Pro Tips

1. **Batch Process**: Process multiple PDFs overnight for best results
2. **Cache Everything**: Enable caching to save API calls
3. **Test Incrementally**: Start with 1-2 pages, then full PDF
4. **Review Extractions**: Always review extracted questions for accuracy
5. **Fine-tune Prompts**: Adjust VLM prompts for specific exam formats

---

## 📞 Need Help?

Check these files for detailed information:

- `PDF_EXTRACTOR_README.md` - Full documentation
- `services/pdf-processor/types.ts` - All type definitions
- `services/pdf-processor/config.ts` - Configuration options
- `services/pdf-processor/vlm-service.ts` - VLM integration details

---

## 🎉 You're Ready!

Your PDF question extraction system is now set up! Start processing exam PDFs and building your question bank. Good luck! 🚀
