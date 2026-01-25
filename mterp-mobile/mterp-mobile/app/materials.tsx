import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ChevronLeft, Plus, Package, Clock, CheckCircle2, TrendingUp, X, Filter, Briefcase } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../src/api';
import { Header, Button, Input, Section } from '../components/shared';

// Types
interface MaterialRequest {
  _id?: string;
  id?: string;
  item: string;
  qty: string;
  dateNeeded: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string; // populated user name
  approvedBy?: any;
  costEstimate?: string;
  purpose?: string;
  projectId?: any;
}

// Mock Data
const INITIAL_REQUESTS: MaterialRequest[] = [
  { id: '1', item: 'Semen Tiga Roda', qty: '50 Sak', dateNeeded: '2024-02-01', status: 'Pending', requestedBy: 'Supervisor A', costEstimate: '3.500.000' },
  { id: '2', item: 'Besi Beton 10mm', qty: '200 Bt', dateNeeded: '2024-01-20', status: 'Approved', requestedBy: 'Admin Proyek', approvedBy: 'Ops. Director', costEstimate: '15.000.000' },
];

export default function MaterialsScreen() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Project Selection Modal
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // New Request Form
  const [form, setForm] = useState({ item: '', qty: '', dateNeeded: '', costEstimate: '', purpose: '', projectId: '' });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, projRes] = await Promise.all([
        api.get('/requests'), // Assuming this endpoint exists or will be created/used
        api.get('/projects')
      ]);
      // If endpoint doesn't return requests yet, we might rely on mock or handle error
      setRequests(reqRes.data);
      setProjects(projRes.data);
    } catch (e) {
      console.log('Error fetching data', e);
      // Fallback to mock if API fails (or for dev)
      if (requests.length === 0) setRequests(INITIAL_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
      if (!form.item || !form.qty || !form.projectId) {
        Alert.alert('Error', 'Mohon lengkapi data wajib (Item, Qty, Project)');
        return;
      }
      
      try {
        const payload = {
          ...form,
          jenis: 'material'
        };
        
        const res = await api.post('/requests', payload);
        
        setRequests([res.data, ...requests]);
        setModalVisible(false);
        setForm({ item: '', qty: '', dateNeeded: '', costEstimate: '', purpose: '', projectId: '' });
        setSelectedProjectName('');
        Alert.alert('Sukses', 'Permintaan material dikirim ke Direktur untuk persetujuan.');
      } catch (e: any) {
        Alert.alert('Error', e.response?.data?.error || 'Gagal membuat request');
      }
  };

  const selectProject = (proj: any) => {
    setForm({ ...form, projectId: proj._id });
    setSelectedProjectName(proj.nama);
    setProjectModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Material Request" />

      {/* Stats Banner */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Supply Chain</Text>
            <Text style={styles.bannerText}>Request material for planning approval.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View>
                    <Text style={styles.statVal}>{requests.filter(r => r.status === 'Pending').length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View>
                    <Text style={styles.statVal}>{requests.filter(r => r.status === 'Approved').length}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                </View>
            </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color="#312e59" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 }}>
              <Text style={styles.sectionTitle}>RIWAYAT PERMINTAAN</Text>
              <Filter size={16} color="#94A3B8" />
          </View>
          
          <FlatList 
            data={requests}
            keyExtractor={item => item._id || item.id || Math.random().toString()}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={[styles.statusStrip, { backgroundColor: item.status === 'Approved' ? '#10B981' : '#F59E0B' }]} />
                
                <View style={{ padding: 16, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.itemName}>{item.item}</Text>
                        <Text style={styles.cost}>Rp {item.costEstimate || '-'}</Text>
                    </View>
                    
                    <Text style={styles.qty}>{item.qty} • Butuh: {item.dateNeeded}</Text>
                    
                    <View style={styles.metaRow}>
                        <View style={styles.userBadge}>
                            <Text style={styles.userText}>{item.requestedBy}</Text>
                        </View>
                        {item.approvedBy && (
                            <View style={[styles.userBadge, { backgroundColor: '#DCFCE7' }]}>
                                <CheckCircle2 size={10} color="#166534" />
                                <Text style={[styles.userText, { color: '#166534' }]}>{item.approvedBy}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Status Badge */}
                <View style={styles.statusBadge}>
                    {item.status === 'Approved' ? <CheckCircle2 size={16} color="#10B981" /> : <Clock size={16} color="#F59E0B" />}
                </View>
              </View>
            )}
          />
      </View>

      {/* Modal Create */}
      <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Text style={styles.modalTitle}>Request Material</Text>
                      <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#64748B" /></TouchableOpacity>
                  </View>
                  
                  <ScrollView>
                      {/* Project Selector */}
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 8 }}>Proyek</Text>
                      <TouchableOpacity 
                        style={styles.projectSelector} 
                        onPress={() => setProjectModalVisible(true)}
                      >
                        <Briefcase size={16} color="#312e59" />
                        <Text style={{ color: selectedProjectName ? '#1E293B' : '#94A3B8', flex: 1 }}>
                          {selectedProjectName || 'Pilih Proyek...'}
                        </Text>
                      </TouchableOpacity>

                      <Input label="Nama Material" placeholder="Contoh: Semen..." value={form.item} onChangeText={t => setForm({...form, item: t})} />
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Input style={{ flex: 1 }} label="Jumlah" placeholder="50 Sak" value={form.qty} onChangeText={t => setForm({...form, qty: t})} />
                          <Input style={{ flex: 1 }} label="Tgl Butuh" placeholder="YYYY-MM-DD" value={form.dateNeeded} onChangeText={t => setForm({...form, dateNeeded: t})} />
                      </View>
                      <Input label="Tujuan" placeholder="Untuk pengecoran lantai 1..." value={form.purpose} onChangeText={t => setForm({...form, purpose: t})} />
                      <Input label="Estimasi Biaya (Rp)" placeholder="0" type="number" value={form.costEstimate} onChangeText={t => setForm({...form, costEstimate: t})} />
                      
                      <Button title="KIRIM REQUEST" onPress={handleCreateRequest} variant="primary" size="large" icon={Package} style={{ marginTop: 10 }} />
                  </ScrollView>
              </View>
          </View>
      </Modal>

      {/* Project Selection Modal */}
      <Modal visible={projectModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={styles.modalTitle}>Pilih Proyek</Text>
                    <TouchableOpacity onPress={() => setProjectModalVisible(false)}><X size={24} color="#64748B" /></TouchableOpacity>
                </View>
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.projectItem} onPress={() => selectProject(item)}>
                            <Briefcase size={20} color="#312e59" />
                            <View>
                                <Text style={styles.projectItemName}>{item.nama}</Text>
                                <Text style={styles.projectItemLoc}>{item.lokasi}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  banner: { backgroundColor: '#312e59', margin: 24, padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  bannerText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  addBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  
  statVal: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },

  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  statusStrip: { width: 6 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cost: { fontSize: 14, fontWeight: 'bold', color: '#312e59' },
  qty: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  
  metaRow: { flexDirection: 'row', gap: 8 },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  userText: { fontSize: 10, fontWeight: '500', color: '#475569' },
  
  statusBadge: { padding: 16, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  
  projectSelector: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, borderRadius: 12, marginBottom: 16 },
  projectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  projectItemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  projectItemLoc: { fontSize: 12, color: '#64748B' },
});