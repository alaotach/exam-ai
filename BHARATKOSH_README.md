# BharatKosh History Questions Scraper

A comprehensive, production-ready scraping system that extracts history questions from bharatdiscovery.org (pages 1-566), translates them to English using AI, gets correct answers with detailed explanations, and stores everything in a structured database.

## 🌟 Features

- **Complete Automation**: Scrapes all 566 pages of history questions automatically
- **Bilingual Support**: Questions in both Hindi (original) and English (AI-translated)
- **AI-Powered Processing**: Uses GPT-4o-mini for:
  - Translation from Hindi to English
  - Correct answer identification
  - Detailed explanations in both languages
  - Topic classification and difficulty rating
  - Key facts extraction
- **Robust Error Handling**: 
  - Automatic retries with exponential backoff
  - Rate limit handling (30-60-120s backoff)
  - Cloudflare bypass with cookie management
- **Caching System**: Saves progress to resume interrupted scraping sessions
- **Database Integration**: Stores all data in structured JSON format using your existing database system

## 📋 Prerequisites

1. **Python 3.8+**
2. **OpenAI API key** - Get from https://platform.openai.com/api-keys
3. **Valid Cloudflare clearance cookie** - For website access

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_bharatkosh.txt
```

### 2. Setup Environment
Create a `.env` file in the project root:
```env
# HackClub AI Proxy Configuration (Recommended)
BHARATKOSH_API_KEY=sk-hc-v1-your-hackclub-api-key
BHARATKOSH_BASE_URL=https://ai.hackclub.com/proxy/v1
BHARATKOSH_MODEL=openai/gpt-4o-mini

# Alternative: Reuse existing translator config
# TRANSLATOR_API_KEY=sk-hc-v1-your-hackclub-api-key
# TRANSLATOR_BASE_URL=https://ai.hackclub.com/proxy/v1
# TRANSLATOR_MODEL=openai/gpt-4o-mini

# Fallback: Direct OpenAI (not recommended)
# OPENAI_API_KEY=sk-your-direct-openai-key
```

Get your HackClub API key from: https://ai.hackclub.com/

### 3. Test Run (Recommended First)
```bash
python bharatkosh_scraper.py --test
```
This scrapes only the first 3 pages to verify everything works.

### 4. Full Scrape
```bash
python bharatkosh_scraper.py --start 1 --end 566
```

## 📖 Usage Examples

### Test Mode (First 3 Pages)
```bash
python bharatkosh_scraper.py --test
```

### Scrape Specific Range
```bash
# Pages 1-50
python bharatkosh_scraper.py --start 1 --end 50

# Pages 100-200
python bharatkosh_scraper.py --start 100 --end 200
```

### Full Scrape with Custom Settings
```bash
python bharatkosh_scraper.py \
    --start 1 \
    --end 566 \
    --output server-py/data \
    --delay 3.0
```

### Resume After Interruption
Simply re-run the same command - the scraper will skip cached pages:
```bash
python bharatkosh_scraper.py --start 1 --end 566
```

## ⚙️ Configuration

### Command Line Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--start` | int | 1 | Starting page number |
| `--end` | int | 566 | Ending page number |
| `--output` | str | server-py/data | Output directory for database |
| `--delay` | float | 2.0 | Delay between page requests (seconds) |
| `--test` | flag | False | Test mode - only scrapes first 3 pages |

### Cookie Configuration

