import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp as TrendUp, Clock, Target, Award, Calendar, BookOpen, Zap, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import StatCard from '@/components/StatCard';
import { mockProgressData, mockUser } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const renderSimpleChart = (data: number[], color: string) => {
    const maxValue = Math.max(...data);
    const chartWidth = width - 64; // Account for padding
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

  const accuracyData = mockProgressData.map(d => d.accuracy);
  const questionsData = mockProgressData.map(d => d.questionsAttempted);
  const timeData = mockProgressData.map(d => d.timeSpent);

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Accuracy"
            value={`${mockUser.accuracy}%`}
            subtitle="Overall performance"
            icon={<Target size={20} color="#FFFFFF" />}
            gradient={['#667eea', '#764ba2']}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Streak"
            value={`${mockUser.streak}`}
            subtitle="Days in a row"
            icon={<Zap size={20} color="#FFFFFF" />}
            gradient={['#f093fb', '#f5576c']}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Questions"
            value={mockUser.totalPractice}
            subtitle="Total attempted"
            icon={<BookOpen size={20} color="#FFFFFF" />}
            gradient={['#4facfe', '#00f2fe']}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Avg Time"
            value="2.5h"
            subtitle="Daily practice"
            icon={<Clock size={20} color="#FFFFFF" />}
            gradient={['#43e97b', '#38f9d7']}
            trend={{ value: 5, isPositive: false }}
          />
        </View>

        {/* Performance Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Performance Trend</Text>
            <TouchableOpacity style={styles.chartInfoButton}>
              <Text style={styles.chartInfoText}>View Details</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.chartDescription}>Your accuracy over the past 7 days</Text>
          {renderSimpleChart(accuracyData, '#007AFF')}
          <View style={styles.trendInfo}>
            <View style={styles.trendBadge}>
              <Star size={12} color="#34C759" />
              <Text style={styles.trendText}>
                Improving! Your accuracy increased by 12% this week
              </Text>
            </View>
          </View>
        </Card>

        {/* Subject Breakdown */}
        <Card>
          <Text style={styles.cardTitle}>Subject Performance</Text>
          <View style={styles.subjectContainer}>
            {[
              { subject: 'Mathematics', accuracy: 85, questions: 45, color: '#FF6B6B' },
              { subject: 'Science', accuracy: 78, questions: 32, color: '#4ECDC4' },
              { subject: 'Geography', accuracy: 92, questions: 28, color: '#45B7D1' },
              { subject: 'Computer Science', accuracy: 88, questions: 51, color: '#96CEB4' },
            ].map((item, index) => (
              <View key={index} style={styles.subjectItem}>
                <View style={styles.subjectInfo}>
                  <View style={[styles.subjectIndicator, { backgroundColor: item.color }]} />
                  <View style={styles.subjectDetails}>
                    <Text style={styles.subjectName}>{item.subject}</Text>
                    <Text style={styles.subjectStats}>{item.questions} questions</Text>
                  </View>
                </View>
                <View style={styles.subjectAccuracy}>
                  <Text style={styles.subjectAccuracyText}>{item.accuracy}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <Text style={styles.cardTitle}>Weekly Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '80%' }]} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalText}>Complete 50 questions</Text>
                <Text style={styles.goalStatus}>40/50 completed</Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '60%' }]} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalText}>Maintain 85% accuracy</Text>
                <Text style={styles.goalStatus}>Currently 78%</Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <View style={styles.goalProgress}>
                <View style={[styles.goalProgressBar, { width: '100%', backgroundColor: '#34C759' }]} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalText}>Study 5 days this week</Text>
                <Text style={[styles.goalStatus, { color: '#34C759' }]}>5/5 completed ✓</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Questions Attempted</Text>
          <Text style={styles.chartDescription}>Daily question practice</Text>
          {renderSimpleChart(questionsData, '#34C759')}
          <View style={styles.trendInfo}>
            <Text style={styles.trendText}>
              🎯 Great consistency! You've maintained regular practice
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Time Spent (minutes)</Text>
          <Text style={styles.chartDescription}>Daily study time</Text>
          {renderSimpleChart(timeData, '#FF9500')}
          <View style={styles.trendInfo}>
            <Text style={styles.trendText}>
              ⏰ Optimal study time! You're averaging 35 minutes daily
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Subject Performance</Text>
          <View style={styles.subjectContainer}>
            {[
              { subject: 'Mathematics', accuracy: 85, questions: 45, color: '#007AFF' },
              { subject: 'Science', accuracy: 78, questions: 32, color: '#34C759' },
              { subject: 'Computer Science', accuracy: 92, questions: 28, color: '#FF9500' },
              { subject: 'Geography', accuracy: 71, questions: 15, color: '#AF52DE' },
            ].map((item) => (
              <View key={item.subject} style={styles.subjectItem}>
                <View style={styles.subjectHeader}>
                  <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
                  <Text style={styles.subjectName}>{item.subject}</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectAccuracy}>{item.accuracy}%</Text>
                  <Text style={styles.subjectQuestions}>{item.questions} questions</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${item.accuracy}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {[
              { title: '7-Day Streak', description: 'Practiced for 7 consecutive days', earned: true },
              { title: 'Quick Learner', description: 'Completed 50 questions in a day', earned: true },
              { title: 'Perfect Score', description: 'Got 100% in a mock test', earned: false },
              { title: 'Subject Master', description: 'Achieve 90% accuracy in any subject', earned: true },
            ].map((achievement, index) => (
              <View key={index} style={[
                styles.achievementItem,
                achievement.earned ? styles.achievementEarned : styles.achievementLocked
              ]}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={[
                  styles.achievementStatus,
                  achievement.earned ? styles.earnedText : styles.lockedText
                ]}>
                  {achievement.earned ? '✅ Earned' : '🔒 Locked'}
                </Text>
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
});