import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
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
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.message);
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
      <View style={styles.header}>
        <Bot size={24} color="#007AFF" />
        <Text style={styles.headerTitle}>AI Study Assistant</Text>
      </View>
      
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
                  <User size={16} color="#007AFF" />
                ) : (
                  <Bot size={16} color="#34C759" />
                )}
                <Text style={styles.messageSender}>
                  {message.isUser ? 'You' : 'AI Assistant'}
                </Text>
              </View>
              <Text style={styles.messageText}>{message.message}</Text>
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
                <Bot size={16} color="#34C759" />
                <Text style={styles.messageSender}>AI Assistant</Text>
              </View>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
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
            style={styles.sendButton}
            onPress={handleSendMessage}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
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
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
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
    gap: 6,
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8E8E93',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    color: '#1C1C1E',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});