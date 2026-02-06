import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  BarChart3,
  TrendingUp as TrendUp,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Award,
  Star,
  Brain,
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import UserService, { UserStats, UserProfile } from '@/services/user-service';
import { TestProgressService, TestResult } from '@/services/test-progress-service';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [examRankings, setExamRankings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const [stats, profile, history] = await Promise.all([
        UserService.getUserStatistics().catch(err => {
          console.error('Stats error:', err);
          return null;
        }),
        UserService.getUserProfile().catch(err => {
          console.error('Profile error:', err);
          return null;
        }),
        TestProgressService.getTestHistory().catch(err => {
          console.error('History error:', err);
          return [];
        })
      ]);
      
      setUserStats(stats);
      setUserProfile(profile);
      setTestHistory(history);
      
      // Calculate exam-specific rankings
      if (profile && profile.exams && history.length > 0) {
        const rankings: Record<string, string> = {};
        profile.exams.forEach(exam => {
          const examTests = history.filter(t => t.testTitle?.includes(exam));
          const avgAccuracy = examTests.length > 0
            ? examTests.reduce((sum, t) => sum + t.accuracy, 0) / examTests.length
            : 0;
          rankings[exam] = calculateRank(avgAccuracy);
        });
        setExamRankings(rankings);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Set default empty states to ensure UI renders
      setUserStats({
        questionsAttempted: 0,
        accuracy: 0,
        streak: 0,
        totalTests: 0,
      });
      setTestHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const calculateRank = (accuracy: number): string => {
    if (accuracy >= 95) return 'Grandmaster';
    if (accuracy >= 90) return 'Master';
    if (accuracy >= 80) return 'Expert';
    if (accuracy >= 70) return 'Advanced';
    if (accuracy >= 60) return 'Intermediate';
    if (accuracy >= 40) return 'Novice';
    return 'Beginner';
  };

  const renderSimpleChart = (data: number[], color: string) => {
    if (data.length === 0) return null;
    const maxValue = Math.max(...data, 1);
    const chartWidth = width - 64;
    const chartHeight = 120;
    
    return (
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        <View style={styles.chartArea}>
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 40);
            const barWidth = (chartWidth - 40) / data.length - 4;
            
            return (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: barHeight,
                    width: barWidth,
                    backgroundColor: color,
                    marginRight: 4,
                  }
                ]}
              />
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          {data.map((_, index) => (
            <Text key={index} style={styles.chartLabel}>
              {index + 1}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const getRecentTestsData = () => {
    const recent = testHistory.slice(0, 7).reverse();
    return {
      accuracy: recent.map(t => t.accuracy),
      questions: recent.map(t => t.totalQuestions),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentData = getRecentTestsData();
  const accuracyData = recentData.accuracy;
  const questionsData = recentData.questions;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.progressIcon}>
              <TrendUp size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Progress</Text>
              <Text style={styles.headerSubtitle}>Track your learning journey</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period && styles.periodTextActive
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {testHistory.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Trophy size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Progress Yet</Text>
              <Text style={styles.emptyText}>
                Take your first test to start tracking your progress!
              </Text>
            </View>
          </Card>
        ) : (
          <>
            {/* Overall Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.statGradient}
                >
                  <Target size={20} color="#FFFFFF" />
                  <Text style={styles.statValue}>{userStats?.accuracy.toFixed(1) || 0}%</Text>
                  <Text style={styles.statLabel}>Overall Accuracy</Text>
                  <Text style={styles.statRank}>{calculateRank(userStats?.accuracy || 0)}</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.statGradient}
                >
                  <Zap size={20} color="#FFFFFF" />
                  <Text style={styles.statValue}>{userStats?.streak || 0}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.statGradient}
                >
                  <BookOpen size={20} color="#FFFFFF" />
                  <Text style={styles.statValue}>{userStats?.questionsAttempted || 0}</Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#43e97b', '#38f9d7']}
                  style={styles.statGradient}
                >
                  <Trophy size={20} color="#FFFFFF" />
                  <Text style={styles.statValue}>{userStats?.totalTests || 0}</Text>
                  <Text style={styles.statLabel}>Tests Taken</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Exam-Specific Rankings */}
            {userProfile && Object.keys(examRankings).length > 0 && (
              <Card>
                <Text style={styles.cardTitle}>Exam Rankings</Text>
                <Text style={styles.cardSubtitle}>Your performance by exam type</Text>
                <View style={styles.rankingsContainer}>
                  {Object.entries(examRankings).map(([exam, rank]) => (
                    <View key={exam} style={styles.rankingItem}>
                      <View style={styles.rankingLeft}>
                        <Award size={18} color="#667eea" />
                        <Text style={styles.rankingExam}>{exam}</Text>
                      </View>
                      <View style={[styles.rankingBadge, { backgroundColor: getRankColor(rank) }]}>
                        <Text style={styles.rankingText}>{rank}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Performance Chart */}
            {accuracyData.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.cardTitle}>Accuracy Trend</Text>
                </View>
                <Text style={styles.chartDescription}>Your accuracy over recent tests</Text>
                {renderSimpleChart(accuracyData, '#007AFF')}
              </Card>
            )}

            {/* Recent Tests */}
            <Card>
              <Text style={styles.cardTitle}>Recent Tests</Text>
              <View style={styles.testsContainer}>
                {testHistory.slice(0, 5).map((test, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.testItem}
                    onPress={() => {
                      // Check if evaluation is complete
                      if (test.evaluationStatus === 'pending') {
                        Alert.alert(
                          'Evaluation Pending',
                          'We are still generating answers and evaluating your test. You will be notified when it\'s ready.',
                          [{ text: 'OK' }]
                        );
                      } else {
                        router.push({
                          pathname: '/test-result',
                          params: { attemptId: test.attemptId }
                        });
                      }
                    }}
                  >
                    <View style={styles.testInfo}>
                      <Text style={styles.testTitle} numberOfLines={1}>
                        {test.testTitle || 'Test'}
                      </Text>
                      <Text style={styles.testDate}>
                        {new Date(test.date).toLocaleDateString()}
                      </Text>
                      {test.evaluationStatus === 'pending' && (
                        <View style={styles.pendingBadge}>
                          <ActivityIndicator size="small" color="#FF9500" />
                          <Text style={styles.pendingText}>Evaluating...</Text>
                        </View>
                      )}
                    </View>
                    {test.evaluationStatus === 'completed' ? (
                      <View style={styles.testStats}>
                        <Text style={styles.testAccuracy}>{test.accuracy.toFixed(1)}%</Text>
                        <Text style={styles.testScore}>
                          {test.correctAnswers}/{test.totalQuestions}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.testStats}>
                        <Text style={styles.pendingStatusText}>Pending</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const getRankColor = (rank: string): string => {
  const colors: Record<string, string> = {
    Grandmaster: '#FFD700',
    Master: '#C0C0C0',
    Expert: '#CD7F32',
    Advanced: '#4ECDC4',
    Intermediate: '#45B7D1',
    Novice: '#96CEB4',
    Beginner: '#95A5A6',
  };
  return colors[rank] || '#95A5A6';
};

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
  headerGradient: {
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartInfoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  chartInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectAccuracyText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statRank: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
    marginTop: -8,
  },
  rankingsContainer: {
    gap: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankingExam: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  rankingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankingText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  testsContainer: {
    gap: 12,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  testStats: {
    alignItems: 'flex-end',
  },
  testAccuracy: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  testScore: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  chartContainer: {
    marginVertical: 12,
  },
  chartDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 12,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 80,
  },
  chartBar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  trendInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  trendText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  subjectContainer: {
    gap: 16,
  },
  subjectItem: {
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    flex: 1,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectAccuracy: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  subjectQuestions: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  achievementEarned: {
    backgroundColor: '#F0FFF4',
    borderColor: '#34C759',
  },
  achievementLocked: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E5EA',
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 8,
  },
  achievementStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  earnedText: {
    color: '#34C759',
  },
  lockedText: {
    color: '#8E8E93',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF9500',
  },
  pendingStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF9500',
  },
});