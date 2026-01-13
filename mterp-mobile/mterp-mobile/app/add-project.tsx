import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, UploadCloud, Plus, Trash2, Save, Calendar } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../src/api';

export default function AddProjectScreen() {
  const [loading, setLoading] = useState(false);
  
  // Basic Info (Ditambah End Date)
  const [form, setForm] = useState({
    nama: '',
    lokasi: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0], // Default hari ini
    endDate: ''
  });

  // Documents State
  const [docs, setDocs] = useState<{ [key: string]: any }>({
    perencanaan: null,
    rab: null,
    gambarKerja: null,
    rencanaMaterial: null,
    rencanaAlat: null
  });

  // Work Items State (Ditambah Start & End Date per Item)
  const [workItems, setWorkItems] = useState<{ 
    id: number; 
    name: string; 
    target: string; 
    startDate: string; 
    endDate: string; 
  }[]>([]);

  const pickDocument = async (type: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        setDocs(prev => ({ ...prev, [type]: result.assets![0] }));
      }
    } catch (err) {
      console.log('Doc Picker Error:', err);
    }
  };

  const addWorkItem = () => {
    setWorkItems([...workItems, { 
      id: Date.now(), 
      name: '', 
      target: '', 
      startDate: form.startDate, // Default ikut start project
      endDate: form.endDate      // Default ikut end project
    }]);
  };

  const removeWorkItem = (id: number) => {
    setWorkItems(workItems.filter(item => item.id !== id));
  };

  const updateWorkItem = (id: number, field: keyof typeof workItems[0], value: string) => {
    setWorkItems(workItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.lokasi || !form.startDate || !form.endDate) {
      Alert.alert('Error', 'Nama, Lokasi, dan Tanggal Proyek wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append Basic Info
      formData.append('nama', form.nama);
      formData.append('lokasi', form.lokasi);
      formData.append('budget', form.budget);
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate); // Kirim End Date
      formData.append('status', 'Planning');

      // Append Work Items (Include Schedule)
      formData.append('workItems', JSON.stringify(workItems));

      // Append Files
      Object.keys(docs).forEach(key => {
        const file = docs[key];
        if (file) {
          formData.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream'
          } as any);
        }
      });

      // API Call
      await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Sukses', 'Proyek berhasil dibuat!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Gagal', error.response?.data?.msg || 'Terjadi kesalahan saat upload data.');
    } finally {
      setLoading(false);
    }
  };

  const renderDocPicker = (label: string, key: string) => (
    <View style={styles.docRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{label}</Text>
        {docs[key] && (
          <Text style={styles.fileName} numberOfLines={1}>
            📎 {docs[key].name}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(key)}>
        <UploadCloud size={20} color="#312e59" />
        <Text style={styles.uploadText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Proyek Baru</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Section 1: Info Dasar & Jadwal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Informasi & Jadwal</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Proyek</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Contoh: Pembangunan Ruko..." 
              value={form.nama}
              onChangeText={t => setForm({ ...form, nama: t })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lokasi</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Jakarta Selatan" 
              value={form.lokasi}
              onChangeText={t => setForm({ ...form, lokasi: t })}
            />
          </View>
          
          {/* Row Tanggal Proyek */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Tgl Mulai (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="2024-01-01" 
                value={form.startDate}
                onChangeText={t => setForm({ ...form, startDate: t })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Tgl Selesai</Text>
              <TextInput 
                style={styles.input} 
                placeholder="2024-12-31" 
                value={form.endDate}
                onChangeText={t => setForm({ ...form, endDate: t })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimasi Budget</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Rp 0" 
              keyboardType="numeric"
              value={form.budget}
              onChangeText={t => setForm({ ...form, budget: t })}
            />
          </View>
        </View>

        {/* Section 2: Dokumen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Dokumen Referensi</Text>
          <Text style={styles.sectionSub}>Upload file pendukung (PDF/Img)</Text>
          
          {renderDocPicker('Dokumen Perencanaan', 'perencanaan')}
          {renderDocPicker('RAB (Rencana Anggaran)', 'rab')}
          {renderDocPicker('Gambar Kerja', 'gambarKerja')}
          {renderDocPicker('Rencana Material', 'rencanaMaterial')}
          {renderDocPicker('Rencana Alat', 'rencanaAlat')}
        </View>

        {/* Section 3: Item Pekerjaan (Schedule) */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>3. Jadwal Item Pekerjaan</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addWorkItem}>
              <Plus size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Tambah</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSub}>Jadwal item digunakan untuk kalkulasi Kurva S.</Text>
          
          {workItems.length === 0 && (
            <View style={styles.emptyItem}>
              <Text style={{ color: '#94A3B8' }}>Belum ada item pekerjaan</Text>
            </View>
          )}

          {workItems.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.itemNum}>Item #{index + 1}</Text>
                <TouchableOpacity onPress={() => removeWorkItem(item.id)}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <View style={{ gap: 8 }}>
                <TextInput 
                  style={styles.itemInput} 
                  placeholder="Nama Pekerjaan (misal: Pondasi)" 
                  value={item.name}
                  onChangeText={t => updateWorkItem(item.id, 'name', t)}
                />
                <TextInput 
                  style={styles.itemInput} 
                  placeholder="Target (misal: 100 m3 / 100%)" 
                  value={item.target}
                  onChangeText={t => updateWorkItem(item.id, 'target', t)}
                />
                
                {/* Tanggal Item */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tinyLabel}>Mulai</Text>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="YYYY-MM-DD" 
                      value={item.startDate}
                      onChangeText={t => updateWorkItem(item.id, 'startDate', t)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tinyLabel}>Selesai</Text>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="YYYY-MM-DD" 
                      value={item.endDate}
                      onChangeText={t => updateWorkItem(item.id, 'endDate', t)}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Save size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>SIMPAN PROYEK</Text>
            </>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 24 },
  
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#64748B', marginBottom: 16 },

  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  tinyLabel: { fontSize: 10, color: '#94A3B8', marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC' },

  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docLabel: { fontSize: 14, fontWeight: '500', color: '#334155' },
  fileName: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  uploadText: { fontSize: 12, color: '#312e59', fontWeight: 'bold' },

  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  emptyItem: { padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  
  itemRow: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16 },
  itemNum: { fontSize: 14, fontWeight: 'bold', color: '#312e59' },
  itemInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 13, backgroundColor: '#fff' },
  dateInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 8, fontSize: 12, backgroundColor: '#F8FAFC', color: '#334155' },

  saveBtn: { backgroundColor: '#312e59', padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 40, shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});