import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BarChart3,
  Lightbulb,
  Home,
  Share2,
  BookOpen,
} from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';
import SSCCGLService, {
  TestAnalytics,
  SectionAnalytics,
  ParsedMockTest,
  ParsedQuestion,
  UserAnswer,
} from '@/services/ssc-cgl-service';
import { TestProgressService } from '@/services/test-progress-service';

const { width } = Dimensions.get('window');

export default function TestResultScreen() {
  const params = useLocalSearchParams();
  const attemptId = params.attemptId as string;

  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [test, setTest] = useState<ParsedMockTest | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sections' | 'solutions'>('overview');

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
        let result: TestAnalytics | null | undefined = null;
        
        // 1. Try Memory first (if just submitted)
        const memoryAttempt = SSCCGLService.getAttempt(attemptId);
        if (memoryAttempt) {
            result = SSCCGLService.submitTest(attemptId);
        }
        
        // 2. Try History (Persistent Storage)
        if (!result) {
            result = await TestProgressService.getTestResult(attemptId);
        }
        
        if (result) {
            setAnalytics(result);
            
            // Ensure Paper is Loaded
            let testData = SSCCGLService.getPaper(result.testId);
            if (!testData) {
                // Fetch list to find filename for this ID
                const papers = await SSCCGLService.fetchPapersList();
                const paperInfo = papers.find((p: any) => p.id === result!.testId);
                
                if (paperInfo && paperInfo.filename) {
                    testData = await SSCCGLService.fetchPaper(paperInfo.filename);
                }
            }
            setTest(testData || null);
        }
    } catch (error) {
        console.error("Error loading results:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getScoreColor = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return '#4CAF50';
    if (percentage >= 50) return '#FF9800';
    return '#F44336';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 75) return '#4CAF50';
    if (accuracy >= 50) return '#FF9800';
    return '#F44336';
  };

  const renderOverviewTab = () => {
    if (!analytics || !test) return null;

    const scorePercentage = (analytics.overallScore / analytics.totalMarks) * 100;
    const scoreColor = getScoreColor(analytics.overallScore, analytics.totalMarks);

    return (
      <View style={styles.tabContent}>
        {/* Score Card */}
        <LinearGradient
          colors={[scoreColor, scoreColor + 'CC']}
          style={styles.scoreCard}
        >
          <View style={styles.scoreCardHeader}>
            <Trophy size={48} color="#fff" />
            <Text style={styles.scoreCardTitle}>Your Score</Text>
          </View>

          <View style={styles.scoreCardMain}>
            <Text style={styles.scoreCardScore}>
              {analytics.overallScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreCardMaxScore}>/ {analytics.totalMarks}</Text>
          </View>

          <View style={styles.scoreCardProgress}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(scorePercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.scoreCardPercentage}>{scorePercentage.toFixed(1)}%</Text>
          </View>

          <View style={styles.scoreCardMeta}>
            <View style={styles.scoreCardMetaItem}>
              <Target size={20} color="#fff" />
              <Text style={styles.scoreCardMetaText}>
                Accuracy: {analytics.accuracy.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.scoreCardMetaItem}>
              <Clock size={20} color="#fff" />
              <Text style={styles.scoreCardMetaText}>
                Time: {formatTime(analytics.timeTaken)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          {analytics.sectionAnalytics.map((section) => {
            const totalAttempted = section.attempted;
            const correct = section.correct;
            const incorrect = section.incorrect;
            const skipped = section.skipped;

            return (
              <View key={section.sectionId} style={styles.quickStatRow}>
                <View style={styles.quickStatItem}>
                  <CheckCircle size={20} color="#4CAF50" />
                  <Text style={styles.quickStatValue}>{correct}</Text>
                  <Text style={styles.quickStatLabel}>Correct</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <XCircle size={20} color="#F44336" />
                  <Text style={styles.quickStatValue}>{incorrect}</Text>
                  <Text style={styles.quickStatLabel}>Incorrect</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <AlertCircle size={20} color="#FF9800" />
                  <Text style={styles.quickStatValue}>{skipped}</Text>
                  <Text style={styles.quickStatLabel}>Skipped</Text>
                </View>
              </View>
            );
          }).reduce((total, current) => {
            // Sum up all sections for overall stats
            return total;
          })}
        </View>

        {/* Strengths & Weaknesses */}
        <View style={styles.strengthsWeaknesses}>
          {analytics.strengthAreas.length > 0 && (
            <View style={styles.strengthsSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={24} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Strengths</Text>
              </View>
              <View style={styles.topicsList}>
                {analytics.strengthAreas.map((area, index) => (
                  <View key={index} style={[styles.topicBadge, styles.strengthBadge]}>
                    <Text style={styles.strengthBadgeText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {analytics.weaknessAreas.length > 0 && (
            <View style={styles.weaknessSection}>
              <View style={styles.sectionHeader}>
                <TrendingDown size={24} color="#F44336" />
                <Text style={styles.sectionTitle}>Areas to Improve</Text>
              </View>
              <View style={styles.topicsList}>
                {analytics.weaknessAreas.map((area, index) => (
                  <View key={index} style={[styles.topicBadge, styles.weaknessBadge]}>
                    <Text style={styles.weaknessBadgeText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Recommendations */}
        {analytics.recommendations.length > 0 && (
          <View style={styles.recommendations}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={24} color="#FF9800" />
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>
            {analytics.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSectionsTab = () => {
    if (!analytics) return null;

    return (
      <View style={styles.tabContent}>
        {analytics.sectionAnalytics.map((section) => {
          const accuracyColor = getAccuracyColor(section.accuracy);
          const scorePercentage = (section.score / section.maxScore) * 100;

          return (
            <View key={section.sectionId} style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Text style={styles.sectionCardTitle}>{section.sectionTitle}</Text>
                <View
                  style={[styles.sectionCardBadge, { backgroundColor: accuracyColor + '20' }]}
                >
                  <Text style={[styles.sectionCardBadgeText, { color: accuracyColor }]}>
                    {section.accuracy.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.sectionCardScore}>
                <Text style={styles.sectionCardScoreValue}>
                  {section.score.toFixed(1)} / {section.maxScore}
                </Text>
                <View style={styles.sectionProgressBar}>
                  <View
                    style={[
                      styles.sectionProgressFill,
                      {
                        width: `${Math.min(scorePercentage, 100)}%`,
                        backgroundColor: accuracyColor,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.sectionCardStats}>
                <View style={styles.sectionCardStat}>
                  <Text style={styles.sectionCardStatLabel}>Attempted</Text>
                  <Text style={styles.sectionCardStatValue}>{section.attempted}</Text>
                </View>
                <View style={styles.sectionCardStat}>
                  <Text style={styles.sectionCardStatLabel}>Correct</Text>
                  <Text style={[styles.sectionCardStatValue, { color: '#4CAF50' }]}>
                    {section.correct}
                  </Text>
                </View>
                <View style={styles.sectionCardStat}>
                  <Text style={styles.sectionCardStatLabel}>Incorrect</Text>
                  <Text style={[styles.sectionCardStatValue, { color: '#F44336' }]}>
                    {section.incorrect}
                  </Text>
                </View>
                <View style={styles.sectionCardStat}>
                  <Text style={styles.sectionCardStatLabel}>Skipped</Text>
                  <Text style={[styles.sectionCardStatValue, { color: '#FF9800' }]}>
                    {section.skipped}
                  </Text>
                </View>
              </View>

              <View style={styles.sectionCardTime}>
                <Clock size={16} color="#666" />
                <Text style={styles.sectionCardTimeText}>
                  Avg. {section.averageTimePerQuestion.toFixed(1)}s per question
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSolutionsTab = () => {
    if (!test || !analytics) return null;

    const attempt = SSCCGLService.getAttempt(attemptId);
    if (!attempt) return null;

    const allQuestions = test.sections.flatMap((s) => s.questions);

    return (
      <View style={styles.tabContent}>
        {test.sections.map((section) => (
          <View key={section.id} style={styles.solutionsSection}>
            <Text style={styles.solutionsSectionTitle}>{section.title}</Text>
            {section.questions.map((question, index) => {
              const userAnswer = attempt.answers.find((a) => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect;
              const isAttempted = userAnswer !== undefined;

              return (
                <View key={question.id} style={styles.solutionCard}>
                  <View style={styles.solutionHeader}>
                    <Text style={styles.solutionQuestionNumber}>
                      Question {index + 1}
                    </Text>
                    <View
                      style={[
                        styles.solutionStatusBadge,
                        isCorrect
                          ? styles.solutionCorrectBadge
                          : isAttempted
                          ? styles.solutionIncorrectBadge
                          : styles.solutionSkippedBadge,
                      ]}
                    >
                      {isCorrect ? (
                        <CheckCircle size={16} color="#fff" />
                      ) : isAttempted ? (
                        <XCircle size={16} color="#fff" />
                      ) : (
                        <AlertCircle size={16} color="#fff" />
                      )}
                      <Text style={styles.solutionStatusText}>
                        {isCorrect ? 'Correct' : isAttempted ? 'Incorrect' : 'Skipped'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.solutionQuestion}>
                    <RenderHtml
                      contentWidth={width - 64}
                      source={{ html: question.questionText }}
                      baseStyle={styles.solutionQuestionText}
                    />
                  </View>

                  <View style={styles.solutionOptions}>
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer?.selectedOption === optIndex;
                      const isCorrectAnswer = optIndex === question.correctAnswerIndex;

                      return (
                        <View
                          key={optIndex}
                          style={[
                            styles.solutionOption,
                            isCorrectAnswer && styles.solutionOptionCorrect,
                            isUserAnswer && !isCorrect && styles.solutionOptionWrong,
                          ]}
                        >
                          <View style={styles.solutionOptionHeader}>
                            <Text style={styles.solutionOptionLabel}>
                              Option {optIndex + 1}
                            </Text>
                            {isCorrectAnswer && (
                              <View style={styles.correctAnswerBadge}>
                                <CheckCircle size={14} color="#4CAF50" />
                                <Text style={styles.correctAnswerText}>Correct Answer</Text>
                              </View>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <View style={styles.yourAnswerBadge}>
                                <Text style={styles.yourAnswerText}>Your Answer</Text>
                              </View>
                            )}
                          </View>
                          <RenderHtml
                            contentWidth={width - 96}
                            source={{ html: option }}
                            baseStyle={styles.solutionOptionText}
                          />
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.solutionExplanation}>
                    <Text style={styles.solutionExplanationTitle}>Explanation</Text>
                    <Text style={styles.solutionExplanationText}>
                      {question.explanation.english}
                    </Text>
                    {question.keyConcepts.length > 0 && (
                      <View style={styles.solutionKeyConcepts}>
                        <Text style={styles.solutionKeyConceptsTitle}>Key Concepts:</Text>
                        <View style={styles.solutionKeyConceptsList}>
                          {question.keyConcepts.map((concept, i) => (
                            <View key={i} style={styles.keyConceptBadge}>
                              <Text style={styles.keyConceptText}>{concept}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  if (!analytics || !test) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Test Results</Text>
        <Text style={styles.headerSubtitle}>{test.title}</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <BarChart3
            size={20}
            color={selectedTab === 'overview' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'sections' && styles.tabActive]}
          onPress={() => setSelectedTab('sections')}
        >
          <Target size={20} color={selectedTab === 'sections' ? '#4A90E2' : '#666'} />
          <Text
            style={[styles.tabText, selectedTab === 'sections' && styles.tabTextActive]}
          >
            Sections
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'solutions' && styles.tabActive]}
          onPress={() => setSelectedTab('solutions')}
        >
          <BookOpen
            size={20}
            color={selectedTab === 'solutions' ? '#4A90E2' : '#666'}
          />
          <Text
            style={[styles.tabText, selectedTab === 'solutions' && styles.tabTextActive]}
          >
            Solutions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'sections' && renderSectionsTab()}
        {selectedTab === 'solutions' && renderSolutionsTab()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.replace('/test-list')}
        >
          <Home size={20} color="#4A90E2" />
          <Text style={styles.footerButtonText}>Back to Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <Share2 size={20} color="#4A90E2" />
          <Text style={styles.footerButtonText}>Share Result</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#4A90E2',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreCardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  scoreCardMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreCardScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
  },
  scoreCardMaxScore: {
    fontSize: 28,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  scoreCardProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  scoreCardPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },
  scoreCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  scoreCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreCardMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  quickStats: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  strengthsWeaknesses: {
    gap: 16,
  },
  strengthsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  weaknessSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  strengthBadge: {
    backgroundColor: '#E8F5E9',
  },
  strengthBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  weaknessBadge: {
    backgroundColor: '#FFEBEE',
  },
  weaknessBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  recommendations: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 8,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: 12,
    marginTop: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  sectionCardBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionCardBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionCardScore: {
    marginBottom: 16,
  },
  sectionCardScoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionCardStat: {
    alignItems: 'center',
  },
  sectionCardStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  sectionCardStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionCardTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionCardTimeText: {
    fontSize: 13,
    color: '#666',
  },
  solutionsSection: {
    marginBottom: 24,
  },
  solutionsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  solutionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  solutionQuestionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  solutionStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  solutionCorrectBadge: {
    backgroundColor: '#4CAF50',
  },
  solutionIncorrectBadge: {
    backgroundColor: '#F44336',
  },
  solutionSkippedBadge: {
    backgroundColor: '#FF9800',
  },
  solutionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  solutionQuestion: {
    marginBottom: 16,
  },
  solutionQuestionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  solutionOptions: {
    gap: 12,
    marginBottom: 20,
  },
  solutionOption: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  solutionOptionCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  solutionOptionWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  solutionOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  solutionOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  correctAnswerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correctAnswerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  yourAnswerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F44336',
  },
  yourAnswerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  solutionOptionText: {
    fontSize: 14,
    color: '#333',
  },
  solutionExplanation: {
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  solutionExplanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  solutionExplanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  solutionKeyConcepts: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  solutionKeyConceptsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  solutionKeyConceptsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyConceptBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFE082',
  },
  keyConceptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57C00',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
