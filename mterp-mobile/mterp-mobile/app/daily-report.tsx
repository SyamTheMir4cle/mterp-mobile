import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Camera, Upload, Users, Wrench, CheckSquare, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/api';

export default function ProjectUpdateScreen() {
  const params = useLocalSearchParams();
  const project = params.project ? JSON.parse(params.project as string) : null;
  
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // 1. Progress Work Items
  // Simulating fetching defined work items from project data (or defaulting if empty)
  const initialItems = project?.workItems?.length 
    ? project.workItems 
    : [{ id: 1, name: 'Pekerjaan Umum', target: '100%' }];
    
  const [itemProgress, setItemProgress] = useState(
    initialItems.map((i: any) => ({ ...i, currentProgress: 0, todayUpdate: '' }))
  );

  // 2. Workforce (Tenaga Kerja) - Should ideally fetch from Attendance API
  const [workforce, setWorkforce] = useState([
    { role: 'Tukang', count: '0' },
    { role: 'Kuli', count: '0' },
    { role: 'Supervisor', count: '1' } // Default msg
  ]);

  // 3. Materials & Tools
  const [resources, setResources] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Update Data
      const updateData = {
        date: new Date().toISOString(),
        workProgress: itemProgress,
        workforce: workforce,
        resources: resources
      };

      formData.append('data', JSON.stringify(updateData));

      // Calculate Average Project Progress for the main field
      const totalProgress = itemProgress.reduce((acc: number, curr: any) => acc + (parseInt(curr.todayUpdate || '0')), 0);
      const avgProgress = Math.min(100, Math.round(totalProgress / (itemProgress.length || 1))); 
      // Note: Logic above is simplistic; usually you'd sum weighted progress. 
      // For now we just send what we have.
      
      formData.append('progress', avgProgress.toString());

      if (photo) {
        formData.append('foto', {
          uri: photo.uri,
          name: 'daily_update.jpg',
          type: 'image/jpeg'
        } as any);
      }

      // Send to Backend
      // NOTE: Using the same endpoint structure as discussed 
      await api.post(`/projects/${project._id}/updates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Also update main progress if needed
      await api.put(`/projects/${project._id}/progress`, { progress: avgProgress });

      Alert.alert('Berhasil', 'Laporan Harian tersimpan!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.log(error);
      Alert.alert('Gagal', 'Gagal menyimpan laporan.');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <View style={styles.container}><Text>Data Error</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Laporan Harian</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Project Info Header */}
        <View style={styles.infoCard}>
          <Text style={styles.projName}>{project.nama}</Text>
          <Text style={styles.projDate}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* 1. FOTO KEGIATAN */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>1. Foto Kegiatan (Wajib)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Camera size={32} color="#CBD5E1" />
                <Text style={{ color: '#94A3B8', marginTop: 8 }}>Ambil / Upload Foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. PROGRESS PEKERJAAN */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>2. Progress Item Pekerjaan</Text>
          {itemProgress.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemLabel}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput 
                  style={styles.numInput} 
                  placeholder="0" 
                  keyboardType="numeric"
                  value={item.todayUpdate}
                  onChangeText={(t) => {
                    const newItems = [...itemProgress];
                    newItems[idx].todayUpdate = t;
                    setItemProgress(newItems);
                  }}
                />
                <Text style={{ fontSize: 12, color: '#64748B' }}>% (Hari Ini)</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 3. TENAGA KERJA */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>3. Tenaga Kerja (Absensi)</Text>
          {workforce.map((w, i) => (
            <View key={i} style={styles.workRow}>
              <Text style={styles.workLabel}>{w.role}</Text>
              <TextInput 
                style={styles.numInput} 
                value={w.count} 
                keyboardType="numeric"
                onChangeText={(t) => {
                  const wf = [...workforce];
                  wf[i].count = t;
                  setWorkforce(wf);
                }}
              />
            </View>
          ))}
        </View>

        {/* 4. MATERIAL & ALAT */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>4. Material & Alat Terpakai</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline 
            placeholder="Tuliskan material dan alat yang digunakan hari ini..."
            value={resources}
            onChangeText={setResources}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitText}>KIRIM LAPORAN</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 50, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  
  infoCard: { marginBottom: 20 },
  projName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  projDate: { color: '#64748B' },

  section: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16 },
  secTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  
  uploadBox: { height: 200, backgroundColor: '#F1F5F9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 8 },
  itemLabel: { flex: 1, fontSize: 14, color: '#334155' },
  numInput: { backgroundColor: '#F1F5F9', width: 60, height: 40, borderRadius: 8, textAlign: 'center', fontWeight: 'bold' },

  workRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  workLabel: { fontSize: 14, color: '#475569' },

  input: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },

  submitBtn: { backgroundColor: '#312e59', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
