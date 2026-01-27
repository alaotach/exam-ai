# 📋 Quick Reference Card - SSC CGL Mock Tests

## 🎯 Quick Commands

```bash
# Install dependencies
cd project
npm install

# Run development server
npm run dev

# Run on iOS
npm run dev
# Then press 'i'

# Run on Android
npm run dev
# Then press 'a'
```

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `app/test-list.tsx` | Browse & select tests | ~300 |
| `app/mock-test.tsx` | Take the test | ~700 |
| `app/test-result.tsx` | View results | ~800 |
| `services/ssc-cgl-service.ts` | Core logic | ~500 |

## 🔗 Navigation Routes

```
/test-list       → Test browser
/mock-test       → Test interface
/test-result     → Results & analytics
```

## 🎨 Color Scheme

```typescript
// Primary Gradients
Test Cards:     ['#4A90E2', '#357ABD']  // Blue
Score (Good):   ['#4CAF50', '#45a049']  // Green
Score (Avg):    ['#FF9800', '#FB8C00']  // Orange
Score (Low):    ['#F44336', '#E53935']  // Red

// Status Colors
Answered:       '#4CAF50'  // Green
Marked:         '#FF9800'  // Orange
Not Visited:    '#e0e0e0'  // Gray
Current:        '#4A90E2'  // Blue
```

## 📊 Data Structure

```typescript
// Test Paper
{
  id: string,
  title: string,
  duration: number,        // seconds
  sections: Section[],
  totalQuestions: number,
  totalMarks: number
}

// Question
{
  id: string,
  questionText: string,    // HTML
  options: string[],       // 4 options
  correctAnswerIndex: number,
  explanation: { english, hindi },
  marks: { positive, negative }
}

// Test Attempt
{
  testId: string,
  startTime: Date,
  answers: UserAnswer[],
  status: 'in_progress' | 'completed'
}
```

## 🔧 Service Methods

```typescript
// Load paper
SSCCGLService.loadPaper(paperData, answersData)

// Get all papers
SSCCGLService.getAllPapers()

// Start attempt
SSCCGLService.startTestAttempt(testId, userId)

// Record answer
SSCCGLService.recordAnswer(attemptId, questionId, optionIndex, timeTaken, question)

// Submit test
SSCCGLService.submitTest(attemptId)
```

## 📱 Screen Components

### Test List
```typescript
<TouchableOpacity onPress={() => router.push('/test-list')}>
  Browse Tests
</TouchableOpacity>
```

### Start Test
```typescript
router.push({
  pathname: '/mock-test',
  params: { testId: 'test_id_here' }
});
```

### View Results
```typescript
router.push({
  pathname: '/test-result',
  params: { attemptId: 'attempt_id_here' }
});
```

## 🎯 Key Features Checklist

### Test Interface
- [x] Live countdown timer
- [x] Question navigation (prev/next)
- [x] Question palette modal
- [x] Mark for review
- [x] Auto-save answers
- [x] Submit confirmation
- [x] Auto-submit on timeout

### Analytics
- [x] Overall score & percentage
- [x] Section-wise breakdown
- [x] Question review with solutions
- [x] Strengths/weaknesses
- [x] AI recommendations
- [x] Time analysis

### UI/UX
- [x] Gradient cards
- [x] Color-coded status
- [x] HTML question rendering
- [x] Smooth animations
- [x] Loading states
- [x] Error handling

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Papers not loading | Check file paths in `require()` |
| Timer not starting | Verify duration is in seconds |
| HTML not rendering | Install `react-native-render-html` |
| Navigation error | Check screen file locations |
| Type errors | Run `npm install` for TypeScript types |

## 💡 Pro Tips

1. **Load Papers**: Load papers in `_layout.tsx` useEffect
2. **Test Data**: Start with 1-2 papers, then add more
3. **Performance**: Use lazy loading for many papers
4. **Debugging**: Check console for paper loading status
5. **Styling**: Use existing gradient patterns for consistency

## 📖 Documentation Files

- `MOCK_TEST_README.md` - Complete features
- `INSTALLATION.md` - Setup guide
- `PROJECT_SUMMARY.md` - Overview

## 🚀 Quick Test Flow

```bash
# 1. Install
npm install

# 2. Load a paper (in _layout.tsx)
const paper = require('../SSC_CGL/paper.json');
const answers = require('../ai_generated_answers/paper.json');
await SSCCGLService.loadPaper(paper.data, answers);

# 3. Run
npm run dev

# 4. Navigate
Home → "SSC CGL Mock Tests" → Select test → Take test → Submit → View results
```

## 📞 Support

- Check inline code comments
- Review documentation files
- Inspect console logs
- Test with 1-2 papers first

---

**Ready to go! 🎉**

Keep this card handy for quick reference while developing.
