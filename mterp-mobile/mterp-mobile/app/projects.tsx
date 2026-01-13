import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator, ScrollView, RefreshControl, Alert } from 'react-native';
import { ChevronLeft, Plus, MapPin, TrendingUp, Calendar, CheckCircle2, MoreVertical, X, Briefcase, BarChart3, AlertCircle, Trash2 } from 'lucide-react-native';

import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api';
import CustomAlert from '../components/CustomAlert';

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
    if (item.progress === 100) { statusColor = '#10B981'; statusBg = '#D1FAE5'; } // Green
    else if (item.status === 'Planning') { statusColor = '#F59E0B'; statusBg = '#FEF3C7'; } // Orange

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => {
          // Navigate to Detail Screen
          router.push({ pathname: '/project-detail', params: { project: JSON.stringify(item) } } as any);
        }}
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
          {/* Tombol Delete (Hanya Owner) atau Titik Tiga (User Lain) */}
          {userRole === 'owner' ? (
            <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4 }}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 20 }} /> // Placeholder kosong biar rapi
          )}
        </View>

        {/* Progress Bar Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressTitle}>Project Progress</Text>
            <Text style={[styles.progressVal, { color: statusColor }]}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: statusColor }]} />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.status || 'On Going'}</Text>
          </View>
          {/* Tombol Khusus Supervisor */}
          {['supervisor', 'admin_project'].includes(userRole) && (
            <TouchableOpacity style={styles.updateBtn} onPress={() => openUpdateModal(item)}>
              <Text style={styles.updateBtnText}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAlert visible={alert.visible} type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ ...alert, visible: false })} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Daftar Proyek</Text>
          <Text style={styles.headerSub}>{projects.length} Proyek Aktif</Text>
        </View>
      </View>

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
            <View style={styles.emptyState}>
              <Briefcase size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Belum ada proyek terdaftar</Text>
            </View>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 50, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  headerSub: { fontSize: 12, color: '#64748B' },

  summaryCard: { margin: 24, marginBottom: 0, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  sumLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 },
  sumValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  chartIcon: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },

  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  projName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  projLoc: { fontSize: 12, color: '#64748B' },

  progressSection: { marginBottom: 16 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  progressVal: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
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

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', marginTop: 10 }
});