import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import TestSeriesService, { Section, Test } from '@/services/testseries-service';
import SSCCGLService from '@/services/ssc-cgl-service';

export default function TestSeriesDetailScreen() {
  const params = useLocalSearchParams();
  const { seriesFolder, seriesTitle } = params;

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const series = await TestSeriesService.fetchAllTestSeries();
      const currentSeries = series.find((s) => s.folderName === seriesFolder);
      
      if (currentSeries) {
        setSections(currentSeries.sections);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      Alert.alert('Error', 'Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleTestPress = async (sectionFolder: string, test: Test) => {
    try {
      // Show loading
      Alert.alert('Loading Test', 'Please wait...');

      // Fetch the test paper
      const testPaper = await TestSeriesService.fetchTestPaper(
        seriesFolder as string,
        sectionFolder,
        test.id
      );

      // Check if answers exist, if not trigger generation NOW (before test starts)
      const testFilePath = `testseries/${seriesFolder}/${sectionFolder}/${test.id}.json.gz`;
      TestSeriesService.checkAnswerGenerationStatus(test.id)
        .then((status) => {
          if (!status.answersAvailable && status.status === 'not-found') {
            console.log('Answers not available, starting generation in background...');
            // Trigger generation in background (non-blocking)
            TestSeriesService.requestAnswerGeneration(test.id, testFilePath)
              .then(() => console.log('Answer generation started for', test.id))
              .catch((err) => console.error('Failed to start answer generation:', err));
          } else {
            console.log('Answers already available or being generated:', status.status);
          }
        })
        .catch((err) => console.error('Failed to check answer status:', err));

      // Convert to SSC CGL format and load into service
      const convertedTest = {
        id: test.id,
        title: test.title || testPaper.data.title || 'Test',
        sections: testPaper.data.sections.map((section: any) => ({
          title: section.title,
          questions: section.questions.map((q: any) => ({
            ...q,
            hasAIAnswer: false, // Will be checked when submitting
          })),
        })),
        totalQuestions: testPaper.data.sections.reduce(
          (sum: number, s: any) => sum + s.questions.length,
          0
        ),
        duration: test.duration || testPaper.data.totalTime || 60,
        totalMarks: test.totalMark || testPaper.data.totalMarks || 100,
      };

      // Store in SSC CGL service
      await SSCCGLService.storePaperInMemory(convertedTest);

      // Navigate to test
      router.push({
        pathname: '/mock-test',
        params: {
          testId: test.id,
          source: 'testseries',
          seriesFolder: seriesFolder,
          sectionFolder: sectionFolder,
        },
      });
    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('Error', 'Failed to start test: ' + (error as any).message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading sections...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {seriesTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionCountText}>
          {sections.length} sections • {sections.reduce((sum, s) => sum + s.availableTests, 0)} tests
        </Text>

        {sections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => toggleSection(section.id)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle} numberOfLines={2}>
                  {section.title}
                </Text>
                <Text style={styles.sectionTestCount}>
                  {section.availableTests || section.tests?.length || 0} tests
                </Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedSections.has(section.id) ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.has(section.id) && section.tests && section.tests.length > 0 && (
              <View style={styles.testsContainer}>
                {section.tests.slice(0, 10).map((test) => (
                  <TouchableOpacity
                    key={test.id}
                    style={styles.testItem}
                    onPress={() => handleTestPress(section.id, test)}
                  >
                    <View style={styles.testInfo}>
                      <Text style={styles.testTitle} numberOfLines={2}>
                        {test.title}
                      </Text>
                      {test.description && (
                        <Text style={styles.testDescription} numberOfLines={1}>
                          {test.description}
                        </Text>
                      )}
                      <View style={styles.testMeta}>
                        {test.questionCount && (
                          <Text style={styles.testMetaText}>
                            {test.questionCount} Qs
                          </Text>
                        )}
                        {test.duration && (
                          <Text style={styles.testMetaText}>• {test.duration} min</Text>
                        )}
                        {test.totalMark && (
                          <Text style={styles.testMetaText}>• {test.totalMark} marks</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.startButton}>
                      <Text style={styles.startButtonText}>Start</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {section.tests.length > 10 && (
                  <Text style={styles.moreTestsText}>
                    +{section.tests.length - 10} more tests available
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}

        {sections.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sections found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionCountText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginVertical: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  sectionTestCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  expandIcon: {
    fontSize: 16,
    color: '#667eea',
    marginLeft: 12,
  },
  testsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
  testDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  testMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  testMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  startButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  moreTestsText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
});
