import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, BookOpen, LogOut, CreditCard as Edit3, Save, X } from 'lucide-react-native';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { mockUser, mockBookmarks } from '@/data/mockData';

export default function ProfileScreen() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(mockUser.name);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const [bookmarkNotes, setBookmarkNotes] = useState<{[key: string]: string}>({});

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setUserName(mockUser.name);
    setUserEmail(mockUser.email);
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') }
      ]
    );
  };

  const handleSaveNote = (bookmarkId: string) => {
    setSelectedBookmark(null);
    Alert.alert('Success', 'Note saved successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
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
                  <Text style={styles.profileName}>{userName}</Text>
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
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.totalPractice}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockUser.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Tests Taken</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Bookmarks & Notes</Text>
          <View style={styles.bookmarksContainer}>
            {mockBookmarks.map((bookmark) => (
              <View key={bookmark.id} style={styles.bookmarkItem}>
                <View style={styles.bookmarkHeader}>
                  <BookOpen size={16} color="#007AFF" />
                  <Text style={styles.bookmarkSubject}>{bookmark.question.subject}</Text>
                  <Text style={styles.bookmarkDifficulty}>{bookmark.question.difficulty}</Text>
                </View>
                <Text style={styles.bookmarkQuestion} numberOfLines={2}>
                  {bookmark.question.question}
                </Text>
                {selectedBookmark === bookmark.id ? (
                  <View style={styles.noteEditContainer}>
                    <TextInput
                      style={styles.noteInput}
                      value={bookmarkNotes[bookmark.id] || bookmark.notes || ''}
                      onChangeText={(text) => setBookmarkNotes(prev => ({...prev, [bookmark.id]: text}))}
                      placeholder="Add your notes..."
                      multiline
                    />
                    <View style={styles.noteButtons}>
                      <TouchableOpacity 
                        style={styles.saveNoteButton}
                        onPress={() => handleSaveNote(bookmark.id)}
                      >
                        <Text style={styles.saveNoteText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelNoteButton}
                        onPress={() => setSelectedBookmark(null)}
                      >
                        <Text style={styles.cancelNoteText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    {(bookmark.notes || bookmarkNotes[bookmark.id]) && (
                      <Text style={styles.bookmarkNotes}>
                        📝 {bookmarkNotes[bookmark.id] || bookmark.notes}
                      </Text>
                    )}
                    <TouchableOpacity 
                      style={styles.editNoteButton}
                      onPress={() => setSelectedBookmark(bookmark.id)}
                    >
                      <Edit3 size={12} color="#007AFF" />
                      <Text style={styles.editNoteText}>
                        {bookmark.notes || bookmarkNotes[bookmark.id] ? 'Edit Note' : 'Add Note'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Exam Preferences</Text>
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Primary Exam Focus</Text>
              <Text style={styles.preferenceValue}>JEE Advanced</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Difficulty Level</Text>
              <Text style={styles.preferenceValue}>Medium to Hard</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Study Goal</Text>
              <Text style={styles.preferenceValue}>2 hours daily</Text>
            </View>
          </View>
          <Button title="Update Preferences" onPress={() => {}} variant="secondary" />
        </Card>

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