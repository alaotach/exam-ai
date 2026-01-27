# SSC CGL Mock Test System

A comprehensive mock test system with beautiful UI and detailed analytics for SSC CGL exam preparation.

## 🎯 Features

### 1. **Full-Length Mock Tests**
- ✅ 50+ SSC CGL previous year papers (2020-2023)
- ✅ Original questions with all options
- ✅ Multiple sections (General Intelligence, Reasoning, Quantitative Aptitude, etc.)
- ✅ Timed tests with countdown timer
- ✅ Question navigation palette

### 2. **AI-Powered Solutions**
- ✅ Detailed explanations in English and Hindi
- ✅ Key concepts for each question
- ✅ Correct answer identification
- ✅ Step-by-step solutions

### 3. **Interactive Test Interface**
- ✅ Beautiful, intuitive UI
- ✅ Real-time timer with auto-submit
- ✅ Question palette with status indicators
  - 🟢 Answered questions
  - 🟡 Marked for review
  - ⚪ Not visited
- ✅ Mark for review functionality
- ✅ Previous/Next navigation
- ✅ Submission confirmation with statistics

### 4. **Comprehensive Analytics**
- ✅ **Overview Tab**
  - Overall score and percentage
  - Accuracy metrics
  - Time taken analysis
  - Strengths and weaknesses identification
  - AI-generated recommendations

- ✅ **Sections Tab**
  - Section-wise performance breakdown
  - Attempted vs skipped questions
  - Average time per question
  - Section accuracy visualization

- ✅ **Solutions Tab**
  - Question-by-question review
  - Correct/incorrect/skipped status
  - Your answer vs correct answer comparison
  - Detailed explanations with key concepts
  - Color-coded options (green=correct, red=wrong)

## 📁 File Structure

```
project/
├── app/
│   ├── mock-test.tsx          # Main test-taking screen
│   ├── test-list.tsx          # Test selection/browsing screen
│   ├── test-result.tsx        # Results and analytics screen
│   └── (tabs)/
│       └── index.tsx          # Home screen (with mock test button)
│
└── services/
    ├── ssc-cgl-service.ts     # Core service for managing tests
    ├── ssc-cgl-loader.ts      # Data loading utilities
    └── ssc-cgl-mock-data.ts   # Mock data initialization
```

## 🚀 Getting Started

### 1. Data Location
Your SSC CGL papers are in:
```
exam-ai/
├── SSC_CGL/                   # Original test papers
└── ai_generated_answers/      # AI-generated explanations
```

### 2. Data Format

**Test Paper Format** (`SSC_CGL/*.json`):
```json
{
  "success": true,
  "data": {
    "_id": "test_id",
    "title": "SSC CGL 2020 Tier-I Official Paper...",
    "course": "SSC",
    "duration": 3600,
    "sections": [
      {
        "_id": "section_id",
        "title": "General Intelligence and Reasoning",
        "qCount": 25,
        "questions": [
          {
            "_id": "question_id",
            "type": "mcq",
            "posMarks": 2,
            "negMarks": 0.5,
            "en": {
              "value": "<p>Question text...</p>",
              "options": [
                {"prompt": "1", "value": "Option A"},
                {"prompt": "2", "value": "Option B"},
                {"prompt": "3", "value": "Option C"},
                {"prompt": "4", "value": "Option D"}
              ]
            }
          }
        ]
      }
    ]
  }
}
```

**AI Answers Format** (`ai_generated_answers/*.json`):
```json
{
  "test_id": "...",
  "sections": [
    {
      "section_name": "...",
      "questions": [
        {
          "question_id": "...",
          "ai_generated": {
            "english": {
              "correct_answer": "2. 13",
              "explanation": "Detailed explanation...",
              "key_concepts": ["Concept 1", "Concept 2"]
            },
            "hindi": {
              "correct_answer": "2. 13",
              "explanation": "Hindi explanation...",
              "key_concepts": ["अवधारणा 1", "अवधारणा 2"]
            }
          }
        }
      ]
    }
  ]
}
```

### 3. Loading Papers into the App

**Option A: Manual Loading (Recommended for Development)**
```typescript
import SSCCGLService from '@/services/ssc-cgl-service';

// Load a single paper
const paperData = require('../SSC_CGL/paper_name.json');
const answersData = require('../ai_generated_answers/paper_name.json');

await SSCCGLService.loadPaper(paperData.data, answersData);
```

**Option B: Automatic Loading (For Production)**
Create a script to load all papers:
```typescript
import { loadAllPapers } from '@/services/ssc-cgl-loader';

// In your App.tsx or _layout.tsx
useEffect(() => {
  loadAllPapers();
}, []);
```

### 4. Navigation Flow

