import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, Target, Clock, TrendingUp as TrendUp, Zap, Award, Brain, Calendar, Star, Swords } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { mockUser } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const todayStats = {
    questionsAttempted: 12,
    accuracy: 85.2,
    timeSpent: 45,
  };

  const achievements = [
    { id: 1, title: "7 Day Streak", icon: Star, color: "#FF6B35" },
    { id: 2, title: "Math Master", icon: Award, color: "#FFD700" },
    { id: 3, title: "Speed Demon", icon: Zap, color: "#00D2FF" },
  ];

  const recentTopics = [
    { subject: "Mathematics", progress: 85, color: "#FF6B6B" },
    { subject: "Physics", progress: 72, color: "#4ECDC4" },
    { subject: "Chemistry", progress: 91, color: "#45B7D1" },
    { subject: "Biology", progress: 68, color: "#96CEB4" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello {mockUser.name} 👋</Text>
              <Text style={styles.subtitle}>Ready to practice today?</Text>
            </View>
            <TouchableOpacity style={styles.streakBadge}>
              <Star size={16} color="#FF6B35" />
              <Text style={styles.streakText}>{mockUser.streak}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Stats Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Practice</Text>
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <BookOpen size={24} color="#007AFF" />
              </View>
              <Text style={styles.statNumber}>{todayStats.questionsAttempted}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Target size={24} color="#34C759" />
              </View>
              <Text style={styles.statNumber}>{todayStats.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Clock size={24} color="#FF9500" />
              </View>
              <Text style={styles.statNumber}>{todayStats.timeSpent}m</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>
        </Card>

        {/* Achievement Badges */}
        <Card style={{ marginHorizontal: 16 }}>
          <Text style={styles.cardTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <TouchableOpacity key={achievement.id} style={styles.achievementBadge}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                  <achievement.icon size={24} color={achievement.color} />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Subject Progress */}
        <Card style={{ marginHorizontal: 16 }}>
          <Text style={styles.cardTitle}>Subject Progress</Text>
          <View style={styles.subjectContainer}>
            {recentTopics.map((topic, index) => (
              <View key={index} style={styles.subjectItem}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{topic.subject}</Text>
                  <Text style={styles.subjectProgress}>{topic.progress}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${topic.progress}%`,
                        backgroundColor: topic.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card style={{ marginHorizontal: 16 }}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity 
                style={styles.gradientButtonInner}
                onPress={() => router.push('/practice')}
              >
                <Brain size={24} color="#FFFFFF" />
                <Text style={styles.gradientButtonText}>Take Mock Test</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity 
                style={styles.gradientButtonInner}
                onPress={() => router.push('/battle')}
              >
                <Swords size={24} color="#FFFFFF" />
                <Text style={styles.gradientButtonText}>Battle Arena</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity 
                style={styles.gradientButtonInner}
                onPress={() => router.push('/practice')}
              >
                <Zap size={24} color="#FFFFFF" />
                <Text style={styles.gradientButtonText}>Personalized Practice</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Card>

        {/* Study Goals */}
        <Card style={{ marginHorizontal: 16 }}>
          <Text style={styles.cardTitle}>Today's Goals</Text>
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <View style={styles.goalCheck}>
                <Star size={12} color="#FFD700" />
              </View>
              <Text style={styles.goalText}>Complete 15 questions</Text>
              <Text style={styles.goalProgress}>12/15</Text>
            </View>
            <View style={styles.goalItem}>
              <View style={styles.goalCheck}>
                <Star size={12} color="#FFD700" />
              </View>
              <Text style={styles.goalText}>Maintain 80% accuracy</Text>
              <Text style={styles.goalProgress}>85%</Text>
            </View>
            <View style={styles.goalItem}>
              <View style={[styles.goalCheck, { backgroundColor: '#E8F5E8' }]}>
                <Star size={12} color="#34C759" />
              </View>
              <Text style={[styles.goalText, { textDecorationLine: 'line-through', color: '#8E8E93' }]}>Study for 30 minutes</Text>
              <Text style={styles.goalProgress}>✓</Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginHorizontal: 16 }}>
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
            <TrendUp size={16} color="#007AFF" />
            <Text style={styles.viewMoreText}>View Detailed Progress</Text>
          </TouchableOpacity>
        </Card>

        <Card style={{ marginHorizontal: 16, marginBottom: 20 }}>
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
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  achievementsScroll: {
    paddingVertical: 8,
  },
  achievementBadge: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    minWidth: 80,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subjectContainer: {
    gap: 16,
  },
  subjectItem: {
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  subjectProgress: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  gradientButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  goalsContainer: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  goalProgress: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
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