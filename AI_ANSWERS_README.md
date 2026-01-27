# AI Answer Generation Setup

## Overview
This script generates answers and explanations for test questions using HackClub AI API in both English and Hindi.

## Setup Instructions

### 1. Get HackClub AI API Key
Visit [HackClub AI](https://ai.hackclub.com/) to get your API key.

### 2. Configure the Script
Open `generate_ai_answers.py` and replace the API key:
```python
HACKCLUB_API_KEY = "your-actual-api-key-here"
```

### 3. Install Dependencies
```bash
pip install requests
```

### 4. Run the Script
```bash
python generate_ai_answers.py
```

## Output Structure

Each question gets its own JSON file named by question ID:
```
ai_generated_answers/
  ├── 6704efe61a1bbb5b40768e74.json
  ├── 6705033ffa58171821486318.json
  └── ...
```

### Output Format
```json
{
  "question_id": "6704efe61a1bbb5b40768e74",
  "section": "Quantitative Aptitude",
  "original_question": "Question text...",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "ai_generated": {
    "english": {
      "answer_and_explanation": "Detailed answer in English...",
      "generated_at": "2026-01-26 10:30:00"
    },
    "hindi": {
      "answer_and_explanation": "Hindi में विस्तृत उत्तर...",
      "generated_at": "2026-01-26 10:30:05"
    }
  }
}
```

## Features

- **Automatic Resume**: Skips already processed questions
- **Rate Limiting**: Built-in delays to respect API limits
- **Error Handling**: Graceful handling of API failures
- **Progress Tracking**: Shows real-time processing status
- **Bilingual Support**: Generates answers in both English and Hindi

## Usage Tips

1. **API Rate Limits**: The script includes 1-second delays between API calls. Adjust if needed.

2. **Batch Processing**: The script processes all test papers. You can modify it to process specific files.

3. **Cost Estimation**: Each question requires 2 API calls (English + Hindi). Calculate costs accordingly.

4. **Resume Capability**: If interrupted, simply run again - it will skip already processed questions.

## Alternative: Use Environment Variable

For better security, you can use an environment variable:

1. Set the environment variable:
   ```bash
   # Windows PowerShell
   $env:HACKCLUB_API_KEY = "your-api-key"
   
   # Windows CMD
   set HACKCLUB_API_KEY=your-api-key
   ```

2. Modify the script to read from environment:
   ```python
   import os
   HACKCLUB_API_KEY = os.getenv('HACKCLUB_API_KEY', 'your-api-key-here')
   ```

## Troubleshooting

### API Key Error
If you see "ERROR: Please set your HackClub API key", edit the script and add your actual API key.

### Rate Limit Errors
If you hit rate limits, increase the `time.sleep()` values in the script.

### Unicode Errors
The script uses UTF-8 encoding. If you see encoding errors on Windows, ensure your terminal supports UTF-8.

## Example: Process Single Test

To process just one test paper:
```python
# Modify main() function
test_file = "testbook_papers/specific_test.json"
process_test_paper(test_file)
```
