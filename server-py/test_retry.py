#!/usr/bin/env python3
"""
Test retry functionality for VLM service
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

load_dotenv()

from vlm_service import VLMService

async def test_vlm_retry():
    """Test VLM retry functionality with a fake timeout"""
    print("🧪 Testing VLM retry functionality...")
    
    # Initialize VLM service
    vlm = VLMService()
    
    # Create a dummy base64 image (tiny valid base64 encoded image)
    test_image = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"
    
    # Test normal operation first (should succeed)
    print("\n1️⃣ Testing normal operation...")
    try:
        result = await vlm.extract_text_async(test_image, 999)
        if result.get('error'):
            print(f"⚠️ Got error (expected with test image): {result['error']}")
        else:
            print(f"✅ Normal operation completed: {len(result.get('extracted_text', ''))} chars")
    except Exception as e:
        print(f"⚠️ Exception during test (expected): {e}")
    
    # Temporarily monkey-patch the sync method to always timeout for testing
    original_method = vlm._extract_text_sync
    attempt_count = 0
    
    def mock_extract_that_timeouts(self, image_base64, page_number):
        nonlocal attempt_count
        attempt_count += 1
        print(f"🎭 Mock attempt #{attempt_count} - simulating timeout...")
        import requests
        raise requests.exceptions.ReadTimeout("Read timed out. (read timeout=120)")
    
    # Apply the mock
    vlm._extract_text_sync = lambda img, page: mock_extract_that_timeouts(vlm, img, page)
    
    print("\n2️⃣ Testing retry functionality with forced timeouts...")
    try:
        result = await vlm.extract_text_async(test_image, 888)
        print(f"🤔 Unexpected success: {result}")
    except Exception as e:
        print(f"✅ Expected final failure after retries: {type(e).__name__}: {e}")
        print(f"🔢 Total attempts made: {attempt_count}")
        
        if attempt_count >= 4:  # Should be 4 attempts (initial + 3 retries)
            print("✅ Retry logic worked correctly!")
        else:
            print(f"❌ Expected 4+ attempts, got {attempt_count}")
    
    # Restore original method
    vlm._extract_text_sync = original_method
    
    print("\n✅ Retry test completed")

if __name__ == "__main__":
    asyncio.run(test_vlm_retry())