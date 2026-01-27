import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TestProgressService, TestResult } from '@/services/test-progress-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Clock, Calendar, ArrowLeft } from 'lucide-react-native';

export default function TestHistoryScreen() {
    const [history, setHistory] = useState<TestResult[]>([]);
    const router = useRouter();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await TestProgressService.getTestHistory();
        // Sort by date desc
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(data);
    };

    const renderItem = ({ item }: { item: TestResult }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push({ pathname: '/test-result', params: { attemptId: item.attemptId } })}
        >
            <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>{item.testTitle || 'Unknown Test'}</Text>
                <View style={styles.metaContainer}>
                    <Calendar size={14} color="#666" style={{marginRight: 4}} />
                    <Text style={styles.subtitle}>{new Date(item.date).toLocaleDateString()}</Text>
                    <View style={styles.divider} />
                    <Text style={[styles.subtitle, { color: getScoreColor(item.overallScore, item.totalMarks) }]}>
                        Score: {item.overallScore}/{item.totalMarks}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color="#ccc" />
        </TouchableOpacity>
    );

    const getScoreColor = (score: number, maxScore: number) => {
        const p = (score / maxScore) * 100;
        if (p >= 70) return '#4CAF50';
        if (p >= 40) return '#FF9800';
        return '#F44336';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Test History</Text>
            </View>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.attemptId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No history found.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    list: { padding: 16 },
    card: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    cardContent: { flex: 1, marginRight: 12 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
    metaContainer: { flexDirection: 'row', alignItems: 'center' },
    subtitle: { fontSize: 14, color: '#666' },
    divider: { width: 1, height: 12, backgroundColor: '#ddd', marginHorizontal: 8 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' }
});
