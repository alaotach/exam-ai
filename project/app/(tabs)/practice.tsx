import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Card from '@/components/Card';
import Button from '@/components/Button';
import QuestionCard from '@/components/QuestionCard';
import Timer from '@/components/Timer';
import { mockQuestions, mockTests } from '@/data/mockData';
import { Question, MockTest } from '@/types';

type PracticeMode = 'selection' | 'personalized' | 'mock' | 'question' | 'result';

interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  accuracy: number;
}

export default function PracticeScreen() {
  const [mode, setMode] = useState<PracticeMode>('selection');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);

  const handleStartPersonalizedPractice = () => {
    if (!selectedSubject.trim()) {
      Alert.alert('Error', 'Please enter a subject/topic');
      return;
    }
    if (!selectedDifficulty) {
      Alert.alert('Error', 'Please select a difficulty level');
      return;
    }

    const filteredQuestions = mockQuestions.filter(q => 
      q.subject.toLowerCase().includes(selectedSubject.toLowerCase()) &&
      q.difficulty === selectedDifficulty
    );

    if (filteredQuestions.length === 0) {
      // If no exact match, show questions from selected difficulty
      const difficultyQuestions = mockQuestions.filter(q => q.difficulty === selectedDifficulty);
      setCurrentQuestions(difficultyQuestions.slice(0, 5));
    } else {
      setCurrentQuestions(filteredQuestions.slice(0, 5));
    }

    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMode('question');
  };

  const handleStartMockTest = (test: MockTest) => {
    setSelectedTest(test);
    setCurrentQuestions(test.questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestStartTime(new Date());
    setIsTimerRunning(true);
    setMode('mock');
  };

  const handleAnswerSelect = (selectedIndex: number, isCorrect: boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedIndex
    }));

    // Auto-advance after 2 seconds for personalized practice
    if (mode === 'question') {
      setTimeout(() => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          calculateResult();
        }
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    setIsTimerRunning(false);
    calculateResult();
  };

  const calculateResult = () => {
    const correctAnswers = Object.entries(userAnswers).reduce((count, [questionIndex, answerIndex]) => {
      const question = currentQuestions[parseInt(questionIndex)];
      return count + (question.correctAnswer === answerIndex ? 1 : 0);
    }, 0);

    const totalQuestions = currentQuestions.length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const timeTaken = testStartTime ? Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000) : 0;
    const score = Math.floor((correctAnswers / totalQuestions) * (selectedTest?.totalMarks || 100));

    setTestResult({
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      accuracy,
    });
    setMode('result');
  };

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    calculateResult();
  };

  const resetPractice = () => {
    setMode('selection');
    setSelectedSubject('');
    setSelectedDifficulty('');
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsTimerRunning(false);
    setTestStartTime(null);
    setTestResult(null);
    setSelectedTest(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (mode === 'result' && testResult) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Card>
            <Text style={styles.title}>Test Results</Text>
            <View style={styles.resultContainer}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>{testResult.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{testResult.correctAnswers}/{testResult.totalQuestions}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{testResult.accuracy.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatTime(testResult.timeTaken)}</Text>
                  <Text style={styles.statLabel}>Time Taken</Text>
                </View>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Review Answers" onPress={() => setMode('question')} variant="secondary" />
              <Button title="Try Again" onPress={resetPractice} variant="primary" />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (mode === 'question' || mode === 'mock') {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    const hasAnswered = userAnswers[currentQuestionIndex] !== undefined;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.questionHeader}>
          {mode === 'mock' && selectedTest && (
            <Timer 
              duration={selectedTest.duration * 60} 
              onTimeUp={handleTimeUp}
              isRunning={isTimerRunning}
            />
          )}
          <Text style={styles.questionProgress}>
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <QuestionCard 
            question={currentQuestion}
            onAnswerSelect={handleAnswerSelect}
            showAnswer={testResult !== null}
          />
          
          {mode === 'mock' && (
            <View style={styles.navigationContainer}>
              <Button 
                title="Previous" 
                onPress={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="secondary"
                size="medium"
              />
              {isLastQuestion ? (
                <Button 
                  title="Submit Test" 
                  onPress={handleSubmitTest}
                  variant="success"
                  size="medium"
                />
              ) : (
                <Button 
                  title="Next" 
                  onPress={handleNextQuestion}
                  variant="primary"
                  size="medium"
                />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Practice & Mock Tests</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Personalized Practice</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Subject/Topic</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Mathematics, Physics, History"
              value={selectedSubject}
              onChangeText={setSelectedSubject}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Difficulty Level</Text>
            <View style={styles.difficultyContainer}>
              {(['Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
                <Button
                  key={difficulty}
                  title={difficulty}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  variant={selectedDifficulty === difficulty ? 'primary' : 'secondary'}
                  size="medium"
                  style={styles.difficultyButton}
                />
              ))}
            </View>
          </View>
          
          <Button 
            title="Start Practice" 
            onPress={handleStartPersonalizedPractice}
            variant="success"
            size="large"
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Mock Tests</Text>
          <View style={styles.mockTestsContainer}>
            {mockTests.map((test) => (
              <View key={test.id} style={styles.mockTestItem}>
                <View style={styles.mockTestInfo}>
                  <Text style={styles.mockTestName}>{test.name}</Text>
                  <Text style={styles.mockTestDetails}>
                    {test.questions.length} Questions • {test.duration} mins • {test.totalMarks} marks
                  </Text>
                </View>
                <Button
                  title="Start"
                  onPress={() => handleStartMockTest(test)}
                  variant="primary"
                  size="small"
                />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginVertical: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
  },
  mockTestsContainer: {
    gap: 12,
  },
  mockTestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mockTestInfo: {
    flex: 1,
  },
  mockTestName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  mockTestDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  questionProgress: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginTop: 4,
  },
});