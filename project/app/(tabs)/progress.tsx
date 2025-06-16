import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Clock, Target, Award } from 'lucide-react-native';
import Card from '@/components/Card';
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress Tracker</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Overall Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Target size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{mockUser.accuracy}%</Text>
              <Text style={styles.statLabel}>Overall Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Award size={24} color="#34C759" />
              <Text style={styles.statNumber}>{mockUser.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{mockUser.totalPractice}</Text>
              <Text style={styles.statLabel}>Total Practice</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#AF52DE" />
              <Text style={styles.statNumber}>2.5h</Text>
              <Text style={styles.statLabel}>Avg Daily Time</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Accuracy Trend</Text>
          <Text style={styles.chartDescription}>Your accuracy over the past 7 days</Text>
          {renderSimpleChart(accuracyData, '#007AFF')}
          <View style={styles.trendInfo}>
            <Text style={styles.trendText}>
              📈 Improving! Your accuracy increased by 12% this week
            </Text>
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