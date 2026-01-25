import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { UploadCloud, Plus, Trash2, Save, ArrowRight, ArrowLeft, Calendar } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import api from '../src/api';
import { Header, Input, Section, Button } from '../components/shared';
import { ProjectData, WorkItem, ProjectSupply } from '../src/types';

// Steps
const STEPS = ['Basic & Docs', 'Supply Plan', 'Schedule', 'Resources'];

export default function AddProjectScreen() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- STATE ---
  
  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: '', location: '', description: '', totalBudget: '',
    startDate: new Date().toISOString().split('T')[0], 
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  });
  
  // Documents
  const [docs, setDocs] = useState<{ [key: string]: any }>({
    shopDrawing: null, hse: null, manPowerList: null, 
    workItemsList: null, materialList: null, toolsList: null
  });

  // 2. Supply Planning
  const [supplies, setSupplies] = useState<ProjectSupply[]>([]);

  // 3. Work Items (Schedule)
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  // 4. Resources Notes (Temporary strings for demo)
  const [resourceNotes, setResourceNotes] = useState<{[key:number]: {mat:string, man:string, tool:string}}>({});

  // --- CALCULATIONS ---
  const calculateTotalSupplyCost = () => supplies.reduce((acc, item) => acc + (item.cost || 0), 0);
  
  const budgetNum = parseFloat(basicInfo.totalBudget) || 0;

  // Update Work Item Weights
  useEffect(() => {
    if (budgetNum > 0) {
      setWorkItems(prev => prev.map(item => ({
        ...item,
        weight: parseFloat(((item.cost / budgetNum) * 100).toFixed(2))
      })));
    }
  }, [basicInfo.totalBudget, workItems.map(i => i.cost).join(',')]);


  // --- HANDLERS ---

  const pickDocument = async (key: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.assets) setDocs(prev => ({ ...prev, [key]: res.assets![0] }));
    } catch (e) {
      console.log('Doc error', e); 
    }
  };

  const updateResourceNote = (id: number, type: 'mat'|'man'|'tool', val: string) => {
      setResourceNotes(prev => ({
          ...prev,
          [id]: { ...(prev[id] || {mat:'', man:'', tool:''}), [type]: val }
      }));
  };

  // Supply Handlers
  const addSupply = () => {
    setSupplies([...supplies, {
      id: Date.now().toString(), item: '', cost: 0, staffAssigned: '', deadline: '', status: 'Pending'
    }]);
  };
  const updateSupply = (id: string, field: keyof ProjectSupply, val: any) => {
    setSupplies(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  // Work Item Handlers
  const addWorkItem = () => {
    setWorkItems([...workItems, {
      id: Date.now(),
      name: '', qty: 0, volume: '', cost: 0, weight: 0,
      logic: 'Flexible',
      dates: { 
        plannedStart: basicInfo.startDate, 
        plannedEnd: basicInfo.endDate 
      },
      resources: [],
      actuals: { progressPercent: 0, costUsed: 0, resourcesUsed: [] }
    }]);
  };
  const updateWorkItem = (id: number, field: keyof WorkItem, val: any) => {
    setWorkItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  // Submit
  const handleSubmit = async () => {
     if (!basicInfo.name || !budgetNum) {
         Alert.alert('Error', 'Nama Proyek dan Budget wajib diisi');
         return;
     }

     setLoading(true);
     try {
         const formData = new FormData();
         
         const projectData: Partial<ProjectData> = {
             name: basicInfo.name,
             location: basicInfo.location,
             description: basicInfo.description,
             totalBudget: budgetNum,
             globalDates: {
                 planned: { 
                     start: basicInfo.startDate, 
                     end: basicInfo.endDate 
                 },
                 actual: { start: '', end: '' }
             },
             supplies,
             workItems: workItems.map(w => ({
                 ...w,
                 // Attach resource notes to item if needed, for now just basic
             }))
         };

         formData.append('data', JSON.stringify(projectData));

         Object.keys(docs).forEach(key => {
             if (docs[key]) {
                 formData.append(key, {
                     uri: docs[key].uri,
                     name: docs[key].name,
                     type: docs[key].mimeType || 'application/octet-stream'
                 } as any);
             }
         });

         await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
         
         Alert.alert('Sukses', 'Proyek berhasil dibuat!', [{ text: 'OK', onPress: () => router.back() }]);

     } catch (e: any) {
         console.error(e);
         Alert.alert('Gagal', 'Terjadi kesalahan');
     } finally {
         setLoading(false);
     }
  };


  // --- RENDER STEPS ---

  const renderStepIcon = (idx: number, icon: any) => {
      const isActive = currentStep === idx;
      const isDone = currentStep > idx;
      return (
          <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[
                styles.stepCircle, 
                isActive && styles.stepActive, 
                isDone && styles.stepDone 
            ]}>
                <Text style={[styles.stepNum, (isActive || isDone) && { color: '#fff' }]}>{idx + 1}</Text>
            </View>
            <Text style={[styles.stepText, isActive && { color: '#312e59', fontWeight: 'bold' }]}>{STEPS[idx]}</Text>
          </View>
      );
  };

  const renderBasicInfo = () => (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Section title="Informasi Dasar">
            <Input label="Nama Proyek" value={basicInfo.name} onChangeText={t => setBasicInfo({...basicInfo, name: t})} placeholder="Nama Proyek" />
            <Input label="Lokasi" value={basicInfo.location} onChangeText={t => setBasicInfo({...basicInfo, location: t})} placeholder="Lokasi Proyek" />
            <Input label="Deskripsi" value={basicInfo.description} onChangeText={t => setBasicInfo({...basicInfo, description: t})} placeholder="Deskripsi Singkat" />
            
            <Text style={styles.label}>Total Budget (Rv)</Text>
            <View style={styles.moneyInput}>
                <Text style={{ fontWeight: 'bold', color: '#312e59' }}>Rp</Text>
                <TextInput 
                    style={{ flex: 1, fontWeight: 'bold', fontSize: 16 }} 
                    keyboardType="numeric" 
                    value={basicInfo.totalBudget} 
                    onChangeText={t => setBasicInfo({...basicInfo, totalBudget: t})} 
                    placeholder="0"
                />
            </View>

            <Text style={styles.label}>Planned Global Dates (YYYY-MM-DD)</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <Input 
                    style={{ flex: 1 }} icon={Calendar} 
                    value={basicInfo.startDate} onChangeText={t => setBasicInfo({...basicInfo, startDate: t})} 
                    placeholder="Start Date" 
                />
                <Input 
                    style={{ flex: 1 }} icon={Calendar} 
                    value={basicInfo.endDate} onChangeText={t => setBasicInfo({...basicInfo, endDate: t})} 
                    placeholder="End Date" 
                />
            </View>
        </Section>
        
        <Section title="Dokumen (Wajib Upload)">
            {['shopDrawing', 'hse', 'manPowerList', 'workItemsList', 'materialList', 'toolsList'].map(key => (
                 <View key={key} style={styles.docRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.docLabel}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
                        {docs[key] && <Text style={styles.fileName}>📎 {docs[key].name}</Text>}
                    </View>
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(key)}>
                        <UploadCloud size={16} color="#312e59" />
                        <Text style={styles.uploadText}>Upload</Text>
                    </TouchableOpacity>
                 </View>
            ))}
        </Section>
      </ScrollView>
  );

  const renderSupply = () => (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Section title="Perencanaan Supply Material" actionLabel="Tambah" onAction={addSupply} actionIcon={Plus}>
            {supplies.map(s => (
                <View key={s.id} style={styles.cardItem}>
                    <Input placeholder="Nama Item Material" value={s.item} onChangeText={t => updateSupply(s.id, 'item', t)} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={[styles.moneyInput, { flex: 1, marginBottom: 12 }]}>
                            <Text>Rp</Text>
                            <TextInput 
                                style={{ flex: 1 }} keyboardType="numeric" placeholder="Cost" 
                                value={s.cost.toString()} 
                                onChangeText={t => updateSupply(s.id, 'cost', parseFloat(t) || 0)} 
                            />
                        </View>
                        <Input style={{ flex: 1 }} placeholder="Staff Assigned" value={s.staffAssigned} onChangeText={t => updateSupply(s.id, 'staffAssigned', t)} />
                    </View>
                    <Input placeholder="Deadline (YYYY-MM-DD)" value={s.deadline} onChangeText={t => updateSupply(s.id, 'deadline', t)} />
                    <TouchableOpacity onPress={() => setSupplies(supplies.filter(x => x.id !== s.id))} style={styles.delBtn}>
                         <Trash2 size={16} color="red" />
                    </TouchableOpacity>
                </View>
            ))}
            <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Supply Cost: Rp {calculateTotalSupplyCost().toLocaleString()}</Text>
        </Section>
      </ScrollView>
  );

  const renderSchedule = () => (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Section title="Jadwal Konstruksi (Work Items)" actionLabel="Tambah Item" onAction={addWorkItem} actionIcon={Plus}>
            {workItems.map((item, idx) => (
                <View key={item.id} style={styles.cardItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Item #{idx + 1}</Text>
                        <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: 'bold' }}>Weight: {item.weight}%</Text>
                    </View>
                    
                    <Input placeholder="Nama Pekerjaan" value={item.name} onChangeText={t => updateWorkItem(item.id, 'name', t)} />
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Input style={{ flex: 1 }} placeholder="Qty" type="number" value={item.qty.toString()} onChangeText={t => updateWorkItem(item.id, 'qty', parseFloat(t))} />
                        <Input style={{ flex: 1 }} placeholder="Satuan (m3)" value={item.volume} onChangeText={t => updateWorkItem(item.id, 'volume', t)} />
                    </View>

                    <Text style={styles.label}>Biaya Item (Rp)</Text>
                    <View style={[styles.moneyInput, { marginBottom: 12 }]}>
                        <Text>Rp</Text>
                        <TextInput 
                            style={{ flex: 1 }} keyboardType="numeric" value={item.cost.toString()} 
                            onChangeText={t => updateWorkItem(item.id, 'cost', parseFloat(t) || 0)} 
                        />
                    </View>

                    <Text style={styles.label}>Dates & Logic</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        <Input 
                            style={{ flex: 1 }} value={item.dates.plannedStart} 
                            onChangeText={t => {
                                const newDates = {...item.dates, plannedStart: t};
                                updateWorkItem(item.id, 'dates', newDates);
                            }}
                            placeholder="Start YYYY-MM-DD"
                        />
                        <Input 
                            style={{ flex: 1 }} value={item.dates.plannedEnd} 
                            onChangeText={t => {
                                const newDates = {...item.dates, plannedEnd: t};
                                updateWorkItem(item.id, 'dates', newDates);
                            }}
                            placeholder="End YYYY-MM-DD"
                        />
                    </View>

                    {/* Simple Logic Select */}
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        {['Flexible', 'Semi-flexible', 'Inflexible'].map(l => (
                            <TouchableOpacity 
                                key={l} 
                                onPress={() => updateWorkItem(item.id, 'logic', l)}
                                style={[styles.logicBtn, item.logic === l && styles.logicBtnActive]}
                            >
                                <Text style={[styles.logicText, item.logic === l && { color: '#fff' }]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity onPress={() => setWorkItems(workItems.filter(x => x.id !== item.id))} style={styles.delBtn}>
                         <Trash2 size={16} color="red" />
                    </TouchableOpacity>
                </View>
            ))}
        </Section>
      </ScrollView>
  );

  const renderResources = () => (
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ marginBottom: 16, color: '#64748B' }}>Allocated Resources per Item (Optional for now)</Text>
        {workItems.map(item => (
            <View key={item.id} style={styles.cardItem}>
                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Alokasi SDA: Material, Manpower, Alat</Text>
                
                <Input 
                    placeholder="List Material..." multiline numberOfLines={2} 
                    value={(resourceNotes[item.id] || {}).mat || ''} 
                    onChangeText={t => updateResourceNote(item.id, 'mat', t)}
                />
                <Input 
                    placeholder="List Manpower..." multiline numberOfLines={2} 
                    value={(resourceNotes[item.id] || {}).man || ''} 
                    onChangeText={t => updateResourceNote(item.id, 'man', t)}
                />
                <Input 
                    placeholder="List Alat..." multiline numberOfLines={2} 
                    value={(resourceNotes[item.id] || {}).tool || ''} 
                    onChangeText={t => updateResourceNote(item.id, 'tool', t)}
                />
            </View>
        ))}
      </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header title="Buat Proyek Baru" />
      
      {/* Wizard Header */}
      <View style={styles.wizardHeader}>
        {STEPS.map((_, idx) => renderStepIcon(idx, null))}
      </View>

      <View style={styles.content}>
        {currentStep === 0 && renderBasicInfo()}
        {currentStep === 1 && renderSupply()}
        {currentStep === 2 && renderSchedule()}
        {currentStep === 3 && renderResources()}
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {currentStep > 0 && (
            <Button title="Back" onPress={() => setCurrentStep(currentStep - 1)} variant="outline" style={{ flex: 1, marginRight: 8 }} icon={ArrowLeft} iconPosition="left" />
        )}
        
        {currentStep < 3 ? (
            <Button title="Next" onPress={() => setCurrentStep(currentStep + 1)} variant="primary" style={{ flex: 1 }} icon={ArrowRight} />
        ) : (
            <Button title="Save Project" onPress={handleSubmit} variant="primary" style={{ flex: 1 }} icon={Save} loading={loading} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  wizardHeader: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepActive: { backgroundColor: '#312e59' },
  stepDone: { backgroundColor: '#10B981' },
  stepNum: { fontWeight: 'bold', color: '#64748B' },
  stepText: { fontSize: 10, color: '#94A3B8' },
  
  content: { flex: 1, padding: 16 },
  footer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 6 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docLabel: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  fileName: { fontSize: 11, color: '#3B82F6' },
  uploadBtn: { flexDirection: 'row', backgroundColor: '#DBEAFE', padding: 6, borderRadius: 6, alignItems: 'center', gap: 4 },
  uploadText: { fontSize: 10, fontWeight: 'bold', color: '#1E3A8A' },

  moneyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 48, gap: 8 },
  
  cardItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  delBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
  
  logicBtn: { flex: 1, padding: 6, alignItems: 'center', borderRadius: 4, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  logicBtnActive: { backgroundColor: '#312e59', borderColor: '#312e59' },
  logicText: { fontSize: 10, color: '#64748B' }
});