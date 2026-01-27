import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/auth-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { User, GraduationCap, Target, Calendar } from 'lucide-react-native';

const EXAM_OPTIONS = [
  'SSC CGL',
  'SSC CHSL',
  'SSC MTS',
  'SSC CPO',
  'Railway RRB',
  'Banking (IBPS/SBI)',
  'Other',
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Just Started', desc: 'New to exam preparation' },
  { id: 'intermediate', label: 'Preparing', desc: '1-6 months of study' },
  { id: 'advanced', label: 'Advanced', desc: '6+ months of study' },
];

export default function ProfileSetupScreen() {
  const [fullName, setFullName] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [targetExamDate, setTargetExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const toggleExamSelection = (exam: string) => {
    if (selectedExams.includes(exam)) {
      setSelectedExams(selectedExams.filter(e => e !== exam));
    } else {
      setSelectedExams([...selectedExams, exam]);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (selectedExams.length === 0) {
      Alert.alert('Error', 'Please select at least one exam');
      return;
    }

    if (!experienceLevel) {
      Alert.alert('Error', 'Please select your experience level');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        exams: selectedExams,
        experienceLevel,
        targetExamDate: targetExamDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          questionsAttempted: 0,
          accuracy: 0,
          streak: 0,
          totalTests: 0,
        },
      });

      // Navigate to main app
      router.replace('/');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <GraduationCap size={40} color="#667eea" />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your learning experience</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <User size={18} color="#666" />
              <Text style={styles.label}>Full Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Target Exams */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Target size={18} color="#666" />
              <Text style={styles.label}>Target Exams</Text>
            </View>
            <Text style={styles.helperText}>Select one or more exams you're preparing for</Text>
            <View style={styles.chipsContainer}>
              {EXAM_OPTIONS.map((exam) => (
                <TouchableOpacity
                  key={exam}
                  style={[
                    styles.chip,
                    selectedExams.includes(exam) && styles.chipSelected,
                  ]}
                  onPress={() => toggleExamSelection(exam)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedExams.includes(exam) && styles.chipTextSelected,
                    ]}
                  >
                    {exam}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience Level */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <GraduationCap size={18} color="#666" />
              <Text style={styles.label}>Experience Level</Text>
            </View>
            {EXPERIENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.radioOption,
                  experienceLevel === level.id && styles.radioOptionSelected,
                ]}
                onPress={() => setExperienceLevel(level.id)}
              >
                <View style={styles.radioCircle}>
                  {experienceLevel === level.id && (
                    <View style={styles.radioCircleSelected} />
                  )}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{level.label}</Text>
                  <Text style={styles.radioDesc}>{level.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target Exam Date (Optional) */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Calendar size={18} color="#666" />
              <Text style={styles.label}>Target Exam Date (Optional)</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="MM/YYYY (e.g., 06/2026)"
              value={targetExamDate}
              onChangeText={setTargetExamDate}
              keyboardType="default"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  radioOptionSelected: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  radioDesc: {
    fontSize: 13,
    color: '#666',
  },
  button: {
    height: 50,
    backgroundColor: '#667eea',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
