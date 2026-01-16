import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UploadCloud, Plus, Trash2, Save } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import api from '../src/api';
import { Header, Input, Section, Button, EmptyState } from '../components/shared';

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
      <Header title="Buat Proyek Baru" />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Section 1: Info Dasar & Jadwal */}
        <Section title="1. Informasi & Jadwal">
          <Input
            label="Nama Proyek"
            placeholder="Contoh: Pembangunan Ruko..."
            value={form.nama}
            onChangeText={t => setForm({ ...form, nama: t })}
          />
          
          <Input
            label="Lokasi"
            placeholder="Jakarta Selatan"
            value={form.lokasi}
            onChangeText={t => setForm({ ...form, lokasi: t })}
          />
          
          {/* Row Tanggal Proyek */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input
              label="Tgl Mulai (YYYY-MM-DD)"
              placeholder="2024-01-01"
              value={form.startDate}
              onChangeText={t => setForm({ ...form, startDate: t })}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Input
              label="Tgl Selesai"
              placeholder="2024-12-31"
              value={form.endDate}
              onChangeText={t => setForm({ ...form, endDate: t })}
              style={{ flex: 1, marginBottom: 0 }}
            />
          </View>

          <Input
            label="Estimasi Budget"
            placeholder="Rp 0"
            type="number"
            value={form.budget}
            onChangeText={t => setForm({ ...form, budget: t })}
          />
        </Section>

        {/* Section 2: Dokumen */}
        <Section title="2. Dokumen Referensi" subtitle="Upload file pendukung (PDF/Img)">
          {renderDocPicker('Dokumen Perencanaan', 'perencanaan')}
          {renderDocPicker('RAB (Rencana Anggaran)', 'rab')}
          {renderDocPicker('Gambar Kerja', 'gambarKerja')}
          {renderDocPicker('Rencana Material', 'rencanaMaterial')}
          {renderDocPicker('Rencana Alat', 'rencanaAlat')}
        </Section>

        {/* Section 3: Item Pekerjaan (Schedule) */}
        <Section 
          title="3. Jadwal Item Pekerjaan" 
          subtitle="Jadwal item digunakan untuk kalkulasi Kurva S."
          actionLabel="Tambah"
          onAction={addWorkItem}
          actionIcon={Plus}
        >
          {workItems.length === 0 && (
            <EmptyState
              title="Belum ada item pekerjaan"
              description="Klik tombol Tambah untuk menambahkan item pekerjaan"
            />
          )}

          {workItems.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.itemNum}>Item #{index + 1}</Text>
                <TouchableOpacity onPress={() => removeWorkItem(item.id)}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
                            <View style={{ gap: 0 }}>
                <Input
                  placeholder="Nama Pekerjaan (misal: Pondasi)"
                  value={item.name}
                  onChangeText={t => updateWorkItem(item.id, 'name', t)}
                />
                <Input
                  placeholder="Target (misal: 100 m3 / 100%)"
                  value={item.target}
                  onChangeText={t => updateWorkItem(item.id, 'target', t)}
                />
                
                {/* Tanggal Item */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Input
                    label="Mulai"
                    placeholder="YYYY-MM-DD"
                    value={item.startDate}
                    onChangeText={t => updateWorkItem(item.id, 'startDate', t)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <Input
                    label="Selesai"
                    placeholder="YYYY-MM-DD"
                    value={item.endDate}
                    onChangeText={t => updateWorkItem(item.id, 'endDate', t)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                </View>
              </View>
            </View>
          ))}
        </Section>

        <Button
          title="SIMPAN PROYEK"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          icon={Save}
          iconPosition="left"
          loading={loading}
          fullWidth
          style={{ marginTop: 10, marginBottom: 40 }}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24 },
  
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docLabel: { fontSize: 14, fontWeight: '500', color: '#334155' },
  fileName: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  uploadText: { fontSize: 12, color: '#312e59', fontWeight: 'bold' },

  itemRow: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16 },
  itemNum: { fontSize: 14, fontWeight: 'bold', color: '#312e59' },
});