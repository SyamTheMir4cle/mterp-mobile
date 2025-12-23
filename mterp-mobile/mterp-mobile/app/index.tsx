import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HardHat, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Error', 'Isi username dan password');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      router.replace('/home');
    } catch (error) {
      Alert.alert('Gagal Login', 'Cek koneksi atau username/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <LinearGradient colors={['#F8F9FA', '#E9ECEF']} style={StyleSheet.absoluteFill} />
      <View style={styles.circleDecor} />

      <View style={styles.content}>
        <View style={styles.header}>
          <LinearGradient colors={['#312e59', '#514d8a']} style={styles.logoBox}>
            <HardHat color="white" size={40} />
          </LinearGradient>
          <Text style={styles.title}>mterp<Text style={{ color: '#514d8a' }}>.</Text></Text>
          <Text style={styles.subtitle}>Construction ERP Mobile</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput 
              style={styles.input} 
              value={username} 
              onChangeText={setUsername} 
              placeholder="Masukan username"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Masukan password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient 
              colors={['#312e59', '#514d8a']} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.btn}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.btnText}>Sign In</Text>
                  <ArrowRight color="#fff" size={20} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register' as any)} style={{ marginTop: 20 }}>
             <Text style={{ textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
               Belum punya akses? <Text style={{ color: '#312e59', fontWeight: 'bold' }}>Daftar Akun</Text>
             </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.version}>v2.4.0 Build 2024</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  circleDecor: {
    position: 'absolute', top: -100, right: -100, width: 300, height: 300,
    borderRadius: 150, backgroundColor: 'rgba(49, 46, 89, 0.05)',
  },
  content: { padding: 30, zIndex: 10 },
  header: { marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, transform: [{ rotate: '-5deg' }],
    shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
  },
  title: { fontSize: 42, fontWeight: '900', color: '#312e59', letterSpacing: -1 },
  subtitle: { fontSize: 18, color: '#94A3B8', fontWeight: '500' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16,
    padding: 18, fontSize: 16, fontWeight: '600', color: '#334155',
  },
  btn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    padding: 18, borderRadius: 16, marginTop: 10,
    shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  version: { position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', color: '#CBD5E1', fontWeight: '600' }
});