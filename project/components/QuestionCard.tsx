import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Question } from '@/types';
import Card from './Card';
import Button from './Button';

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (selectedIndex: number, isCorrect: boolean) => void;
  showAnswer?: boolean;
}

export default function QuestionCard({ question, onAnswerSelect, showAnswer = false }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null && !showAnswer) return;
    
    setSelectedOption(index);
    const isCorrect = index === question.correctAnswer;
    
    if (!showAnswer) {
      setShowExplanation(true);
      onAnswerSelect(index, isCorrect);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showExplanation && !showAnswer) {
      return selectedOption === index ? styles.selectedOption : styles.option;
    }
    
    if (index === question.correctAnswer) {
      return styles.correctOption;
    }
    
    if (selectedOption === index && index !== question.correctAnswer) {
      return styles.incorrectOption;
    }
    
    return styles.option;
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.subject}>{question.subject}</Text>
        <Text style={styles.difficulty}>{question.difficulty}</Text>
      </View>
      
      <Text style={styles.questionText}>{question.question}</Text>
      
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleOptionSelect(index)}
            disabled={showExplanation && !showAnswer}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
              <Text style={styles.optionText}>{option}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {(showExplanation || showAnswer) && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subject: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  difficulty: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F0F8FF',
  },
  correctOption: {
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F0FFF4',
  },
  incorrectOption: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF5F5',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    minWidth: 20,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    flex: 1,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3A3A3C',
    lineHeight: 20,
  },
});