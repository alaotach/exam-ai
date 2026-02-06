import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import TestSeriesService, { TestSeries } from '@/services/testseries-service';

export default function TestSeriesBrowseScreen() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<TestSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTestSeries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSeries(testSeries);
    } else {
      const filtered = testSeries.filter((series) =>
        series.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSeries(filtered);
    }
  }, [searchQuery, testSeries]);

  const loadTestSeries = async () => {
    try {
      setIsLoading(true);
      const series = await TestSeriesService.fetchAllTestSeries();
      setTestSeries(series);
      setFilteredSeries(series);
    } catch (error) {
      console.error('Error loading test series:', error);
      Alert.alert('Error', 'Failed to load test series');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesPress = (series: TestSeries) => {
    router.push({
      pathname: '/testseries-detail',
      params: {
        seriesId: series.id,
        seriesFolder: series.folderName,
        seriesTitle: series.title,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Series</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search test series..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading test series...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.countText}>
            {filteredSeries.length} test series • {filteredSeries.reduce((sum, s) => sum + s.totalTests, 0)} tests available
          </Text>

          {filteredSeries.map((series) => (
            <TouchableOpacity
              key={series.id}
              style={styles.seriesCard}
              onPress={() => handleSeriesPress(series)}
            >
              <View style={styles.seriesHeader}>
                <Text style={styles.seriesTitle} numberOfLines={2}>
                  {series.title}
                </Text>
              </View>

              <View style={styles.seriesStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{series.totalSections}</Text>
                  <Text style={styles.statLabel}>Sections</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{series.totalTests}</Text>
                  <Text style={styles.statLabel}>Tests</Text>
                </View>
              </View>

              <View style={styles.seriesFooter}>
                <Text style={styles.exploreText}>Tap to explore →</Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredSeries.length === 0 && !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No test series found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    paddingVertical: 12,
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
  countText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8E8E93',
    marginBottom: 12,
  },
  seriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  seriesHeader: {
    marginBottom: 12,
  },
  seriesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    lineHeight: 24,
  },
  seriesStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  seriesFooter: {
    marginTop: 8,
  },
  exploreText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 8,
  },
});
