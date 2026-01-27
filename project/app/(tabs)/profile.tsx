import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, BookOpen, LogOut, CreditCard as Edit3, Save, X, Target } from 'lucide-react-native';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import UserService, { UserProfile, UserStats } from '@/services/user-service';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profile = await UserService.getUserProfile();
      const stats = await UserService.getUserStatistics();
      
      if (profile) {
        setUserProfile(profile);
        setUserName(profile.displayName);
        setUserEmail(profile.email);
      }
      
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      await UserService.updateUserProfile({
        displayName: userName,
      });
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
      loadUserData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setUserName(userProfile?.displayName || '');
    setUserEmail(userProfile?.email || '');
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (e) {
              Alert.alert("Error", "Failed to logout");
            }
          } 
        }
      ]
    );
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile & Settings</Text>
        
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              {isEditingProfile ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Full Name"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    editable={false}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Save size={16} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                      <X size={16} color="#FF3B30" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.profileName}>{userName || 'User'}</Text>
                  <Text style={styles.profileEmail}>{userEmail}</Text>
                  <TouchableOpacity 
                    style={styles.editProfileButton}
                    onPress={() => setIsEditingProfile(true)}
                  >
                    <Edit3 size={14} color="#007AFF" />
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Study Statistics</Text>
          {userStats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.questionsAttempted}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.accuracy.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.totalTests}</Text>
                <Text style={styles.statLabel}>Tests Taken</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Start taking tests to see your statistics</Text>
          )}
        </Card>

        {userProfile && userProfile.exams && userProfile.exams.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Exam Preferences</Text>
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceItem}>
                <Target size={18} color="#667eea" style={{marginRight: 8}} />
                <View style={{flex: 1}}>
                  <Text style={styles.preferenceLabel}>Target Exams</Text>
                  <Text style={styles.preferenceValue}>{userProfile.exams.join(', ')}</Text>
                </View>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Experience Level</Text>
                <Text style={styles.preferenceValue}>
                  {userProfile.experienceLevel === 'beginner' ? 'Just Started' :
                   userProfile.experienceLevel === 'intermediate' ? 'Preparing' : 'Advanced'}
                </Text>
              </View>
              {userProfile.targetExamDate && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Target Date</Text>
                  <Text style={styles.preferenceValue}>{userProfile.targetExamDate}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        <Card>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#FF9500" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Settings size={20} color="#8E8E93" />
                <Text style={styles.settingLabel}>App Settings</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <Button 
            title="Logout" 
            onPress={handleLogout}
            variant="danger"
            size="large"
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    gap: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginTop: 4,
  },
  bookmarksContainer: {
    gap: 12,
  },
  bookmarkItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bookmarkSubject: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    flex: 1,
  },
  bookmarkDifficulty: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bookmarkQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  bookmarkNotes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  editNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  noteEditContainer: {
    gap: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  noteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveNoteButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    alignItems: 'center',
  },
  saveNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelNoteButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  cancelNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8E8E93',
  },
  preferencesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  preferenceValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  settingsContainer: {
    gap: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  settingArrow: {
    fontSize: 18,
    color: '#C7C7CC',
  },
  logoutButton: {
    marginVertical: 8,
  },
});