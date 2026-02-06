import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SSCCGLService from '@/services/ssc-cgl-service';
import TestSeriesService from '@/services/testseries-service';
import { TestProgressService } from '@/services/test-progress-service';

export default function PracticeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [onlinePapers, setOnlinePapers] = useState<any[]>([]);
  const [testSeriesCount, setTestSeriesCount] = useState<number>(0);
  const [resumableTests, setResumableTests] = useState<any[]>([]);

  React.useEffect(() => {
    // Load SSC CGL papers
    SSCCGLService.fetchPapersList().then(papers => {
         const withAns = papers.filter((p: any) => p.hasAnswers);
         setOnlinePapers(withAns);
     }).catch(err => console.error(err));

    // Load test series count
    TestSeriesService.fetchAllTestSeries().then(series => {
      setTestSeriesCount(series.length);
    }).catch(err => console.error(err));

    // Load resumable test
    TestProgressService.getCurrentTest().then(savedTest => {
      if (savedTest) {
        setResumableTests([{
          testId: savedTest.testId,
          attemptId: savedTest.attemptId,
          testTitle: 'Resume Test',
          currentQuestionIndex: savedTest.currentQuestionIndex,
          totalQuestions: savedTest.answers ? Object.keys(savedTest.answers).length : 100
        }]);
      }
    }).catch(err => console.error(err));
  }, []);

  const handleStartCGLPaper = async (paper: any) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const loadedTest = await SSCCGLService.fetchPaper(paper.filename);
      
      // Navigate to mock-test screen with testId
      router.push({
        pathname: '/mock-test',
        params: { testId: loadedTest.id },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load paper: ' + (error as any).message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Practice Tests</Text>
        
        {/* Resume Tests Section */}
        {resumableTests.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Resume Test</Text>
            <Text style={styles.cardDescription}>
              Continue where you left off
            </Text>
            <View style={styles.mockTestsContainer}>
              {resumableTests.map((test) => (
                <View key={test.attemptId} style={styles.mockTestItem}>
                  <View style={styles.mockTestInfo}>
                    <Text style={styles.mockTestName} numberOfLines={2}>{test.testTitle || 'Test'}</Text>
                    <Text style={{fontSize: 12, color: '#666', marginTop: 4}}>
                      Progress: {Math.round((test.currentQuestionIndex / test.totalQuestions) * 100)}%
                    </Text>
                  </View>
                  <Button
                    title="Resume"
                    onPress={() => router.push({
                      pathname: '/mock-test',
                      params: { testId: test.testId, resume: 'true' }
                    })}
                    variant="primary"
                    size="small"
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Testbook Test Series */}
        <Card>
          <Text style={styles.cardTitle}>Testbook Test Series ({testSeriesCount > 0 ? `${testSeriesCount} series` : 'Loading...'})</Text>
          <Text style={styles.cardDescription}>
            Access 1.8 lakh+ test papers from Testbook
          </Text>
          <Button
            title="Browse All Test Series"
            onPress={() => {
              // @ts-ignore - Route will be registered
              router.push('/testseries-browse');
            }}
            variant="primary"
            size="large"
            style={{marginTop: 10}}
          />
        </Card>
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Practice Tests</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Official SSC CGL Papers ({onlinePapers.length})</Text>
          <Text style={styles.cardDescription}>
            Practice with real SSC CGL exam papers with detailed solutions
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#667eea" style={{marginBottom: 10}} />}
          <View style={styles.mockTestsContainer}>
            {onlinePapers.slice(0, 10).map((paper) => (
              <View key={paper.id} style={styles.mockTestItem}>
                <View style={styles.mockTestInfo}>
                  <Text style={styles.mockTestName} numberOfLines={2}>{paper.title}</Text>
                  <View style={{flexDirection: 'row', gap: 8, marginTop: 4}}>
                    <Text style={{fontSize: 12, color: '#666'}}>Official Paper</Text>
                    {paper.hasAnswers && <Text style={{fontSize: 12, color: 'green', fontWeight: 'bold'}}>Solutions ✓</Text>}
                  </View>
                </View>
                <Button
                  title="Start"
                  onPress={() => handleStartCGLPaper(paper)}
                  variant="primary"
                  size="small"
                  disabled={isLoading}
                />
              </View>
            ))}
            <Button
              title="View All Papers"
              onPress={() => router.push('/test-list')}
              variant="secondary"
              size="medium"
              style={{marginTop: 10}}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Quick Access</Text>
          <View style={styles.quickAccessContainer}>
            <Button
              title="All Mock Tests"
              onPress={() => router.push('/test-list')}
              variant="primary"
              size="large"
              style={{marginBottom: 12}}
            />
            <Button
              title="Bookmarked Questions"
              onPress={() => router.push('/(tabs)/bookmarks')}
              variant="secondary"
              size="large"
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Study Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1</Text>
              <Text style={styles.tipText}>Practice regularly with timed tests</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2</Text>
              <Text style={styles.tipText}>Review detailed solutions after each test</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3</Text>
              <Text style={styles.tipText}>Focus on weak areas identified in analytics</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4</Text>
              <Text style={styles.tipText}>Bookmark difficult questions for later review</Text>
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
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
  },
  mockTestsContainer: {
    gap: 12,
  },
  mockTestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mockTestInfo: {
    flex: 1,
    marginRight: 12,
  },
  mockTestName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  quickAccessContainer: {
    marginTop: 8,
  },
  tipsContainer: {
    gap: 16,
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    backgroundColor: '#E3F2FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    lineHeight: 20,
    paddingTop: 6,
  },
});