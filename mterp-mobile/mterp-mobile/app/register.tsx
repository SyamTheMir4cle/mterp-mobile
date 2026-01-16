import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../src/api';
import { Input, Button, Chip } from '../components/shared';

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
          
          <Input
            placeholder="000000"
            type="number"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
          />

          <Button
            title="Verifikasi & Aktifkan"
            onPress={handleVerify}
            loading={loading}
            variant="primary"
            size="large"
            fullWidth
          />
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
            <Input
              placeholder="Nama Lengkap"
              value={formData.fullName}
              onChangeText={(t) => setFormData({...formData, fullName: t})}
            />

            {/* Role Selection */}
            <View>
               <Text style={styles.label}>DAFTAR SEBAGAI:</Text>
               <View style={styles.roleRow}>
                  {['supervisor', 'asset_admin', 'director'].map((r) => (
                    <Chip
                      key={r}
                      label={r === 'asset_admin' ? 'Admin Aset' : r.toUpperCase()}
                      onPress={() => setFormData({...formData, role: r})}
                      selected={formData.role === r}
                      variant="outline"
                      size="medium"
                    />
                  ))}
               </View>
            </View>

            <Input
              placeholder="Email Perusahaan"
              type="email"
              value={formData.email}
              onChangeText={(t) => setFormData({...formData, email: t})}
            />

            <Input
              placeholder="Username Login"
              value={formData.username}
              onChangeText={(t) => setFormData({...formData, username: t})}
            />

            <Input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChangeText={(t) => setFormData({...formData, password: t})}
            />

            <Button
              title="Mulai Verifikasi E-mail"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
            />

            <Button
              title="Sudah punya akun? Login"
              onPress={() => router.back()}
              variant="outline"
              size="medium"
              fullWidth
              style={{ marginTop: 16, borderWidth: 0, backgroundColor: 'transparent' }}
            />
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
  
  label: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8, letterSpacing: 1 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
});