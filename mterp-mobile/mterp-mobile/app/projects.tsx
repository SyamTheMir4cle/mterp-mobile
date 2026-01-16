import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator, ScrollView, RefreshControl, Alert } from 'react-native';
import { Plus, MapPin, TrendingUp, MoreVertical, X, Briefcase, BarChart3, Trash2 } from 'lucide-react-native';

import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api';
import CustomAlert from '../components/CustomAlert';
import { Header, Card, Badge, ProgressBar, IconButton, EmptyState, Input, Button } from '../components/shared';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  // Modal States
  const [modalVisible, setModalVisible] = useState(false); // Untuk Tambah Proyek
  const [progressModal, setProgressModal] = useState(false); // Untuk Update Progres
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Form Data
  const [newProject, setNewProject] = useState({ nama: '', lokasi: '', budget: '', startDate: '', endDate: '' });
  const [progressInput, setProgressInput] = useState('');

  const [alert, setAlert] = useState({ visible: false, type: 'success' as any, title: '', message: '' });

  useEffect(() => {
    getUserRole();
    fetchProjects();
  }, []);

  const getUserRole = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setUserRole(JSON.parse(data).role);
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  // --- FUNGSI 1: TAMBAH PROYEK (OWNER ONLY) ---
  const handleAddProject = async () => {
    if (!newProject.nama || !newProject.lokasi) {
      setAlert({ visible: true, type: 'error', title: 'Error', message: 'Nama dan Lokasi wajib diisi.' });
      return;
    }

    try {
      await api.post('/projects', {
        ...newProject,
        status: 'Planning'
      });
      setModalVisible(false);
      setNewProject({ nama: '', lokasi: '', budget: '', startDate: '', endDate: '' }); // Reset form
      fetchProjects();
      setAlert({ visible: true, type: 'success', title: 'Berhasil', message: 'Proyek baru telah didaftarkan.' });
    } catch (error: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: error.response?.data?.msg || 'Gagal tambah proyek' });
    }
  };

  // --- FUNGSI 2: UPDATE PROGRES (SUPERVISOR ONLY) ---
  const openUpdateModal = (project: any) => {
    setSelectedProject(project);
    setProgressInput(project.progress.toString());
    setProgressModal(true);
  };

  const handleUpdateProgress = async () => {
    const nilai = parseInt(progressInput);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      setAlert({ visible: true, type: 'error', title: 'Invalid', message: 'Masukkan angka 0 - 100.' });
      return;
    }

    try {
      await api.put(`/projects/${selectedProject._id}/progress`, {
        progress: nilai
      });
      setProgressModal(false);
      fetchProjects();
      setAlert({ visible: true, type: 'success', title: 'Updated', message: `Progres ${selectedProject.nama} diperbarui ke ${nilai}%` });
    } catch (error: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: 'Gagal update progres' });
    }
  };

  const handleDelete = (project: any) => {
    Alert.alert(
      "Hapus Proyek?",
      `Anda yakin ingin menghapus proyek "${project.nama}"? Data yang dihapus tidak bisa dikembalikan.`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/projects/${project._id}`);
              setAlert({ visible: true, type: 'success', title: 'Terhapus', message: 'Proyek berhasil dihapus.' });
              fetchProjects(); // Refresh list
            } catch (error: any) {
              setAlert({ visible: true, type: 'error', title: 'Gagal', message: error.response?.data?.msg || 'Gagal menghapus proyek' });
            }
          }
        }
      ]
    );
  };

  // --- RENDER ITEM ---
  const renderProject = ({ item }: { item: any }) => {
    // Hitung warna status
    let statusColor = '#3B82F6'; // Blue default
    let statusBg = '#DBEAFE';
    let statusVariant: any = 'primary';
    
    if (item.progress === 100) { 
      statusColor = '#10B981'; 
      statusBg = '#D1FAE5'; 
      statusVariant = 'success';
    } else if (item.status === 'Planning') { 
      statusColor = '#F59E0B'; 
      statusBg = '#FEF3C7'; 
      statusVariant = 'warning';
    }

    return (
      <Card 
        style={{ marginBottom: 16 }} 
        onPress={() => router.push({ pathname: '/project-detail', params: { project: JSON.stringify(item) } } as any)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: statusBg }]}>
            <Briefcase size={24} color={statusColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.projName}>{item.nama}</Text>
            <View style={styles.locRow}>
              <MapPin size={12} color="#64748B" />
              <Text style={styles.projLoc}>{item.lokasi}</Text>
            </View>
          </View>
          {/* Delete Button (Owner Only) */}
          {userRole === 'owner' && (
            <IconButton
              icon={Trash2}
              onPress={() => handleDelete(item)}
              size={20}
              color="#EF4444"
              backgroundColor="#FEE2E2"
              variant="ghost"
            />
          )}
        </View>

        {/* Progress Bar */}
        <ProgressBar
          progress={item.progress}
          label="Project Progress"
          showLabel={true}
          color={statusColor}
          style={{ marginBottom: 16 }}
        />

        <View style={styles.cardFooter}>
          <Badge 
            label={item.status || 'On Going'} 
            variant={statusVariant}
            size="small"
          />
          {/* Update Button (Supervisor Only) */}
          {['supervisor', 'admin_project'].includes(userRole) && (
            <TouchableOpacity style={styles.updateBtn} onPress={() => openUpdateModal(item)}>
              <Text style={styles.updateBtnText}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAlert visible={alert.visible} type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ ...alert, visible: false })} />

      {/* HEADER */}
      <Header 
        title="Daftar Proyek" 
        subtitle={`${projects.length} Proyek Aktif`}
      />

      {/* DASHBOARD RINGKASAN (Untuk Direktur/Owner) */}
      {['director', 'owner'].includes(userRole) && (
        <LinearGradient colors={['#312e59', '#514d8a']} style={styles.summaryCard}>
          <View>
            <Text style={styles.sumLabel}>Total Progress Nasional</Text>
            <Text style={styles.sumValue}>
              {projects.length > 0 
                ? Math.round(projects.reduce((acc: any, cur: any) => acc + (cur.progress || 0), 0) / projects.length) 
                : 0}%
            </Text>
          </View>
          <View style={styles.chartIcon}>
            <BarChart3 color="white" size={32} />
          </View>
        </LinearGradient>
      )}

      {/* LIST PROYEK */}
      {loading ? (
        <ActivityIndicator size="large" color="#312e59" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon={Briefcase}
              title="Belum ada proyek terdaftar"
              description="Mulai dengan membuat proyek pertama Anda"
            />
          }
        />
      )}

      {/* FAB ADD (HANYA OWNER) */}
      {userRole === 'owner' && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-project' as any)}>
          <Plus color="white" size={28} />
        </TouchableOpacity>
      )}

      {/* MODAL 2: UPDATE PROGRES */}
      <Modal visible={progressModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Progres</Text>
              <TouchableOpacity onPress={() => setProgressModal(false)}>
                <X color="#94A3B8" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressInputContainer}>
              <TrendingUp size={24} color="#312e59" style={{ marginRight: 10 }} />
              <TextInput 
                style={styles.progressBigInput} 
                value={progressInput} 
                onChangeText={setProgressInput}
                keyboardType="number-pad" 
                maxLength={3}
              />
              <Text style={styles.percentText}>%</Text>
            </View>
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginBottom: 20 }}>
              Masukkan persentase penyelesaian terbaru untuk {selectedProject?.nama}
            </Text>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProgress}>
              <Text style={styles.saveBtnText}>Update Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  summaryCard: { margin: 24, marginBottom: 0, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  sumLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 },
  sumValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  chartIcon: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },

  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  projName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  projLoc: { fontSize: 12, color: '#64748B' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
  updateBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  updateBtnText: { fontSize: 12, color: '#312e59', fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: '#312e59', justifyContent: 'center', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B' },
  
  saveBtn: { backgroundColor: '#312e59', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Progress Input
  progressInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  progressBigInput: { fontSize: 48, fontWeight: 'bold', color: '#312e59', textAlign: 'center', minWidth: 100, borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  percentText: { fontSize: 24, color: '#94A3B8', fontWeight: 'bold', marginLeft: 10 },
});