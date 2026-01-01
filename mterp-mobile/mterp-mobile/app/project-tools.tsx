import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Plus, History, Tag, ArrowLeftRight, X, Briefcase } from 'lucide-react-native';
import api from '../src/api';
import CustomAlert from '../components/CustomAlert';

export default function ProjectToolsScreen() {
  const params = useLocalSearchParams();
  const { projectId, projectName } = params; // Dikirim dari Project Detail

  const [loading, setLoading] = useState(true);
  const [projectTools, setProjectTools] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [warehouseTools, setWarehouseTools] = useState([]); // Untuk Modal Assign
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | history

  // Modals
  const [modalAssignVisible, setModalAssignVisible] = useState(false);
  const [modalTagVisible, setModalTagVisible] = useState(false);
  const [modalReturnVisible, setModalReturnVisible] = useState(false);

  // Forms State
  const [selectedTool, setSelectedTool] = useState<any>(null); // Tool object
  const [formQty, setFormQty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formWorker, setFormWorker] = useState('');
  const [formWorkItem, setFormWorkItem] = useState('');

  const [alert, setAlert] = useState({ visible: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/inventory/project/${projectId}`);
      setProjectTools(res.data.currentInventory);
      setUsageHistory(res.data.usageHistory);
    } catch (e) {
      console.log('Error fetching project tools:', e);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Buka Modal Assign (Ambil dari Gudang)
  const openAssignModal = async () => {
    try {
      const res = await api.get('/inventory?kategori=alat'); // Ambil list alat gudang
      setWarehouseTools(res.data);
      setModalAssignVisible(true);
    } catch (e) { Alert.alert('Error', 'Gagal memuat data gudang'); }
  };

  const handleAssign = async () => {
    if (!selectedTool || !formQty) return;
    try {
      await api.post('/inventory/assign', {
        projectId,
        toolId: selectedTool._id,
        quantity: parseInt(formQty),
        notes: formNotes
      });
      setAlert({ visible: true, type: 'success', title: 'Berhasil', message: 'Alat ditambahkan ke proyek' });
      setModalAssignVisible(false);
      resetForms();
      fetchProjectData();
    } catch (e: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: e.response?.data?.msg || 'Error' });
    }
  };

  // 2. Tag Penggunaan Harian
  const handleTagUsage = async () => {
    if (!selectedTool || !formWorker || !formWorkItem) return;
    try {
      await api.post('/inventory/usage', {
        projectToolId: selectedTool._id, // Ini ID dari projectTool, bukan master tool
        usedByWorker: formWorker,
        workItem: formWorkItem,
        notes: formNotes
      });
      setAlert({ visible: true, type: 'success', title: 'Tercatat', message: 'Penggunaan alat berhasil dicatat' });
      setModalTagVisible(false);
      resetForms();
      fetchProjectData();
    } catch (e: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: e.response?.data?.msg || 'Error' });
    }
  };

  // 3. Kembalikan ke Gudang
  const handleReturn = async () => {
    if (!selectedTool || !formQty) return;
    try {
      await api.post('/inventory/return-warehouse', {
        projectToolId: selectedTool._id,
        quantity: parseInt(formQty)
      });
      setAlert({ visible: true, type: 'success', title: 'Dikembalikan', message: 'Alat dikembalikan ke Gudang Utama' });
      setModalReturnVisible(false);
      resetForms();
      fetchProjectData();
    } catch (e: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: e.response?.data?.msg || 'Error' });
    }
  };

  const resetForms = () => {
    setSelectedTool(null); setFormQty(''); setFormNotes(''); setFormWorker(''); setFormWorkItem('');
  };

  // --- RENDERS ---

  const renderToolItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Briefcase size={24} color="#312e59" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.toolId?.nama}</Text>
          <Text style={styles.cardSub}>Stok di Proyek: {item.quantity} Unit</Text>
          {item.notes && <Text style={styles.notes}>Note: {item.notes}</Text>}
        </View>
      </View>
      
      {/* Action Buttons for each tool */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#DBEAFE' }]} onPress={() => { setSelectedTool(item); setModalTagVisible(true); }}>
          <Tag size={14} color="#1E40AF" />
          <Text style={[styles.miniBtnText, { color: '#1E40AF' }]}>Tag Pakai</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => { setSelectedTool(item); setModalReturnVisible(true); }}>
          <ArrowLeftRight size={14} color="#991B1B" />
          <Text style={[styles.miniBtnText, { color: '#991B1B' }]}>Kembalikan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: any) => (
    <View style={styles.historyCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.historyUser}>{item.usedByWorker}</Text>
      </View>
      <Text style={styles.historyTool}>{item.projectToolId?.toolId?.nama}</Text>
      <Text style={styles.historyWork}>Untuk: {item.workItem}</Text>
      {item.notes && <Text style={styles.notes}>"{item.notes}"</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomAlert visible={alert.visible} type={alert.type as any} title={alert.title} message={alert.message} onClose={() => setAlert({...alert, visible: false})} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ChevronLeft color="#1E293B" size={24} /></TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Alat Proyek</Text>
          <Text style={styles.headerSub}>{projectName}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'inventory' && styles.activeTab]} onPress={() => setActiveTab('inventory')}>
          <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>Inventaris ({projectTools.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.activeTab]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Riwayat Pakai</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#312e59" style={{marginTop: 50}} /> : (
        <FlatList
          data={activeTab === 'inventory' ? projectTools : usageHistory}
          renderItem={activeTab === 'inventory' ? renderToolItem : renderHistoryItem}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={<Text style={{textAlign:'center', color:'#94A3B8', marginTop: 20}}>Data kosong.</Text>}
        />
      )}

      {/* FAB Assign Tool */}
      {activeTab === 'inventory' && (
        <TouchableOpacity style={styles.fab} onPress={openAssignModal}>
          <Plus color="#fff" size={28} />
        </TouchableOpacity>
      )}

      {/* --- MODAL ASSIGN (GUDANG -> PROYEK) --- */}
      <Modal visible={modalAssignVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ambil Alat dari Gudang</Text>
            
            <Text style={styles.label}>Pilih Alat:</Text>
            <View style={{maxHeight: 150, marginBottom: 10}}>
              <FlatList 
                data={warehouseTools}
                nestedScrollEnabled
                renderItem={({item}: any) => (
                  <TouchableOpacity 
                    style={[styles.selectItem, selectedTool?._id === item._id && styles.selectedItem]} 
                    onPress={() => setSelectedTool(item)}
                  >
                    <Text style={{flex: 1}}>{item.nama}</Text>
                    <Text style={{fontSize: 12, color: '#64748B'}}>Sisa: {item.stok}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <Text style={styles.label}>Jumlah:</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formQty} onChangeText={setFormQty} placeholder="0" />
            
            <Text style={styles.label}>Catatan (Opsional):</Text>
            <TextInput style={styles.input} value={formNotes} onChangeText={setFormNotes} placeholder="Kondisi alat, dll" />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalAssignVisible(false)}><Text>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleAssign}><Text style={{color:'#fff'}}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL TAG USAGE (HARIAN) --- */}
      <Modal visible={modalTagVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tag Penggunaan Alat</Text>
            <Text style={{marginBottom: 16, color: '#312e59', fontWeight: 'bold'}}>{selectedTool?.toolId?.nama}</Text>

            <Text style={styles.label}>Dipakai Oleh (Nama Pekerja):</Text>
            <TextInput style={styles.input} value={formWorker} onChangeText={setFormWorker} placeholder="Contoh: Pak Budi" />

            <Text style={styles.label}>Untuk Pekerjaan (Item Kerja):</Text>
            <TextInput style={styles.input} value={formWorkItem} onChangeText={setFormWorkItem} placeholder="Contoh: Pasang Plafon" />

            <Text style={styles.label}>Catatan Harian:</Text>
            <TextInput style={styles.input} value={formNotes} onChangeText={setFormNotes} placeholder="..." />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalTagVisible(false)}><Text>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleTagUsage}><Text style={{color:'#fff'}}>Tag</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL RETURN (PROYEK -> GUDANG) --- */}
      <Modal visible={modalReturnVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kembalikan ke Gudang</Text>
            <Text style={{marginBottom: 16}}>Mengembalikan {selectedTool?.toolId?.nama} ke stok utama.</Text>

            <Text style={styles.label}>Jumlah Dikembalikan:</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formQty} onChangeText={setFormQty} placeholder="Max sesuai stok proyek" />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalReturnVisible(false)}><Text>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, {backgroundColor: '#EF4444'}]} onPress={handleReturn}><Text style={{color:'#fff'}}>Kembalikan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 50, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  headerSub: { fontSize: 12, color: '#64748B' },
  
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 24 },
  tab: { marginRight: 20, paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#312e59' },
  tabText: { color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: '#312e59' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBox: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  notes: { fontSize: 12, fontStyle: 'italic', color: '#F59E0B', marginTop: 4 },
  
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8, justifyContent: 'flex-end' },
  miniBtn: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center', gap: 4 },
  miniBtnText: { fontSize: 12, fontWeight: 'bold' },

  historyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#312e59' },
  historyDate: { fontSize: 12, color: '#94A3B8' },
  historyUser: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  historyTool: { fontSize: 14, fontWeight: 'bold', color: '#312e59', marginTop: 4 },
  historyWork: { fontSize: 13, color: '#475569' },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#312e59', justifyContent: 'center', alignItems: 'center', elevation: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1E293B' },
  label: { fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 14 },
  
  selectItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row' },
  selectedItem: { backgroundColor: '#F0F9FF' },

  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  btnCancel: { padding: 10 },
  btnSave: { backgroundColor: '#312e59', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});