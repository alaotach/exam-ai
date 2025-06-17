import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Crown, Clock, Users, Target, Trophy, Swords } from 'lucide-react-native';
import Card from '@/components/Card';
import { mockQuestions } from '@/data/mockData';

const { width, height } = Dimensions.get('window');

type GameState = 'waiting' | 'countdown' | 'question' | 'result' | 'gameOver';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isReady: boolean;
}

interface BattleQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLeft: number;
}

export default function BattleScreen() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<BattleQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [countdown, setCountdown] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [opponentAnswer, setOpponentAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Mock players
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'You',
      avatar: '👤',
      score: 0,
      streak: 0,
      isReady: true,
    },
    {
      id: '2',
      name: 'Alex_Pro',
      avatar: '🎮',
      score: 0,
      streak: 0,
      isReady: true,
    },
  ]);

  const maxQuestions = 5;

  // Start game
  const startGame = () => {
    setGameState('countdown');
    startCountdown();
  };

  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          loadNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const loadNextQuestion = () => {
    if (questionIndex >= maxQuestions) {
      setGameState('gameOver');
      return;
    }

    const question = mockQuestions[questionIndex];
    setCurrentQuestion({
      id: question.id,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      timeLeft: 10,
    });
    setGameState('question');
    setTimeLeft(10);
    setSelectedAnswer(null);
    setOpponentAnswer(null);
    setShowResult(false);
    
    // Simulate opponent thinking time (random delay)
    const opponentDelay = Math.random() * 8 + 1; // 1-9 seconds
    setTimeout(() => {
      if (gameState === 'question') {
        const randomAnswer = Math.floor(Math.random() * 4);
        setOpponentAnswer(randomAnswer);
      }
    }, opponentDelay * 1000);

    startQuestionTimer();
  };

  const startQuestionTimer = () => {
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 10000,
      useNativeDriver: false,
    }).start();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!selectedAnswer && !opponentAnswer) {
            // Both timeout
            showQuestionResult();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || gameState !== 'question') return;
    
    setSelectedAnswer(answerIndex);
    showQuestionResult();
  };

  const showQuestionResult = () => {
    setShowResult(true);
    calculateScores();
    
    setTimeout(() => {
      setQuestionIndex(prev => prev + 1);
      if (questionIndex + 1 >= maxQuestions) {
        setGameState('gameOver');
      } else {
        setCountdown(3);
        setGameState('countdown');
        startCountdown();
      }
    }, 3000);
  };

  const calculateScores = () => {
    if (!currentQuestion) return;

    const isPlayerCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const isOpponentCorrect = opponentAnswer === currentQuestion.correctAnswer;
    
    setPlayers(prev => prev.map(player => {
      if (player.id === '1') {
        // Player 1 (You)
        let points = 0;
        let newStreak = player.streak;
        
        if (isPlayerCorrect) {
          points = selectedAnswer !== null ? (timeLeft > 5 ? 100 : 75) : 50;
          newStreak += 1;
          if (selectedAnswer !== null && (opponentAnswer === null || selectedAnswer < opponentAnswer)) {
            points += 25; // Speed bonus
          }
        } else {
          newStreak = 0;
        }
        
        return {
          ...player,
          score: player.score + points,
          streak: newStreak,
        };
      } else {
        // Player 2 (Opponent)
        let points = 0;
        let newStreak = player.streak;
        
        if (isOpponentCorrect) {
          points = opponentAnswer !== null ? (timeLeft > 5 ? 100 : 75) : 50;
          newStreak += 1;
          if (opponentAnswer !== null && (selectedAnswer === null || opponentAnswer < selectedAnswer)) {
            points += 25; // Speed bonus
          }
        } else {
          newStreak = 0;
        }
        
        return {
          ...player,
          score: player.score + points,
          streak: newStreak,
        };
      }
    }));
  };

  const resetGame = () => {
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, streak: 0 })));
    setQuestionIndex(0);
    setGameState('waiting');
    setCountdown(3);
  };

  // Animations
  useEffect(() => {
    if (gameState === 'countdown') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [gameState, countdown]);

  const renderWaitingScreen = () => (
    <View style={styles.centerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gameCard}
      >
        <Swords size={64} color="#FFFFFF" />
        <Text style={styles.gameTitle}>Battle Arena</Text>
        <Text style={styles.gameSubtitle}>Quick-fire question battle</Text>
        
        <View style={styles.playersContainer}>
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerAvatar}>{player.avatar}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.readyBadge}>
                <Text style={styles.readyText}>READY</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.startButtonGradient}
          >
            <Zap size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>START BATTLE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderCountdown = () => (
    <View style={styles.centerContainer}>
      <Animated.View style={[styles.countdownContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.countdownText}>{countdown}</Text>
        <Text style={styles.countdownLabel}>Get Ready!</Text>
      </Animated.View>
    </View>
  );

  const renderQuestion = () => (
    <View style={styles.questionContainer}>
      {/* Header with scores */}
      <View style={styles.battleHeader}>
        <View style={styles.playerScore}>
          <Text style={styles.playerScoreAvatar}>{players[0].avatar}</Text>
          <Text style={styles.playerScoreName}>{players[0].name}</Text>
          <Text style={styles.playerScorePoints}>{players[0].score}</Text>
          {players[0].streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{players[0].streak}🔥</Text>
            </View>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.questionNumber}>{questionIndex + 1}/{maxQuestions}</Text>
        </View>

        <View style={styles.playerScore}>
          <Text style={styles.playerScoreAvatar}>{players[1].avatar}</Text>
          <Text style={styles.playerScoreName}>{players[1].name}</Text>
          <Text style={styles.playerScorePoints}>{players[1].score}</Text>
          {players[1].streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{players[1].streak}🔥</Text>
            </View>
          )}
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerProgress,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        <View style={styles.timerContent}>
          <Clock size={20} color="#FFFFFF" />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Question */}
      <Card style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>
      </Card>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === index && styles.selectedOption,
              showResult && index === currentQuestion.correctAnswer && styles.correctOption,
              showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && styles.wrongOption,
            ]}
            onPress={() => selectAnswer(index)}
            disabled={selectedAnswer !== null || showResult}
          >
            <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
            <Text style={[
              styles.optionText,
              selectedAnswer === index && styles.selectedOptionText,
              showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
            ]}>
              {option}
            </Text>
            {showResult && opponentAnswer === index && (
              <View style={styles.opponentIndicator}>
                <Text style={styles.opponentText}>{players[1].avatar}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Answer indicators */}
      <View style={styles.answerIndicators}>
        <View style={styles.answerStatus}>
          <Text style={styles.answerStatusText}>
            You: {selectedAnswer !== null ? 'Answered' : 'Thinking...'}
          </Text>
        </View>
        <View style={styles.answerStatus}>
          <Text style={styles.answerStatusText}>
            {players[1].name}: {opponentAnswer !== null ? 'Answered' : 'Thinking...'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderGameOver = () => {
    const winner = players[0].score > players[1].score ? players[0] : 
                   players[1].score > players[0].score ? players[1] : null;
    
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={winner?.id === '1' ? ['#34C759', '#30A14E'] : ['#FF3B30', '#D70015']}
          style={styles.gameOverCard}
        >
          <Trophy size={64} color="#FFFFFF" />
          <Text style={styles.gameOverTitle}>
            {winner ? (winner.id === '1' ? 'Victory!' : 'Defeat!') : 'Draw!'}
          </Text>
          
          <View style={styles.finalScores}>
            {players.map((player) => (
              <View key={player.id} style={[
                styles.finalPlayerCard,
                winner?.id === player.id && styles.winnerCard
              ]}>
                <Text style={styles.finalPlayerAvatar}>{player.avatar}</Text>
                <Text style={styles.finalPlayerName}>{player.name}</Text>
                <Text style={styles.finalPlayerScore}>{player.score} pts</Text>
                {winner?.id === player.id && (
                  <Crown size={20} color="#FFD700" />
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.background}
      >
        {gameState === 'waiting' && renderWaitingScreen()}
        {gameState === 'countdown' && renderCountdown()}
        {gameState === 'question' && renderQuestion()}
        {gameState === 'gameOver' && renderGameOver()}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  gameCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
  },
  gameTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 32,
  },
  playersContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  playerAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  readyBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerScore: {
    alignItems: 'center',
    flex: 1,
  },
  playerScoreAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },
  playerScoreName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playerScorePoints: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  streakBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  streakText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  questionNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  timerContainer: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: '#FF6B35',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  questionCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: '#007AFF',
  },
  correctOption: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderColor: '#34C759',
  },
  wrongOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: '#FF3B30',
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  correctOptionText: {
    color: '#34C759',
  },
  opponentIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 4,
  },
  opponentText: {
    fontSize: 12,
  },
  answerIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerStatus: {
    flex: 1,
    alignItems: 'center',
  },
  answerStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  gameOverCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
  },
  gameOverTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 32,
  },
  finalScores: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  finalPlayerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  winnerCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  finalPlayerAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  finalPlayerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  finalPlayerScore: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',    marginBottom: 8,
  },
  playAgainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playAgainText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});

export default BattleScreen;
