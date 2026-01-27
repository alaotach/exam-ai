# AI Assistant Feature

## Overview

The AI Assistant feature integrates real AI capabilities using the **Hack Club AI Proxy** to provide students with intelligent study assistance, doubt solving, and personalized learning support.

## Features

### 🤖 Conversational AI
- Real-time chat interface with Claude 3.5 Sonnet
- Context-aware responses
- Conversation history maintained throughout the session

### 💡 Quick Actions
- **Study Tips**: Get personalized study strategies and tips
- **Explain Concept**: Detailed explanations of complex topics
- **Solve Doubt**: Interactive doubt-solving assistance
- **Practice Questions**: Generate custom practice questions

### 🎯 Capabilities

1. **Question Explanations**
   - Detailed breakdown of questions
   - Step-by-step solutions
   - Concept explanations
   - Common mistake identification

2. **Doubt Solving**
   - Answer specific questions
   - Provide context-aware explanations
   - Simplify complex concepts
   - Multiple examples and analogies

3. **Study Assistance**
   - Performance analysis and insights
   - Personalized study plans
   - Subject-specific strategies
   - Time management tips

4. **Practice Generation**
   - Generate practice questions on any topic
   - Exam-specific question styles
   - Difficulty level customization
   - Instant feedback

## Technical Implementation

### Service Layer

**File**: `services/ai-assistant-service.ts`

```typescript
// Core functions available:
- sendChatMessage(messages, temperature)
- explainQuestion(questionText, options, correctAnswer, explanation)
- solveDoubt(doubtText, context)
- generatePracticeQuestions(topic, examType, count)
- getStudyTips(examType, subject, weakAreas)
- analyzePerformance(stats)
- chatWithHistory(conversationHistory, newMessage)
- simplifyText(text, targetLevel)
- getMnemonic(concept, details)
```

### API Configuration

- **Provider**: Hack Club AI Proxy
- **Endpoint**: `https://ai.hackclub.com/proxy/v1/chat/completions`
- **Model**: Claude 3.5 Sonnet (`anthropic/claude-3.5-sonnet`)
- **API Key**: Pre-configured (see service file)

### UI Components

**File**: `app/(tabs)/assistant.tsx`

- Clean, modern chat interface
- Message bubbles with timestamps
- Loading indicators
- Quick action buttons
- Keyboard-aware layout
- Pull-to-clear functionality

## Usage Examples

### In a Component

```typescript
import { explainQuestion, solveDoubt } from '@/services/ai-assistant-service';

// Get detailed explanation for a question
const explanation = await explainQuestion(
  "What is photosynthesis?",
  ["A. ...", "B. ...", "C. ...", "D. ..."],
  "B",
  "Photosynthesis is..."
);

// Solve a student doubt
const answer = await solveDoubt(
  "How does Newton's third law apply to rocket propulsion?",
  "Context: Learning about motion and forces"
);
```

### Chat Interface

```typescript
import { chatWithHistory } from '@/services/ai-assistant-service';

// Maintain conversation context
const history = [
  { role: 'user', content: 'Explain derivatives' },
  { role: 'assistant', content: 'Derivatives measure...' }
];

const response = await chatWithHistory(history, 'Can you give an example?');
```

## Integration Points

### Mock Test Screen
Add an "Ask AI" button for question explanations:

```typescript
import { explainQuestion } from '@/services/ai-assistant-service';

const handleAskAI = async (question: Question) => {
  const explanation = await explainQuestion(
    question.question,
    question.options,
    question.correct_answer,
    question.explanation
  );
  // Show in modal or navigation to assistant with pre-filled context
};
```

### Results Screen
Provide AI-powered performance insights:

```typescript
import { analyzePerformance } from '@/services/ai-assistant-service';

const insights = await analyzePerformance({
  totalTests: 15,
  averageScore: 72,
  weakSubjects: ['Chemistry', 'History'],
  strongSubjects: ['Math', 'Physics'],
  recentTrend: 'improving'
});
```

### Profile/Progress Screen
Generate study recommendations:

```typescript
import { getStudyTips } from '@/services/ai-assistant-service';

const tips = await getStudyTips(
  'SSC CGL',
  'Quantitative Aptitude',
  ['Geometry', 'Trigonometry']
);
```

## Rate Limits & Best Practices

### Hack Club Proxy Limits
- Free for students and learners
- Reasonable rate limits apply
- Be mindful of token usage

### Best Practices

1. **Error Handling**
   ```typescript
   try {
     const response = await sendChatMessage(messages);
     // Handle response
   } catch (error) {
     console.error('AI Error:', error);
     // Show user-friendly error message
   }
   ```

2. **Loading States**
   - Always show loading indicators
   - Disable input during processing
   - Provide user feedback

3. **Context Management**
   - Keep conversation history reasonably short
   - Clear old messages when switching topics
   - Limit message length (max 500 characters)

4. **Caching**
   - Cache common explanations
   - Store frequently asked questions
   - Reuse responses when appropriate

## Future Enhancements

### Planned Features
- [ ] Voice input support
- [ ] Save favorite responses
- [ ] Share conversations
- [ ] Multi-language support
- [ ] Image-based questions (using vision models)
- [ ] Personalized AI tutor profiles
- [ ] Integration with test analytics
- [ ] Flashcard generation from chats
- [ ] Study schedule generation
- [ ] Group study sessions with AI moderator

### Potential Integrations
- **Bookmarks**: AI explanations for bookmarked questions
- **Battle Mode**: AI-powered opponent with adjustable difficulty
- **Progress Tracking**: Automated insights and recommendations
- **Practice Tests**: AI-generated personalized tests
- **Study Groups**: AI-facilitated peer learning

## Troubleshooting

### Common Issues

1. **"Failed to get response"**
   - Check internet connection
   - Verify API key is valid
   - Check Hack Club proxy status

2. **Slow responses**
   - Normal for complex questions
   - Consider showing estimated time
   - Implement request timeout

3. **Poor quality responses**
   - Adjust temperature parameter
   - Provide more context
   - Refine system prompts

### Debug Mode

Add debug logging:

```typescript
// In ai-assistant-service.ts
const DEBUG = __DEV__;

if (DEBUG) {
  console.log('Request:', messages);
  console.log('Response:', data);
}
```

## Security & Privacy

- No conversation data is stored on backend
- API key is embedded in service (consider environment variables for production)
- User messages are sent to Hack Club's proxy (subject to their privacy policy)
- Implement user data sanitization before sending to AI
- Consider adding content filtering for sensitive information

## Cost Considerations

Currently **FREE** via Hack Club AI Proxy:
- No authentication required
- No usage billing
- Community-supported resource
- Intended for educational use

For production or high-volume usage:
- Consider migrating to direct Anthropic API
- Implement usage tracking
- Add rate limiting per user
- Consider caching strategies

## Credits

- **AI Provider**: Anthropic Claude 3.5 Sonnet
- **Proxy Service**: Hack Club AI Proxy
- **Free for students**: Thanks to Hack Club community

---

## Quick Start

1. **Import the service**:
   ```typescript
   import * as AIAssistant from '@/services/ai-assistant-service';
   ```

2. **Use in your component**:
   ```typescript
   const answer = await AIAssistant.solveDoubt("Your question here");
   ```

3. **Navigate to AI Assistant**:
   ```typescript
   router.push('/(tabs)/assistant');
   ```

That's it! The AI Assistant is ready to help students learn better. 🚀
