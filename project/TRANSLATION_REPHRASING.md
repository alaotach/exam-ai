# Translation & Rephrasing Guide

## Overview

The system uses **two different models** for optimal results:

1. **Qwen VL 235B** - For understanding PDFs and extracting questions
2. **GPT-OSS-120B** - For translation and rephrasing explanations

This separation ensures:
- ✅ Accurate question extraction with VLM
- ✅ High-quality translation with LLM
- ✅ Copyright-safe explanations through rephrasing

---

## How It Works

### Stage 1: PDF Understanding (Qwen VL)
```
PDF Page → Qwen VL 235B → Extracted Question (Original Language)
```

### Stage 2: Translation (GPT-OSS-120B)
```
Hindi Question → GPT-OSS-120B → English Question
Hindi Explanation → GPT-OSS-120B → English Explanation
```

### Stage 3: Rephrasing (GPT-OSS-120B)
```
Original Explanation → GPT-OSS-120B → Rephrased (Copyright-Safe) Explanation
```

---

## Configuration

In `server/.env`:

```env
# Vision model for PDF understanding
VLM_PROVIDER=qwen
VLM_API_KEY=sk-hc-v1-585d31a80b044b01ab41ecf032ead7563f2fdb647b574b69a906ecd966a6a24a

# Translation & Rephrasing model
TRANSLATION_MODEL=openai/gpt-oss-120b
ENABLE_REPHRASING=true
REPHRASING_STYLE=academic  # Options: academic, simple, detailed
```

---

## Rephrasing Styles

### 1. Academic (Default)
**Best for**: UPSC, competitive exams, formal content

**Example:**
```
Original: "The Indian Constitution has 395 articles which were adopted on 26th January 1950."

Rephrased: "India's constitutional framework comprises 395 articles that came into effect on January 26, 1950, marking the establishment of the republic."
```

### 2. Simple
**Best for**: General learning, beginner-friendly content

**Example:**
```
Original: "The Indian Constitution has 395 articles which were adopted on 26th January 1950."

Rephrased: "The Indian Constitution contains 395 rules or articles. It started working on January 26, 1950."
```

### 3. Detailed
**Best for**: In-depth study material, detailed explanations

**Example:**
```
Original: "The Indian Constitution has 395 articles which were adopted on 26th January 1950."

Rephrased: "The Constitution of India is structured around 395 distinct articles, each serving specific purposes in governing the nation. This foundational document was formally adopted on January 26, 1950, which is why we celebrate Republic Day on this date. The articles cover everything from fundamental rights to the structure of government."
```

---

## API Usage

### Process with Rephrasing

```bash
curl -X POST http://localhost:3000/api/process \
  -F "file=@./exam.pdf" \
  -F "options={
    \"translation\": true,
    \"rephrasing\": {
      \"enabled\": true,
      \"style\": \"academic\"
    }
  }"
```

### Disable Rephrasing

```bash
curl -X POST http://localhost:3000/api/process \
  -F "file=@./exam.pdf" \
  -F "options={
    \"translation\": true,
    \"rephrasing\": {
      \"enabled\": false
    }
  }"
```

---

## Why Rephrasing?

### Copyright Protection

Original explanations from PDFs may be copyrighted. Rephrasing creates **completely original content** while preserving:
- ✅ Technical accuracy
- ✅ Educational value
- ✅ Key concepts
- ✅ Factual information

### Example Transformation

**Original (from PDF):**
> "Photosynthesis is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a byproduct."

**Rephrased (Academic):**
> "Green plants produce their own food through photosynthesis, a biological process that converts light energy into chemical energy. During this process, plants utilize carbon dioxide from the air and water from the soil, with chlorophyll acting as the key catalyst. This transformation releases oxygen into the atmosphere as a beneficial byproduct."

**Rephrased (Simple):**
> "Plants make their own food using sunlight. They take in carbon dioxide and water, and with the help of a green substance called chlorophyll, they create food. During this process, they also release oxygen that we breathe."

