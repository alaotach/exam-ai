import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, BookOpen, Lightbulb, Calculator, Beaker, Globe, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import { ChatMessage } from '@/types';

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your AI study assistant. You can ask me questions about any subject, and I\'ll help explain concepts, solve problems, and provide detailed explanations. What would you like to learn about today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const suggestions = [
    { text: "Explain Newton's laws", icon: BookOpen, color: "#FF6B6B" },
    { text: "Help with calculus", icon: Calculator, color: "#4ECDC4" },
    { text: "Chemistry concepts", icon: Beaker, color: "#45B7D1" },
    { text: "Geography facts", icon: Globe, color: "#96CEB4" },
  ];

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedSuggestion(null);
    setIsTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    handleSendMessage(suggestion);
  };

  const copyToClipboard = (text: string) => {
    // Implementation would copy text to clipboard
    console.log('Copying to clipboard:', text);
  };

  const provideFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('newton') && message.includes('law')) {
      return `Newton's Laws of Motion are fundamental principles in physics:

**First Law (Law of Inertia):** An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an external force.

**Second Law:** The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma

**Third Law:** For every action, there is an equal and opposite reaction.

These laws help us understand how objects move and interact with forces. Would you like me to explain any specific law in more detail or provide examples?`;
    }
    
    if (message.includes('derivative') || message.includes('calculus')) {
      return `A derivative represents the rate of change of a function at any given point. It's one of the fundamental concepts in calculus.

**Basic Rules:**
- Power Rule: d/dx(x^n) = nx^(n-1)
- Sum Rule: d/dx(f + g) = f' + g'
- Product Rule: d/dx(fg) = f'g + fg'
- Chain Rule: d/dx(f(g(x))) = f'(g(x)) × g'(x)

**Example:** The derivative of x² is 2x, which means the slope of the curve y = x² at any point x is 2x.

Would you like me to work through a specific derivative problem with you?`;
    }
    
    if (message.includes('photosynthesis')) {
      return `Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).

**Chemical Equation:**
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**Two Main Stages:**
1. **Light Reactions** (in thylakoids): Convert light energy to ATP and NADPH
2. **Calvin Cycle** (in stroma): Use ATP and NADPH to convert CO₂ into glucose

**Importance:**
- Produces oxygen for life on Earth
- Forms the base of most food chains
- Removes CO₂ from the atmosphere

Need help with any specific aspect of photosynthesis?`;
    }
    
    // Default responses for common question types
    if (message.includes('explain') || message.includes('what is') || message.includes('how')) {
      return `I'd be happy to help explain that concept! However, I need a bit more specific information to give you the best answer. Could you tell me:

- Which subject area this relates to?
- Any specific aspects you'd like me to focus on?
- Your current level of understanding?

This will help me tailor my explanation to be most helpful for you.`;
    }
    
    return `That's an interesting question! I'm here to help you understand various academic concepts. I can assist with:

📚 **Mathematics** - Algebra, calculus, geometry, statistics
🔬 **Science** - Physics, chemistry, biology, earth science  
🌍 **Social Studies** - History, geography, civics
💻 **Computer Science** - Programming concepts, algorithms
📝 **Language Arts** - Grammar, writing, literature

Feel free to ask me anything specific about these subjects, and I'll provide detailed explanations with examples!`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.botIcon}>
              <Sparkles size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Study Assistant</Text>
              <Text style={styles.headerSubtitle}>Your personal tutor</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick Start</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionChip, { borderColor: suggestion.color }]}
                onPress={() => handleSuggestionPress(suggestion.text)}
              >
                <suggestion.icon size={16} color={suggestion.color} />
                <Text style={[styles.suggestionText, { color: suggestion.color }]}>
                  {suggestion.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <View style={styles.userAvatar}>
                    <User size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.botAvatar}>
                    <Bot size={16} color="#FFFFFF" />
                  </View>
                )}
                <Text style={styles.messageSender}>
                  {message.isUser ? 'You' : 'AI Assistant'}
                </Text>
              </View>
              <Text style={styles.messageText}>{message.message}</Text>
              
              {/* Action buttons for AI messages */}
              {!message.isUser && (
                <View style={styles.messageActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => copyToClipboard(message.message)}
                  >
                    <Copy size={14} color="#8E8E93" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => provideFeedback(message.id, true)}
                  >
                    <ThumbsUp size={14} color="#8E8E93" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => provideFeedback(message.id, false)}
                  >
                    <ThumbsDown size={14} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <View style={styles.botAvatar}>
                  <Bot size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.messageSender}>AI Assistant</Text>
              </View>
              <View style={styles.typingIndicator}>
                <Animated.View style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]} />
                <Animated.View style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                  },
                ]} />
                <Animated.View style={[
                  styles.typingDot,
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.3],
                    }),
                  },
                ]} />
              </View>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything about your studies..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? '#007AFF' : '#E5E5EA' }
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerGradient: {
    paddingBottom: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  suggestionsScroll: {
    paddingVertical: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8E8E93',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    color: '#1C1C1E',
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 120,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});