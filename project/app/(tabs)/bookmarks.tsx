import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark as BookmarkIcon, Search, Filter, Tag, Calendar, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '@/components/Card';
import { Bookmark, Question } from '@/types';
import { mockBookmarks } from '@/data/mockData';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockBookmarks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'wrong'>('bookmarks');

  const subjects = ['All', 'Mathematics', 'Science', 'Geography', 'Computer Science'];

  // Mock data for wrong answers - in a real app this would come from user's attempt history
  const wrongAnswers = [
    {
      id: 'w1',
      question: {
        id: '6',
        question: 'What is the integral of 1/x?',
        options: ['x', 'ln(x) + C', '1/x²', 'x²/2'],
        correctAnswer: 1,
        explanation: 'The integral of 1/x is ln(x) + C, where C is the constant of integration.',
        subject: 'Mathematics',
        difficulty: 'Medium' as const,
        timeToSolve: 45,
      },
      userAnswer: 0,
      attemptedAt: new Date('2024-06-17'),
      timeTaken: 52,
    },
    {
      id: 'w2',
      question: {
        id: '7',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
        correctAnswer: 2,
        explanation: 'Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface.',
        subject: 'Science',
        difficulty: 'Easy' as const,
        timeToSolve: 20,
      },
      userAnswer: 0,
      attemptedAt: new Date('2024-06-16'),
      timeTaken: 25,
    },
    {
      id: 'w3',
      question: {
        id: '8',
        question: 'What is the time complexity of inserting an element at the beginning of an array?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Inserting at the beginning of an array requires shifting all existing elements, resulting in O(n) time complexity.',
        subject: 'Computer Science',
        difficulty: 'Hard' as const,
        timeToSolve: 60,
      },
      userAnswer: 0,
      attemptedAt: new Date('2024-06-15'),
      timeTaken: 45,
    },
  ];

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.question.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || bookmark.question.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredWrongAnswers = wrongAnswers.filter(wrongAnswer => {
    const matchesSearch = wrongAnswer.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wrongAnswer.question.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || wrongAnswer.question.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };
  const addNote = (bookmarkId: string, note: string) => {
    setBookmarks(prev => prev.map(b => 
      b.id === bookmarkId ? { ...b, notes: note } : b
    ));
  };

  const retryQuestion = (questionId: string) => {
    // In a real app, this would navigate to the question for retry
    console.log('Retrying question:', questionId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#34C759';
      case 'Medium': return '#FF9500';
      case 'Hard': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

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
            <View style={styles.bookmarkIcon}>
              <BookmarkIcon size={24} color="#FFFFFF" />
            </View>            <View>
              <Text style={styles.headerTitle}>
                {activeTab === 'bookmarks' ? 'Bookmarks' : 'Wrong Answers'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {activeTab === 'bookmarks' 
                  ? `${bookmarks.length} saved questions` 
                  : `${wrongAnswers.length} questions to review`
                }
              </Text>
            </View>
          </View>        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bookmarks' && styles.activeTabButton]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <BookmarkIcon size={16} color={activeTab === 'bookmarks' ? '#007AFF' : '#8E8E93'} />
          <Text style={[
            styles.tabText,
            activeTab === 'bookmarks' && styles.activeTabText
          ]}>
            Bookmarks ({bookmarks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'wrong' && styles.activeTabButton]}
          onPress={() => setActiveTab('wrong')}
        >
          <Text style={styles.wrongIcon}>✗</Text>
          <Text style={[
            styles.tabText,
            activeTab === 'wrong' && styles.activeTabText
          ]}>
            Wrong Answers ({wrongAnswers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.filterChip,
                filterSubject === subject && styles.filterChipActive
              ]}
              onPress={() => setFilterSubject(subject)}
            >
              <Text style={[
                styles.filterText,
                filterSubject === subject && styles.filterTextActive
              ]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>      {/* Bookmarks List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'bookmarks' ? (
          // Bookmarks Tab Content
          filteredBookmarks.length === 0 ? (
            <Card style={styles.emptyState}>
              <BookmarkIcon size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No bookmarks found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Start bookmarking questions to see them here'}
              </Text>
            </Card>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} style={styles.bookmarkCard}>
                <View style={styles.bookmarkHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{bookmark.question.subject}</Text>
                  </View>
                  <View style={styles.bookmarkActions}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(bookmark.question.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(bookmark.question.difficulty) }
                      ]}>
                        {bookmark.question.difficulty}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeBookmark(bookmark.id)}
                    >
                      <Trash2 size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.questionText}>{bookmark.question.question}</Text>

                <View style={styles.optionsContainer}>
                  {bookmark.question.options.map((option, index) => (
                    <View
                      key={index}
                      style={[
                        styles.option,
                        index === bookmark.question.correctAnswer && styles.correctOption
                      ]}
                    >
                      <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}.</Text>
                      <Text style={[
                        styles.optionText,
                        index === bookmark.question.correctAnswer && styles.correctOptionText
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>

                {bookmark.question.explanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>Explanation</Text>
                    <Text style={styles.explanationText}>{bookmark.question.explanation}</Text>
                  </View>
                )}

                {bookmark.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesTitle}>Your Notes</Text>
                    <Text style={styles.notesText}>{bookmark.notes}</Text>
                  </View>
                )}

                <View style={styles.bookmarkFooter}>
                  <View style={styles.timestampContainer}>
                    <Calendar size={14} color="#8E8E93" />
                    <Text style={styles.timestamp}>
                      Saved {bookmark.createdAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addNoteButton}
                    onPress={() => {
                      // In a real app, this would open a modal to add/edit notes
                      const note = bookmark.notes || 'Sample note added';
                      addNote(bookmark.id, note);
                    }}
                  >
                    <Tag size={14} color="#007AFF" />
                    <Text style={styles.addNoteText}>
                      {bookmark.notes ? 'Edit Note' : 'Add Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )
        ) : (
          // Wrong Answers Tab Content
          filteredWrongAnswers.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.wrongIcon}>✗</Text>
              <Text style={styles.emptyTitle}>No wrong answers found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Great job! You haven\'t made any mistakes yet'}
              </Text>
            </Card>
          ) : (
            filteredWrongAnswers.map((wrongAnswer) => (
              <Card key={wrongAnswer.id} style={styles.bookmarkCard}>
                <View style={styles.bookmarkHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{wrongAnswer.question.subject}</Text>
                  </View>
                  <View style={styles.bookmarkActions}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(wrongAnswer.question.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(wrongAnswer.question.difficulty) }
                      ]}>
                        {wrongAnswer.question.difficulty}
                      </Text>
                    </View>
                    <View style={styles.timeSpentBadge}>
                      <Text style={styles.timeSpentText}>{wrongAnswer.timeTaken}s</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.questionText}>{wrongAnswer.question.question}</Text>

                <View style={styles.optionsContainer}>
                  {wrongAnswer.question.options.map((option, index) => (
                    <View
                      key={index}
                      style={[
                        styles.option,
                        index === wrongAnswer.question.correctAnswer && styles.correctOption,
                        index === wrongAnswer.userAnswer && styles.wrongOption
                      ]}
                    >
                      <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}.</Text>
                      <Text style={[
                        styles.optionText,
                        index === wrongAnswer.question.correctAnswer && styles.correctOptionText,
                        index === wrongAnswer.userAnswer && styles.wrongOptionText
                      ]}>
                        {option}
                      </Text>
                      {index === wrongAnswer.userAnswer && (
                        <Text style={styles.userAnswerLabel}>Your Answer</Text>
                      )}
                      {index === wrongAnswer.question.correctAnswer && (
                        <Text style={styles.correctAnswerLabel}>Correct</Text>
                      )}
                    </View>
                  ))}
                </View>

                {wrongAnswer.question.explanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>Explanation</Text>
                    <Text style={styles.explanationText}>{wrongAnswer.question.explanation}</Text>
                  </View>
                )}

                <View style={styles.bookmarkFooter}>
                  <View style={styles.timestampContainer}>
                    <Calendar size={14} color="#8E8E93" />
                    <Text style={styles.timestamp}>
                      Attempted {wrongAnswer.attemptedAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => retryQuestion(wrongAnswer.question.id)}
                  >
                    <Text style={styles.retryText}>Retry Question</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )
        )}
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
  headerGradient: {
    paddingBottom: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  bookmarkCard: {
    marginVertical: 8,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  bookmarkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButton: {
    padding: 4,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  correctOption: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#34C759',
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
  correctOptionText: {
    color: '#34C759',
    fontFamily: 'Inter-SemiBold',
  },
  explanationContainer: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  notesContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#856404',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#856404',
    lineHeight: 20,
  },
  bookmarkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },  addNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },  wrongIcon: {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: 'Inter-Bold',
  },
  timeSpentBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeSpentText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF9500',
  },
  wrongOption: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  wrongOptionText: {
    color: '#FF3B30',
    fontFamily: 'Inter-SemiBold',
  },  userAnswerLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  correctAnswerLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    backgroundColor: '#34C759',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
