# BharatKosh Scraper - Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies (1 minute)
```bash
pip install -r requirements_bharatkosh.txt
```

### 2. Configure API Key (1 minute)
Create a `.env` file in the project root:
```env
# HackClub AI Proxy Configuration
BHARATKOSH_API_KEY=sk-hc-v1-your-hackclub-api-key
BHARATKOSH_BASE_URL=https://ai.hackclub.com/proxy/v1
BHARATKOSH_MODEL=openai/gpt-4o-mini

# Or reuse existing translator config
# TRANSLATOR_API_KEY=sk-hc-v1-your-hackclub-api-key
# TRANSLATOR_BASE_URL=https://ai.hackclub.com/proxy/v1
# TRANSLATOR_MODEL=openai/gpt-4o-mini
```

Get your HackClub API key from: https://ai.hackclub.com/

### 3. Run Tests (2 minutes)
```bash
python test_bharatkosh_complete.py
```

This validates:
- ✅ All packages installed correctly
- ✅ API key is valid
- ✅ Website is accessible
- ✅ AI processing works
- ✅ Database storage works

## 🌟 NEW: Automatic Cookie Management

The scraper now **automatically handles Cloudflare cookies**! No more manual cookie updates.

### 4. Test Scrape (1 minute)
```bash
python bharatkosh_scraper.py --test
```

Scrapes first 3 pages as a test run with **automatic cookie generation**.

### 5. Full Scrape
```bash
python bharatkosh_scraper.py --start 1 --end 566
```

## 📊 What You'll Get

After scraping, you'll have:

```
server-py/data/
├── BharatKosh_History_General_(History_General_Knowledge_Pages_1-566).json
└── ...

server-py/cache/bharatkosh/
├── page_1.json
├── page_2.json
├── ...
└── page_566.json
```

## 🎯 Database Structure

Each question contains:
- Original Hindi question and options
- English translation
- Correct answer (a/b/c/d)
- Detailed explanation (English + Hindi)
- Topic classification
- Difficulty level
- Key facts

## ⏱️ Time Estimates

- **Test run (3 pages)**: ~1-2 minutes
- **Small batch (50 pages)**: ~10-15 minutes
- **Full scrape (566 pages)**: ~30-45 minutes

## 🔧 Troubleshooting

### 🎉 NEW: No More Cookie Issues!
The scraper now uses `cloudscraper` to **automatically bypass Cloudflare** challenges. Manual cookie management is no longer needed!

### Issue: Scraper Still Failing?
**Try manual cookie mode**:
```bash
python bharatkosh_scraper.py --test --no-auto-cookie
```

If auto-cookie fails, update manual cookie in [bharatkosh_scraper.py](bharatkosh_scraper.py):
1. Visit https://bharatdiscovery.org/india/इतिहास_सामान्य_ज्ञान_1 
2. Open DevTools (F12) → **Application** → **Cookies**
3. Copy `cf_clearance` value and update `manual_cookies` in the code

### Issue: Rate Limit Error
**Fix**: The scraper handles this automatically with HackClub proxy
- Waits 30-60-120 seconds before retry
- HackClub proxy has better rate limits than direct OpenAI
- No action needed on your part

### Issue: No Questions Extracted
**Fix**: Check page structure or try different pages
```bash
# Test with a small range to debug
python bharatkosh_scraper.py --start 1 --end 5
```

If pages have different structure, you may need to adjust the extraction regex patterns in `extract_questions_from_html()` method.

## 📈 Monitoring Progress

The scraper shows real-time progress:
```
============================================================
📄 Processing Page 15/566
============================================================
✅ Successfully fetched page 15
📝 Extracted 12 questions from page 15
🤖 Processing question 1/12 with AI...
💾 Saved 12 questions to database

📊 Progress: 15/566 pages
   Questions: 180 total, 180 with AI answers
⏳ Waiting 2.5s before next page...
```

## 🔄 Resume After Interruption

If scraping is interrupted, simply re-run the same command:
```bash
python bharatkosh_scraper.py --start 1 --end 566
```

The scraper will:
- ✅ Check cache for each page
- ✅ Skip already-processed pages
- ✅ Continue from where it left off

## 🎨 Command Examples

```bash
# Test mode (first 3 pages)
python bharatkosh_scraper.py --test

# Specific range
python bharatkosh_scraper.py --start 1 --end 50

# Resume from page 200
python bharatkosh_scraper.py --start 200 --end 566

# With custom delay (slower, more polite)
python bharatkosh_scraper.py --start 1 --end 566 --delay 5.0

# Custom output directory
python bharatkosh_scraper.py --start 1 --end 566 --output my_data/
```

## 💡 Tips

1. **Start with test mode** to verify everything works
2. **Check the cache** - it saves your progress
3. **Use HackClub proxy** - much cheaper than direct OpenAI
4. **Monitor costs** - HackClub proxy offers significant savings
5. **Be patient** - Quality takes time; the AI processing ensures accurate answers
6. **Check results** - Look at a few cached JSON files to verify quality

## 📞 Need Help?

1. Run tests first: `python test_bharatkosh_complete.py`
2. Check the test output for specific error messages
3. Review the full documentation in [BHARATKOSH_README.md](BHARATKOSH_README.md)

**Common Issues:**
- **No API key found**: Add `BHARATKOSH_API_KEY` or `TRANSLATOR_API_KEY` to `.env`
- **Rate limits**: HackClub proxy handles this better than direct OpenAI
- **403 Cloudflare errors**: Update the `cf_clearance` cookie in the scraper

## 🚀 You're Ready!

```bash
# Run this command to start:
python bharatkosh_scraper.py --test
```

Happy scraping! 🎉
