import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../src/api';

export default function RegisterScreen() {
  // Step 1: Input Data, Step 2: Input OTP
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'worker' // Default
  });
  const [otp, setOtp] = useState('');

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      return Alert.alert('Error', 'Mohon lengkapi semua data');
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      Alert.alert('Sukses', 'Kode OTP telah dikirim ke email Anda.');
      setStep(2); // Pindah ke layar OTP
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.msg || 'Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await api.post('/auth/verify', { email: formData.email, otp });
      Alert.alert('Berhasil', 'Akun Anda aktif! Silakan Login.', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.msg || 'OTP Salah');
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN LANGKAH 2: VERIFIKASI OTP ---
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <CheckCircle2 size={60} color="#312e59" style={{alignSelf:'center', marginBottom:20}} />
          <Text style={styles.title}>Verifikasi Email</Text>
          <Text style={styles.subtitle}>Masukkan 6 digit kode yang dikirim ke {formData.email}</Text>
          
          <TextInput 
            style={[styles.input, {textAlign: 'center', fontSize: 24, letterSpacing: 8}]} 
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity onPress={handleVerify} disabled={loading}>
            <LinearGradient colors={['#312e59', '#514d8a']} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verifikasi & Aktifkan</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- TAMPILAN LANGKAH 1: FORM REGISTRASI ---
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Daftar untuk akses sistem ERP</Text>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <User size={20} color="#94A3B8" />
              <TextInput 
                style={styles.inputField} 
                placeholder="Nama Lengkap" 
                value={formData.fullName}
                onChangeText={(t) => setFormData({...formData, fullName: t})}
              />
            </View>

            {/* Role Selection (Sederhana) */}
            <View style={styles.roleContainer}>
               <Text style={styles.label}>DAFTAR SEBAGAI:</Text>
               <View style={styles.roleRow}>
                  {['supervisor', 'asset_admin', 'director'].map((r) => (
                    <TouchableOpacity 
                      key={r}
                      onPress={() => setFormData({...formData, role: r})}
                      style={[styles.roleBadge, formData.role === r && styles.roleActive]}
                    >
                      <Text style={[styles.roleText, formData.role === r && styles.roleTextActive]}>
                        {r === 'asset_admin' ? 'Admin Aset' : r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Mail size={20} color="#94A3B8" />
              <TextInput 
                style={styles.inputField} 
                placeholder="Email Perusahaan" 
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(t) => setFormData({...formData, email: t})}
              />
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <User size={20} color="#94A3B8" />
              <TextInput 
                style={styles.inputField} 
                placeholder="Username Login" 
                autoCapitalize="none"
                value={formData.username}
                onChangeText={(t) => setFormData({...formData, username: t})}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Lock size={20} color="#94A3B8" />
              <TextInput 
                style={styles.inputField} 
                placeholder="Password" 
                secureTextEntry
                value={formData.password}
                onChangeText={(t) => setFormData({...formData, password: t})}
              />
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading}>
              <LinearGradient colors={['#312e59', '#514d8a']} style={styles.btn}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.btnText}>Mulai Verifikasi E-mail</Text>
                    <ArrowRight color="#fff" size={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
               <Text style={{textAlign:'center', color:'#64748B'}}>Sudah punya akun? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#312e59', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 30 },
  form: { gap: 15 },
  inputGroup: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, 
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12 
  },
  inputField: { flex: 1, fontSize: 16, color: '#334155' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, color: '#334155' },
  
  label: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8, letterSpacing: 1 },
  roleContainer: { marginVertical: 5 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  roleActive: { backgroundColor: '#312e59' },
  roleText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  roleTextActive: { color: '#fff' },

  btn: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, 
    padding: 18, borderRadius: 16, marginTop: 10, shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});