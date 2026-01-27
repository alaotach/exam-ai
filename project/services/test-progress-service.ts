// services/test-progress-service.ts
import { auth, db } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { TestAttempt, TestAnalytics } from './ssc-cgl-service';
import UserService from './user-service';

export interface SavedTestState {
  testId: string;
  attemptId: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  questionStates: Record<string, any>; // Changed from array to object
  answers: Record<string, number>;
  lastUpdated: number;
  questionOrder?: string[]; // Array of question IDs in shuffled order
}

export interface TestResult extends TestAnalytics {
  date: string; // ISO string
  testTitle?: string;
  id?: string; // Firestore ID
}

export const TestProgressService = {
  // --- Active Test Management ---

  async saveCurrentTest(state: SavedTestState): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return; 

      const docRef = doc(db, 'users', user.uid, 'active_tests', 'current');
      
      // Ensure clean serialization - convert to JSON and back to remove any non-serializable data
      const cleanState = JSON.parse(JSON.stringify(state));
      
      await setDoc(docRef, cleanState);
    } catch (e) {
      console.error('Failed to save test progress', e);
      throw e;
    }
  },

  async getCurrentTest(): Promise<SavedTestState | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const docRef = doc(db, 'users', user.uid, 'active_tests', 'current');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as SavedTestState;
      } else {
        return null;
      }
    } catch (e) {
      console.error('Failed to load current test', e);
      return null;
    }
  },

  async clearCurrentTest(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid, 'active_tests', 'current');
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Failed to clear current test', e);
    }
  },

  // --- History Management ---

  async saveTestResult(result: TestResult): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in, skipping test result save');
        return;
      }

      console.log('Saving test result to Firestore...');
      // Use attemptId as the document ID to ensure uniqueness
      const docRef = doc(db, 'users', user.uid, 'history', result.attemptId);
      await setDoc(docRef, result);
      console.log('Test result saved to Firestore');

      // Update user statistics in background (non-blocking)
      console.log('Triggering user statistics update...');
      UserService.updateUserStats({
        questionsAttempted: result.totalQuestions,
        accuracy: result.accuracy,
        totalTests: 1, // increment handled in service
      }).catch(err => console.error('Failed to update user stats:', err));
      
    } catch (e) {
      console.error('Failed to save test result', e);
      throw e;
    }
  },

  async getTestHistory(): Promise<TestResult[]> {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const history: TestResult[] = [];
      querySnapshot.forEach((doc) => {
        history.push(doc.data() as TestResult);
      });

      return history;
    } catch (e) {
      console.error('Failed to get history', e);
      return [];
    }
  },
  
  async getTestResult(attemptId: string): Promise<TestResult | undefined> {
    try {
      const user = auth.currentUser;
      if (!user) return undefined;

      const docRef = doc(db, 'users', user.uid, 'history', attemptId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as TestResult;
      } else {
        return undefined;
      }
    } catch (e) {
      console.error('Failed to get test result', e);
      return undefined;
    }
  }
};