```
Home Screen (index.tsx)
    ↓
    [Browse Tests Button]
    ↓
Test List Screen (test-list.tsx)
    ↓
    [Select a Test]
    ↓
Mock Test Screen (mock-test.tsx)
    ↓
    [Complete Test]
    ↓
Test Result Screen (test-result.tsx)
    ↓
    [Back to Tests / Share Result]
```

## 🎨 UI Components

### Test List Screen
- **Search Bar**: Filter tests by title, date, or exam type
- **Year Filters**: Quick filter by year (2020, 2021, 2022, 2023)
- **Test Cards**: Beautiful gradient cards showing:
  - Test title and exam type
  - Date and shift information
  - Question count, duration, and total marks
  - Number of sections

### Mock Test Screen
- **Header**:
  - Timer with color coding (green → yellow → red)
  - Test title
  - Question palette button
  - Quick stats (answered, not attempted, marked)

- **Question Area**:
  - Question number and marks (positive/negative)
  - HTML-rendered question text
  - Four options with radio buttons
  - Visual feedback for selected option

- **Footer**:
  - Mark for review button (with flag icon)
  - Previous/Next navigation
  - Submit button (on last question)

- **Question Palette Modal**:
  - Section-wise question grid
  - Color-coded status indicators
  - One-tap navigation to any question
  - Legend for status colors

### Test Result Screen
- **Overview Tab**:
  - Large score card with gradient (green/orange/red based on score)
  - Progress bar showing percentage
  - Quick stats (correct, incorrect, skipped)
  - Strengths and weaknesses chips
  - AI recommendations with priority badges

- **Sections Tab**:
  - Individual section performance cards
  - Accuracy badges with color coding
  - Progress bars for each section
  - Detailed stats (attempted, correct, incorrect, skipped)
  - Average time per question

- **Solutions Tab**:
  - Complete question review
  - Your answer vs correct answer comparison
  - Color-coded options
  - Detailed explanations in highlighted boxes
  - Key concepts as chips
  - Status badges (correct/incorrect/skipped)

## 📊 Analytics & Insights

### Performance Metrics
- **Overall Score**: Total marks earned out of maximum
- **Accuracy**: Percentage of correct answers
- **Time Management**: Total time taken and per-question average
- **Section Analysis**: Performance breakdown by subject

### AI Recommendations
Based on your performance, the system generates:
- Focus areas for improvement
- Speed optimization suggestions
- Attempt strategy recommendations
- Topic-wise practice suggestions

### Visual Indicators
- 🟢 **Green**: Strong performance (>75%)
- 🟡 **Orange**: Needs improvement (50-75%)
- 🔴 **Red**: Weak area (<50%)

## 🔧 Customization

### Changing Colors
Edit the gradient colors in each component:
```typescript
<LinearGradient
  colors={['#4A90E2', '#357ABD']}  // Your custom colors
  // ...
/>
```

### Modifying Timer
Adjust timer behavior in `mock-test.tsx`:
```typescript
const [timeRemaining, setTimeRemaining] = useState(paper.duration);
// Change auto-submit behavior, warning thresholds, etc.
```

### Analytics Thresholds
Modify strength/weakness thresholds in `ssc-cgl-service.ts`:
```typescript
if (section.accuracy >= 70) {  // Change this value
  strengthAreas.push(section.sectionTitle);
}
```

## 🎯 Best Practices

1. **Load papers efficiently**: Only load papers when needed, not all at once
2. **Cache results**: Store test attempts locally for offline access
3. **Optimize images**: Compress question images to reduce load time
4. **Handle errors**: Add error boundaries for graceful failure handling
5. **Add progress tracking**: Show upload/loading progress for better UX

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (with some adjustments for HTML rendering)

## 🔮 Future Enhancements

- [ ] Offline mode with cached papers
- [ ] Bookmarking questions
- [ ] Practice mode (untimed)
- [ ] Comparison with previous attempts
- [ ] Leaderboard integration
- [ ] Share results on social media
- [ ] PDF export of results
- [ ] Voice explanations
- [ ] Dark mode support
- [ ] Multi-language support (Hindi UI)

## 🐛 Troubleshooting

### Papers not loading
- Check file paths in require() statements
- Verify JSON file structure matches expected format
- Check console for error messages

### Timer not working
- Ensure duration is in seconds
- Check if timer is properly cleared on unmount
- Verify auto-submit logic

### HTML rendering issues
- Install `react-native-render-html` package
- Adjust contentWidth for your device
- Check for unsupported HTML tags

## 📝 Notes

- All papers are loaded into memory, so be mindful of memory usage with large numbers of papers
- Consider implementing lazy loading for better performance
- The service uses a singleton pattern for easy access across the app
- Test attempts are stored in memory and cleared on app restart

## 🙏 Credits

- SSC CGL papers sourced from Testbook
- AI-generated explanations using HackClub AI
- Icons from Lucide React Native
- Gradients from Expo Linear Gradient

---

**Happy Testing! 🎉**
