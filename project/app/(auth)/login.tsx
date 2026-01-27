import React, { useState, useEffect } from 'react';
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
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { auth, firebaseConfig } from '@/services/firebaseConfig';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Chrome, Phone, Mail } from 'lucide-react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Phone Auth State
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const recaptchaVerifier = React.useRef(null);

  const sendVerification = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number with country code (e.g. +91...)');
      return;
    }
    setLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current!
      );
      setVerificationId(verificationId);
      Alert.alert('Verification Code Sent', 'Please check your phone for the code.');
    } catch (err: any) {
      Alert.alert('Error', `Phone Auth Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!verificationCode || !verificationId) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
    } catch (err: any) {
      Alert.alert('Error', 'Invalid code or error logging in.');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add your Client IDs from Google Cloud Console here
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '70133368788-u3k4o6hglldr2n7dgt9ofbe21ro9scbj.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', 
    androidClientId: '70133368788-g0633ns48s31sl503vbdi67vjavt697g.apps.googleusercontent.com',
    // Helps with redirect issues in some environments
    redirectUri: makeRedirectUri({
      scheme: 'myapp'
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .catch((error) => {
          Alert.alert('Google Sign-In Error', error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will handle navigation
    } catch (error: any) {
      let message = 'An unknown error occurred.';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (error.code === 'auth/invalid-credential') message = 'Invalid credentials.';
      Alert.alert('Login Failed', message);
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your progress</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.modeSwitchContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, loginMode === 'email' && styles.modeButtonActive]}
              onPress={() => setLoginMode('email')}
            >
              <Mail size={20} color={loginMode === 'email' ? '#fff' : '#666'} />
              <Text style={[styles.modeButtonText, loginMode === 'email' && styles.modeButtonTextActive]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, loginMode === 'phone' && styles.modeButtonActive]}
              onPress={() => setLoginMode('phone')}
            >
              <Phone size={20} color={loginMode === 'phone' ? '#fff' : '#666'} />
              <Text style={[styles.modeButtonText, loginMode === 'phone' && styles.modeButtonTextActive]}>Phone</Text>
            </TouchableOpacity>
          </View>

          {loginMode === 'email' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
             <>
               {!verificationId ? (
                 <>
                   <View style={styles.inputContainer}>
                     <Text style={styles.label}>Phone Number</Text>
                     <TextInput
                       style={styles.input}
                       placeholder="+91 99999 99999"
                       value={phoneNumber}
                       onChangeText={setPhoneNumber}
                       keyboardType="phone-pad"
                       autoComplete="tel"
                     />
                   </View>
                   <TouchableOpacity
                     style={styles.button}
                     onPress={sendVerification}
                     disabled={loading}
                   >
                     {loading ? (
                       <ActivityIndicator color="#fff" />
                     ) : (
                       <Text style={styles.buttonText}>Send Code</Text>
                     )}
                   </TouchableOpacity>
                 </>
               ) : (
                 <>
                   <View style={styles.inputContainer}>
                     <Text style={styles.label}>Verification Code</Text>
                     <TextInput
                       style={styles.input}
                       placeholder="123456"
                       value={verificationCode}
                       onChangeText={setVerificationCode}
                       keyboardType="number-pad"
                     />
                   </View>
                    <TouchableOpacity
                     style={styles.button}
                     onPress={confirmCode}
                     disabled={loading}
                   >
                     {loading ? (
                       <ActivityIndicator color="#fff" />
                     ) : (
                       <Text style={styles.buttonText}>Verify & Sign In</Text>
                     )}
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => { setVerificationId(''); setVerificationCode(''); }} style={{marginTop: 15, alignItems: 'center'}}>
                       <Text style={{color: '#667eea'}}>Change Phone Number</Text>
                   </TouchableOpacity>
                 </>
               )}
             </>
          )}

          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
            attemptInvisibleVerification={true} // optional
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={() => promptAsync()}
            disabled={!request || loading}
          >
             {/* Using a simple Text here as lucide-react-native Chrome icon might not be perfect for Google logo, 
                 but it conveys the web/browser/google meaning. */}
            <Chrome size={20} color="#333" style={{ marginRight: 10 }} />
            <Text style={[styles.buttonText, styles.googleButtonText]}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    marginTop: 0,
  },
  googleButtonText: {
    color: '#333',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
});
