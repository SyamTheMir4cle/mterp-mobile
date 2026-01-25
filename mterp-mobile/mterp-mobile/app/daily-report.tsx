import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Camera, Save, CloudRain, ShieldAlert, Package, Calendar, DollarSign, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/api';
import { Header, Section, Input, Button } from '../components/shared';
import { WorkItem, ProjectSupply } from '../src/types';

export default function ProjectUpdateScreen() {
  const params = useLocalSearchParams();
  const project = params.project ? JSON.parse(params.project as string) : null;
  
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // --- STATE ---
  
  // 1. General
  const [weather, setWeather] = useState('Cerah');
  const [toolbox, setToolbox] = useState<{held: boolean, notes: string}>({ held: false, notes: '' });

  // 2. Supply Updates (Actual Arrived)
  const [supplyUpdates, setSupplyUpdates] = useState<{item: string, cost: string, date: string}[]>([]);

  // 3. Work Progress (Actuals)
  // Init from project workItems
  const [itemUpdates, setItemUpdates] = useState<any[]>([]);

  useEffect(() => {
      if (project?.workItems) {
          setItemUpdates(project.workItems.map((i: WorkItem) => ({
              id: i.id,
              name: i.name,
              actualStart: i.dates?.actualStart || '',
              actualEnd: i.dates?.actualEnd || '',
              todayCost: '', // Rupiah used today
              resourcesNote: '' // Material/Manpower used
          })));
      }
  }, [project]);

  // Image Picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const addSupplyUpdate = () => {
      setSupplyUpdates([...supplyUpdates, { item: '', cost: '', date: new Date().toISOString().split('T')[0] }]);
  };

  const updateSupplyItem = (idx: number, field: string, val: string) => {
      const arr = [...supplyUpdates];
      (arr[idx] as any)[field] = val;
      setSupplyUpdates(arr);
  };

  const updateWorkItem = (id: number, field: string, val: any) => {
      setItemUpdates(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      const payload = {
        date: new Date().toISOString(),
        weather,
        toolbox,
        supplyUpdates,
        workItems: itemUpdates
      };

      formData.append('data', JSON.stringify(payload));

      if (photo) {
        formData.append('foto', {
          uri: photo.uri,
          name: 'daily_update.jpg',
          type: 'image/jpeg'
        } as any);
      }

      await api.post(`/projects/${project._id}/updates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Berhasil', 'Laporan Harian tersimpan!', [{ text: 'OK', onPress: () => router.back() }]);

    } catch (error: any) {
      Alert.alert('Gagal', 'Gagal menyimpan laporan.');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <View style={styles.container}><Text>Data Error</Text></View>;

  return (
    <View style={styles.container}>
      <Header title="Laporan Harian" />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Project Info */}
        <View style={styles.infoCard}>
          <Text style={styles.projName}>{project.nama}</Text>
          <Text style={styles.projDate}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* 1. FOTO (Wajib) */}
        <Section title="1. Dokumentasi (Wajib)">
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Camera size={32} color="#CBD5E1" />
                <Text style={{ color: '#94A3B8', marginTop: 8 }}>Ambil Foto Kegiatan</Text>
              </View>
            )}
          </TouchableOpacity>
        </Section>

        {/* 2. KONDISI LAPANGAN */}
        <Section title="2. Kondisi Lapangan">
            <Text style={styles.label}>Cuaca</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['Cerah', 'Berawan', 'Hujan'].map(c => (
                    <TouchableOpacity key={c} onPress={() => setWeather(c)} style={[styles.choiceBtn, weather === c && styles.choiceBtnActive]}>
                        <CloudRain size={14} color={weather === c ? '#fff' : '#64748B'} />
                        <Text style={[styles.choiceText, weather === c && { color: '#fff' }]}>{c}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Toolbox Meeting</Text>
            <TouchableOpacity 
                style={[styles.checkBox, toolbox.held && { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}
                onPress={() => setToolbox(p => ({ ...p, held: !p.held }))}
            >
                <ShieldAlert size={20} color={toolbox.held ? '#10B981' : '#94A3B8'} />
                <Text style={{ fontWeight: 'bold', color: toolbox.held ? '#065F46' : '#64748B' }}>
                    {toolbox.held ? 'DILAKSANAKAN' : 'Tidak Ada Meeting'}
                </Text>
            </TouchableOpacity>
            {toolbox.held && (
                <Input placeholder="Catatan Meeting..." value={toolbox.notes} onChangeText={t => setToolbox(p => ({...p, notes: t}))} style={{ marginTop: 8 }} />
            )}
        </Section>

        {/* 3. UPDATE SUPPLY */}
        <Section title="3. Supply Material Masuk" actionLabel="Tambah" onAction={addSupplyUpdate} actionIcon={Plus}>
            {supplyUpdates.map((s, idx) => (
                <View key={idx} style={styles.cardItem}>
                    <Input placeholder="Nama Material" value={s.item} onChangeText={t => updateSupplyItem(idx, 'item', t)} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={[styles.moneyInput, { flex: 1, marginBottom: 12 }]}>
                            <Text>Rp</Text>
                            <TextInput 
                                style={{ flex: 1 }} keyboardType="numeric" placeholder="Cost Real" 
                                value={s.cost} onChangeText={t => updateSupplyItem(idx, 'cost', t)} 
                            />
                        </View>
                        <Input style={{ flex: 1 }} placeholder="Tgl Beli" value={s.date} onChangeText={t => updateSupplyItem(idx, 'date', t)} />
                    </View>
                </View>
            ))}
            {supplyUpdates.length === 0 && <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Tidak ada material masuk hari ini.</Text>}
        </Section>

        {/* 4. PROGRESS PEKERJAAN */}
        <Section title="4. Update Pekerjaan (Actuals)">
            {itemUpdates.map((item) => (
                <View key={item.id} style={styles.cardItem}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{item.name}</Text>
                    
                    {/* Dates */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Input style={{ flex: 1 }} label="Act. Start" placeholder="YYYY-MM-DD" value={item.actualStart} onChangeText={t => updateWorkItem(item.id, 'actualStart', t)} />
                        <Input style={{ flex: 1 }} label="Act. End" placeholder="YYYY-MM-DD" value={item.actualEnd} onChangeText={t => updateWorkItem(item.id, 'actualEnd', t)} />
                    </View>

                    {/* Resources Used */}
                    <Input 
                        label="Sumber Daya Terpakai" 
                        placeholder="Contoh: Semen 5 sak, 3 Tukang..." 
                        multiline 
                        value={item.resourcesNote} 
                        onChangeText={t => updateWorkItem(item.id, 'resourcesNote', t)} 
                    />

                    {/* Cost Today */}
                    <Text style={styles.label}>Estimasi Biaya Hari Ini (Rp)</Text>
                    <View style={styles.moneyInput}>
                        <Text>Rp</Text>
                        <TextInput 
                            style={{ flex: 1 }} keyboardType="numeric" placeholder="0" 
                            value={item.todayCost} onChangeText={t => updateWorkItem(item.id, 'todayCost', t)} 
                        />
                    </View>
                </View>
            ))}
        </Section>

        <Button title="KIRIM LAPORAN" onPress={handleSubmit} variant="primary" size="large" icon={Save} loading={loading} fullWidth style={{ marginTop: 10 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  infoCard: { marginBottom: 20 },
  projName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  projDate: { color: '#64748B' },

  uploadBox: { height: 180, backgroundColor: '#F1F5F9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 6 },
  choiceBtn: { flexDirection: 'row', padding: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', gap: 6 },
  choiceBtnActive: { backgroundColor: '#312e59', borderColor: '#312e59' },
  choiceText: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  
  checkBox: { flexDirection: 'row', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#94A3B8', alignItems: 'center', gap: 8, marginBottom: 8 },

  cardItem: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  moneyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 48, gap: 8 },
});
