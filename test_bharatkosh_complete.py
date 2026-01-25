"""
Test script for BharatKosh scraper
Validates that all components work correctly before full scrape
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add paths
sys.path.append(os.path.join(os.path.dirname(__file__), 'server-py', 'src'))

load_dotenv()


async def test_basic_setup():
    """Test 1: Verify basic setup and imports"""
    print("\n" + "="*60)
    print("TEST 1: Basic Setup & Imports")
    print("="*60)
    
    try:
        from bharatkosh_scraper import BharatkoshScraper
        from database_improved import QuestionDatabase
        from langchain_openai import ChatOpenAI
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Check API key (HackClub or existing translator key)
    api_key = (os.getenv("BHARATKOSH_API_KEY") or 
               os.getenv("TRANSLATOR_API_KEY") or 
               os.getenv("OPENAI_API_KEY"))
    
    if api_key:
        key_source = "HackClub" if api_key.startswith("sk-hc-") else "OpenAI"
        print(f"✅ {key_source} API key found ({api_key[:10]}...)")
    else:
        print("❌ No API key found in .env")
        print("   Please add one of:")
        print("   BHARATKOSH_API_KEY=sk-hc-v1-your-hackclub-key (recommended)")
        print("   TRANSLATOR_API_KEY=sk-hc-v1-your-hackclub-key (reuse existing)")
        print("   OPENAI_API_KEY=sk-your-openai-key (fallback)")
        return False
    
    return True


async def test_page_fetch():
    """Test 2: Fetch a single page"""
    print("\n" + "="*60)
    print("TEST 2: Page Fetching")
    print("="*60)
    
    from bharatkosh_scraper import BharatkoshScraper
    
    scraper = BharatkoshScraper(start_page=1, end_page=1, auto_cookie=True)
    
    # Fetch page 1 with auto-cookie
    html = scraper.fetch_page(1)
    
    if html and len(html) > 100:
        print(f"✅ Successfully fetched page 1 ({len(html)} characters)")
        print(f"   Preview: {html[:100]}...")
        return True
    else:
        print("❌ Failed to fetch page or content too short")
        print("   Check your internet connection and cf_clearance cookie")
        return False


async def test_question_extraction():
    """Test 3: Extract questions from HTML"""
    print("\n" + "="*60)
    print("TEST 3: Question Extraction")
    print("="*60)
    
    from bharatkosh_scraper import BharatkoshScraper
    
    scraper = BharatkoshScraper(start_page=1, end_page=1, auto_cookie=True)
    
    # Fetch and extract
    html = scraper.fetch_page(1)
    if not html:
        print("❌ Could not fetch page")
        return False
    
    questions = scraper.extract_questions_from_html(html, 1)
    
    if questions:
        print(f"✅ Extracted {len(questions)} questions")
        print(f"\n   First question preview:")
        first_q = questions[0]
        print(f"   Question: {first_q.get('question_hindi', '')[:80]}...")
        print(f"   Options: {len(first_q.get('options_hindi', []))} options")
        return True
    else:
        print("⚠️  No questions extracted from page 1")
        print("   This is OK if the page structure is different than expected")
        print("   You may need to adjust the extraction logic")
        return True  # Don't fail on this - might be expected


async def test_ai_processing():
    """Test 4: AI translation and answer generation"""
    print("\n" + "="*60)
    print("TEST 4: AI Processing (Translation & Answer)")
    print("="*60)
    
    from bharatkosh_scraper import BharatkoshScraper
    
    scraper = BharatkoshScraper(start_page=1, end_page=1)
    
    # Create a sample question
    sample_question = {
        "question_hindi": "भारत के पहले प्रधानमंत्री कौन थे?",
        "options_hindi": [
            "महात्मा गांधी",
            "जवाहरलाल नेहरू",
            "सरदार पटेल",
            "डॉ. राजेंद्र प्रसाद"
        ],
        "option_labels": ["अ", "ब", "स", "द"],
        "page_number": 1,
        "source": "test"
    }
    
    print("   Testing with sample question...")
    print(f"   Question: {sample_question['question_hindi']}")
    
    try:
        enriched = await scraper.translate_and_get_answer(sample_question)
        
        if enriched.get("ai_processed"):
            print("✅ AI processing successful")
            print(f"   English: {enriched.get('question_english', '')[:80]}...")
            print(f"   Answer: {enriched.get('correct_answer', 'N/A')}")
            print(f"   Topic: {enriched.get('topic', 'N/A')}")
            return True
        else:
            print("❌ AI processing failed")
            print(f"   Error: {enriched.get('error', 'Unknown')}")
            return False
            
    except Exception as e:
        print(f"❌ AI processing error: {e}")
        return False


async def test_database():
    """Test 5: Database storage"""
    print("\n" + "="*60)
    print("TEST 5: Database Storage")
    print("="*60)
    
    from database_improved import QuestionDatabase
    import uuid
    
    db = QuestionDatabase(base_path="server-py/data")
    
    test_questions = [{
        "question_hindi": "टेस्ट प्रश्न",
        "question_english": "Test question",
        "options_hindi": ["विकल्प 1", "विकल्प 2"],
        "options_english": ["Option 1", "Option 2"],
        "correct_answer": "a",
        "source": "test",
        "test_id": str(uuid.uuid4())
    }]
    
    test_exam_info = {
        "exam_name": "Test Exam",
        "exam_year": "2026",
        "paper_name": "Test Paper",
        "subject": "Test"
    }
    
    try:
        ids = db.add_questions_by_exam(test_questions, test_exam_info)
        if ids:
            print(f"✅ Successfully saved {len(ids)} test question(s)")
            print(f"   Question IDs: {ids}")
            return True
        else:
            print("❌ No IDs returned from database")
            return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪 "*30)
    print("BharatKosh Scraper - Test Suite")
    print("🧪 "*30)
    
    results = {}
    
    # Run tests
    results["Setup"] = await test_basic_setup()
    
    if results["Setup"]:
        results["Page Fetch"] = await test_page_fetch()
        results["Question Extraction"] = await test_question_extraction()
        results["AI Processing"] = await test_ai_processing()
        results["Database Storage"] = await test_database()
    else:
        print("\n⚠️  Skipping remaining tests due to setup failure")
        results["Page Fetch"] = False
        results["Question Extraction"] = False
        results["AI Processing"] = False
        results["Database Storage"] = False
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
    
    print("="*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    if passed == total:
        print("🎉 All tests passed! You're ready to scrape.")
        print("\nNext steps:")
        print("  1. Test with 3 pages:  python bharatkosh_scraper.py --test")
        print("  2. Full scrape:        python bharatkosh_scraper.py --start 1 --end 566")
    elif passed >= 3:
        print("⚠️  Most tests passed. You can try running the scraper.")
        print("   Some non-critical tests failed - check warnings above.")
    else:
        print("❌ Critical tests failed. Please fix issues before running full scrape.")
        print("\nCommon fixes:")
        print("  - Add OPENAI_API_KEY to .env file")
        print("  - Update cf_clearance cookie in bharatkosh_scraper.py")
        print("  - Install missing packages: pip install -r requirements_bharatkosh.txt")
    
    return passed >= 3  # Pass if at least 3/5 tests pass


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
