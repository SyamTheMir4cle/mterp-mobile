import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera, Banknote, DollarSign, Wallet, X } from 'lucide-react-native';
import api from '../src/api';
import CustomAlert from '../components/CustomAlert';
import { Button, Input, Header } from '../components/shared';

export default function AttendanceScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  
  // Wage State
  const [wageType, setWageType] = useState<'full' | 'half'>('full'); // 1.0 or 0.5
  
  // Kasbon State
  const [kasbonVisible, setKasbonVisible] = useState(false);
  const [kasbonAmount, setKasbonAmount] = useState('');
  const [kasbonReason, setKasbonReason] = useState('');

  // Alert
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success' as any, title: '', message: '' });

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#fff', marginBottom: 20 }}>Butuh izin kamera</Text>
        <Button title="Izinkan" onPress={requestPermission} variant="primary" style={{ alignSelf: 'center' }} />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photoData = await cameraRef.takePictureAsync({ quality: 0.5 });
        if (photoData) setPhoto(photoData.uri);
      } catch (error) {
        setAlertConfig({ visible: true, type: 'error', title: 'Error', message: 'Gagal mengambil gambar.' });
      }
    }
  };

  const uploadAbsen = async () => {
    if (!photo) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('foto', { uri: photo, name: 'absen.jpg', type: 'image/jpeg' } as any);
      formData.append('projectId', 'PROYEK_DEMO_01'); 
      formData.append('jamMasuk', new Date().toLocaleTimeString());
      formData.append('wageMultiplier', wageType === 'full' ? '1.0' : '0.5'); // Schema: 1 or 0.5

      await api.post('/attendance', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setAlertConfig({ visible: true, type: 'success', title: 'Absensi Berhasil!', message: `Tercatat dengan rate ${wageType === 'full' ? '1 Hari' : 'Setengah Hari'}` });
    } catch (error: any) {
      setAlertConfig({ visible: true, type: 'error', title: 'Gagal Upload', message: error.response?.data?.error || "Gagal menghubungi server." });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestKasbon = () => {
      // Mock API Call
      setAlertConfig({ visible: true, type: 'success', title: 'Kasbon Diajukan', message: 'Menunggu persetujuan Finance/Ops Director.' });
      setKasbonVisible(false);
      setKasbonAmount('');
  };

  return (
    <View style={styles.container}>
      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onClose={() => { setAlertConfig({...alertConfig, visible: false}); if(alertConfig.type==='success') router.back(); }} />

      {photo ? (
        <View style={styles.previewContainer}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
              <Text style={styles.title}>Konfirmasi Kehadiran</Text>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              
              <Text style={styles.label}>Tipe Kehadiran (Wage Rate)</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                  <TouchableOpacity onPress={() => setWageType('full')} style={[styles.wageBtn, wageType === 'full' && styles.wageBtnActive]}>
                      <DollarSign size={20} color={wageType === 'full' ? '#fff' : '#475569'} />
                      <Text style={[styles.wageText, wageType === 'full' && { color: '#fff' }]}>1 Hari (Full)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setWageType('half')} style={[styles.wageBtn, wageType === 'half' && styles.wageBtnActive]}>
                      <DollarSign size={20} color={wageType === 'half' ? '#fff' : '#475569'} />
                      <Text style={[styles.wageText, wageType === 'half' && { color: '#fff' }]}>0.5 Hari (Half)</Text>
                  </TouchableOpacity>
              </View>

              <Button title="KIRIM ABSEN" onPress={uploadAbsen} variant="primary" size="large" loading={loading} />
              <Button title="Ulang Foto" onPress={() => setPhoto(null)} variant="danger" size="medium" style={{ marginTop: 12 }} />
          
              <View style={styles.kasbonArea}>
                  <Text style={{ fontWeight: 'bold', color: '#312e59', marginBottom: 8 }}>Butuh Dana Darurat?</Text>
                  <TouchableOpacity style={styles.kasbonBtn} onPress={() => setKasbonVisible(true)}>
                      <Wallet size={20} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajukan Kasbon</Text>
                  </TouchableOpacity>
              </View>
          </ScrollView>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={(ref) => setCameraRef(ref)}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Modal Kasbon */}
      <Modal visible={kasbonVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                      <Text style={styles.modalTitle}>Form Kasbon</Text>
                      <TouchableOpacity onPress={() => setKasbonVisible(false)}><X size={24} color="#000" /></TouchableOpacity>
                  </View>
                  <Input label="Jumlah (Rp)" type="number" value={kasbonAmount} onChangeText={setKasbonAmount} placeholder="0" />
                  <Input label="Alasan" value={kasbonReason} onChangeText={setKasbonReason} placeholder="Keperluan mendesak..." />
                  <Button title="AJUKAN" onPress={handleRequestKasbon} variant="primary" icon={Banknote} style={{ marginTop: 10 }} />
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 50 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#fff' },
  
  previewContainer: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
  previewImage: { width: '100%', height: 300, borderRadius: 16, marginBottom: 24 },
  
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 12 },
  wageBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: '#F1F5F9', gap: 8 },
  wageBtnActive: { backgroundColor: '#312e59' },
  wageText: { fontWeight: 'bold', color: '#475569' },

  kasbonArea: { marginTop: 40, padding: 20, backgroundColor: '#EEF2FF', borderRadius: 16, alignItems: 'center' },
  kasbonBtn: { flexDirection: 'row', backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' }
});