The scraper requires a valid Cloudflare clearance cookie. Update it in [bharatkosh_scraper.py](bharatkosh_scraper.py#L50) if you get 403 errors:

```python
self.cookies = {
    "cf_clearance": "your_fresh_cf_clearance_cookie_here"
}
```

**How to get a fresh cookie:**
1. Open https://bharatdiscovery.org in your browser
2. Open Developer Tools (F12)
3. Go to **Application** tab → **Storage** → **Cookies**
4. Find and copy the `cf_clearance` value
5. Paste it in the scraper

- ✅ Scrapes all 566 pages of history questions from bharatdiscovery.org
- ✅ Extracts questions and multiple choice options
- ✅ Uses AI to determine correct answers with explanations
- ✅ Translates content between Hindi and English
- ✅ Builds structured database with confidence scores
- ✅ Caching system to resume interrupted processes
- ✅ Progress tracking and error handling

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements_bharatkosh.txt
```

2. **Configure environment variables:**
Create/update your `.env` file in the `server-py` directory:
```bash
# Translation Service API
TRANSLATOR_API_KEY=your_api_key_here
TRANSLATOR_BASE_URL=https://ai.hackclub.com/proxy/v1
TRANSLATOR_MODEL=openai/gpt-oss-120b

# Text Processing Service API (for answer generation)
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://ai.hackclub.com/proxy/v1
```

## Usage

### Test the System
```bash
python test_bharatkosh.py
```

### Build Complete Database (all 566 pages)
```bash
python bharatkosh_scraper.py
```

### Build Partial Database
```bash
# Process pages 1-50
python bharatkosh_scraper.py --start 1 --end 50

# Test mode (only 3 pages)
python bharatkosh_scraper.py --test
```

### Resume from Interruption
The system automatically skips already processed pages, so you can simply re-run the same command to resume.

## Output Structure

### Database Location
Questions are stored in: `data/UPSC_2026_(History_General_Knowledge_BharatKosh).json`

### Question Format
```json
{
  "id": "bharatkosh_history_p1_q1",
  "question": "मगध साम्राज्य की स्थापना किसने की थी?",
  "question_english": "Who established the Magadha Empire?",
  "options": [
    "अ) बिम्बिसार",
    "आ) अजातशत्रु", 
    "इ) महापद्म नंद",
    "ई) चन्द्रगुप्त मौर्य"
  ],
  "options_english": [
    "A) Bimbisara",
    "B) Ajatashatru",
    "C) Mahapadma Nanda", 
    "D) Chandragupta Maurya"
  ],
  "correct_answer": "A",
  "explanation": "बिम्बिसार ने 544 ईसा पूर्व में मगध साम्राज्य की स्थापना की...",
  "explanation_english": "Bimbisara established the Magadha Empire in 544 BCE...",
  "confidence_score": 0.95,
  "page_number": 1,
  "question_number": 1,
  "source": "BharatDiscovery.org"
}
```

## Cache System

- **Cache Location:** `cache/bharatkosh/`
- **Cache Files:** `page_1.json`, `page_2.json`, etc.
- **Purpose:** Resume interrupted processes, avoid re-processing
- **Clear Cache:** Delete cache files to force re-processing

## Progress Tracking

The system provides detailed progress reports every 50 pages:
- Pages processed
- Questions found and processed
- Success rate
- Estimated completion time

## Error Handling

- **Network errors:** Automatic retry with backoff
- **AI service limits:** Rate limiting with exponential backoff  
- **Parsing errors:** Logged and skipped, process continues
- **API errors:** Detailed logging for debugging

## Performance

- **Processing Speed:** ~5-10 questions per minute (depends on AI API)
- **Total Time:** ~8-15 hours for all 566 pages
- **Memory Usage:** ~100-500MB peak
- **Storage:** ~50-100MB for complete database

## Monitoring

Check progress with:
```bash
# Count processed pages
ls cache/bharatkosh/ | wc -l

# Check latest cache file
ls -la cache/bharatkosh/ | tail -5

# Check database size
ls -lh data/UPSC_2026_*.json
```

## Troubleshooting

### Common Issues

1. **"Failed to fetch page" errors:**
   - Check internet connection
   - Verify cookies are still valid
   - Website might be temporarily down

2. **AI processing fails:**
   - Check API keys in `.env` file
   - Verify API quotas/limits
   - Check base URLs are correct

3. **Translation errors:**
   - Check translation service API key
   - Verify language codes are supported
   - Check for text encoding issues

4. **Database save errors:**
   - Check disk space
   - Verify permissions on `data/` directory
   - Check JSON format validity

### Debug Mode
Add debug logging by modifying the script:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Advanced Options

### Custom Page Ranges
```bash
# Process specific pages
python bharatkosh_scraper.py --start 100 --end 200

# Single page
python bharatkosh_scraper.py --start 50 --end 50
```

### Modify Question Patterns
Edit the `extract_questions_from_html` method in `BharatkoshScraper` to adjust question extraction patterns.

### Custom AI Prompts
Modify prompts in `QuestionProcessor._get_answer_and_explanation` method.

## Integration

The generated database integrates with your existing exam system:
- Compatible with existing `QuestionDatabase` format
- Can be loaded into your React Native app
- Supports your existing filtering and search features

## Support

For issues or questions:
1. Check the logs for specific error messages
2. Verify all dependencies are installed
3. Test with a small page range first
4. Check API service status and quotas