---

## Testing Translation & Rephrasing

### Test Translation Only

```typescript
import { TranslationService } from './services/pdf-processor/translation-service';

const service = new TranslationService(null, {
  apiKey: 'your-api-key',
  translationModel: 'openai/gpt-oss-120b',
});

const result = await service.translate({
  text: 'भारतीय संविधान में 395 अनुच्छेद हैं',
  sourceLanguage: 'hindi',
  targetLanguage: 'english',
});

console.log(result.translatedText);
// "The Indian Constitution has 395 articles"
```

### Test Rephrasing

```typescript
const rephrased = await service.rephraseExplanation(
  'The Indian Constitution has 395 articles which were adopted on 26th January 1950.',
  'Polity',
  'academic'
);

console.log(rephrased);
// Original content, completely reworded
```

---

## Performance & Caching

### Caching Strategy

Both translation and rephrasing results are cached:

```typescript
// First call: API request
await service.translate({ text: '...' }); // ~2 seconds

// Second call: Cached
await service.translate({ text: '...' }); // <10ms
```

### API Usage Estimation

For a typical exam PDF (100 questions):

| Operation | API Calls | Approx. Time |
|-----------|-----------|--------------|
| PDF Understanding (Qwen VL) | 50 pages | 2-5 minutes |
| Translation (GPT-OSS) | 100 questions × 2 fields | 5-10 minutes |
| Rephrasing (GPT-OSS) | 100 explanations | 5-10 minutes |
| **Total** | **~250 calls** | **15-25 minutes** |

### Cost Optimization

1. **Enable caching**: Reuse translated/rephrased content
2. **Batch process**: Process multiple PDFs together
3. **Smart filtering**: Only rephrase when explanation exists
4. **Quality threshold**: Skip low-confidence extractions

---

## Monitoring

### Check Translation Quality

```bash
# Get processing stats
curl http://localhost:3000/api/stats/translation

# Response:
{
  "totalTranslations": 500,
  "cached": 120,
  "cacheHitRate": "24%",
  "totalRephrasings": 450,
  "averageLength": {
    "original": 85,
    "rephrased": 92
  }
}
```

---

## Troubleshooting

### "Translation API Error"

Check your API key and model name:
```env
TRANSLATION_MODEL=openai/gpt-oss-120b
VLM_API_KEY=sk-hc-v1-...
```

### "Rephrasing produces similar text"

Increase temperature or try different style:
```typescript
{
  rephrasing: {
    style: 'detailed', // Try detailed for more variation
  }
}
```

### "Translations seem inaccurate"

GPT-OSS-120B is optimized for accuracy. If issues persist:
1. Add more context to translation requests
2. Verify source language detection
3. Check input text quality

---

## Best Practices

### 1. Always Enable Rephrasing for Published Content
```typescript
{
  rephrasing: {
    enabled: true,
    style: 'academic',
  }
}
```

### 2. Use Appropriate Styles
- **UPSC/Government Exams**: `academic`
- **School Content**: `simple`
- **Reference Material**: `detailed`

### 3. Preserve Technical Terms
The system automatically preserves:
- Names (people, places)
- Technical terms
- Dates and numbers
- Formulas and equations

### 4. Review Critical Content
For important exams, review rephrased explanations:
```bash
# Export with source tracking
curl http://localhost:3000/api/export/with-sources
```

---

## Summary

Your system now:
- ✅ Uses **Qwen VL 235B** for PDF understanding
- ✅ Uses **GPT-OSS-120B** for translation
- ✅ Uses **GPT-OSS-120B** for rephrasing explanations
- ✅ Generates **copyright-safe** content
- ✅ Maintains **technical accuracy**
- ✅ Supports **multiple styles**

All explanations are automatically rephrased to create original content while preserving educational value! 🎉
