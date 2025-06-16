import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, Target, Clock, TrendingUp } from 'lucide-react-native';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { mockUser } from '@/data/mockData';

export default function HomeScreen() {
  const todayStats = {
    questionsAttempted: 12,
    accuracy: 85.2,
    timeSpent: 45,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello {mockUser.name} 👋</Text>
          <Text style={styles.subtitle}>Ready to practice today?</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Practice</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <BookOpen size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{todayStats.questionsAttempted}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Target size={24} color="#34C759" />
              <Text style={styles.statNumber}>{todayStats.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{todayStats.timeSpent}m</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Take a Mock Test" 
              onPress={() => router.push('/practice')}
              variant="primary"
              size="large"
            />
            <Button 
              title="Start Personalized Practice" 
              onPress={() => router.push('/practice')}
              variant="success"
              size="large"
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{mockUser.streak}</Text>
              <Text style={styles.progressLabel}>Day Streak</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{mockUser.totalPractice}</Text>
              <Text style={styles.progressLabel}>Total Practice</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{mockUser.accuracy}%</Text>
              <Text style={styles.progressLabel}>Overall Accuracy</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => router.push('/progress')}
          >
            <TrendingUp size={16} color="#007AFF" />
            <Text style={styles.viewMoreText}>View Detailed Progress</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Completed Mathematics Quiz</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Bookmarked 3 questions</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Asked AI Assistant about Physics</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
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
  header: {
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  summaryCard: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  buttonContainer: {
    gap: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginTop: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
});