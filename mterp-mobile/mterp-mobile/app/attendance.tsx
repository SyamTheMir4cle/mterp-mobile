import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import api from '../src/api';
// IMPORT ALERT BARU
import CustomAlert from '../components/CustomAlert';

export default function AttendanceScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');

  // STATE UNTUK ALERT
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#fff', marginBottom: 20 }}>Butuh izin kamera</Text>
        <TouchableOpacity style={styles.btnRetake} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photoData = await cameraRef.takePictureAsync({ quality: 0.5 });
        if (photoData) setPhoto(photoData.uri);
      } catch (error) {
        // GANTI ALERT ERROR
        setAlertConfig({
          visible: true, type: 'error', 
          title: 'Kamera Error', message: 'Gagal mengambil gambar.'
        });
      }
    }
  };

  const uploadAbsen = async () => {
    if (!photo) return;
    setLoading(true);

    try {
      const formData = new FormData();
      const filename = photo.split('/').pop();
      
      const fileData = {
        uri: photo,
        name: filename || `absen_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any;

      formData.append('foto', fileData);
      formData.append('projectId', 'PROYEK_DEMO_01'); 
      formData.append('jamMasuk', new Date().toLocaleTimeString());

      await api.post('/attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data
      });

      // GANTI ALERT SUKSES
      setAlertConfig({
        visible: true, 
        type: 'success', 
        title: 'Absensi Berhasil!', 
        message: 'Data kehadiran dan foto Anda telah tersimpan di server.'
      });

    } catch (error: any) {
      console.log("Upload Error:", error);
      const pesan = error.response?.data?.error || "Gagal menghubungi server.";
      
      // GANTI ALERT ERROR
      setAlertConfig({
        visible: true, 
        type: 'error', 
        title: 'Gagal Upload', 
        message: pesan
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertConfig({ ...alertConfig, visible: false });
    if (alertConfig.type === 'success') {
      router.back(); // Kembali ke dashboard kalau sukses
    }
  };

  return (
    <View style={styles.container}>
      {/* PASANG KOMPONEN ALERT DI SINI */}
      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />

      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.btn, styles.btnRetake]} onPress={() => setPhoto(null)}>
              <Text style={styles.btnText}>Ulang Foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.btn, styles.btnUpload]} onPress={uploadAbsen} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>KIRIM SEKARANG</Text>}
            </TouchableOpacity>
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  camera: { flex: 1 },
  cameraControls: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 50 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#fff' },
  previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  previewImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  actionButtons: { flexDirection: 'row', gap: 20, marginTop: 20 },
  btn: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnRetake: { backgroundColor: '#e74c3c' },
  btnUpload: { backgroundColor: '#312e59' }, // Pakai warna tema
});