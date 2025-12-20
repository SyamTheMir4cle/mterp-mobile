import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, CheckCircle2, XCircle, MapPin, AlertCircle, User, CheckSquare } from 'lucide-react-native';
import { router } from 'expo-router';

// Data Mockup (Nanti diganti API)
const INITIAL_DATA = [
  { id: '1', requester: 'Budi Santoso', role: 'Mandor', item: 'Semen Tiga Roda', qty: '50 Sak', urgency: 'High', date: '10:30', project: 'Pondasi Zona A' },
  { id: '2', requester: 'Agus Pratama', role: 'Tukang', item: 'Besi 10mm', qty: '200 Bt', urgency: 'Normal', date: '09:15', project: 'Struktur B' },
  { id: '3', requester: 'Siti Aminah', role: 'Logistik', item: 'Sarung Tangan', qty: '5 Lusin', urgency: 'Low', date: 'Kemarin', project: 'Umum' },
];

export default function ApprovalsScreen() {
  const [approvals, setApprovals] = useState(INITIAL_DATA);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    
    // Simulasi loading network
    setTimeout(() => {
      setApprovals(prev => prev.filter(item => item.id !== id));
      setProcessing(null);
      
      if (action === 'approve') {
        Alert.alert('Sukses', 'Permintaan telah disetujui.');
      }
    }, 800);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Header Kartu: Info Pemohon */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.requester.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.requesterName}>{item.requester}</Text>
            <Text style={styles.requesterRole}>{item.role}</Text>
          </View>
        </View>
        <Text style={styles.dateTag}>{item.date}</Text>
      </View>

      {/* Body Kartu: Detail Barang */}
      <View style={styles.cardBody}>
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>{item.item}</Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>{item.qty}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.locationTag}>
            <MapPin size={12} color="#64748B" />
            <Text style={styles.locationText}>{item.project}</Text>
          </View>
          
          {item.urgency === 'High' && (
            <View style={styles.urgencyTag}>
              <AlertCircle size={10} color="#DC2626" />
              <Text style={styles.urgencyText}>HIGH PRIORITY</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer Kartu: Tombol Aksi */}
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.btnReject} 
          onPress={() => handleAction(item.id, 'reject')}
          disabled={!!processing}
        >
          {processing === item.id ? <ActivityIndicator color="#EF4444" /> : (
            <>
              <XCircle size={18} color="#EF4444" />
              <Text style={styles.textReject}>Tolak</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnApprove} 
          onPress={() => handleAction(item.id, 'approve')}
          disabled={!!processing}
        >
          {processing === item.id ? <ActivityIndicator color="#fff" /> : (
            <>
              <CheckCircle2 size={18} color="#fff" />
              <Text style={styles.textApprove}>Setujui</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Halaman */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Persetujuan</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{approvals.length}</Text>
        </View>
      </View>

      {/* Konten List */}
      <FlatList 
        data={approvals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CheckSquare size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Semua Beres!</Text>
            <Text style={styles.emptySub}>Tidak ada permintaan yang perlu disetujui.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  // Header Styles
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' 
  },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 50, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  countBadge: { backgroundColor: '#312e59', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Card Styles
  card: { 
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  
  // Card Header
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flexDirection: 'row', gap: 12 },
  avatar: { 
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', 
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
  requesterName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  requesterRole: { fontSize: 12, color: '#64748B' },
  dateTag: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', backgroundColor: '#F8F9FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  // Card Body
  cardBody: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  qtyBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  qtyText: { fontSize: 12, fontWeight: 'bold', color: '#312e59' },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#64748B' },
  urgencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  urgencyText: { fontSize: 10, fontWeight: 'bold', color: '#DC2626' },

  // Card Footer (Buttons)
  cardFooter: { flexDirection: 'row', gap: 12 },
  btnReject: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444', backgroundColor: '#fff'
  },
  textReject: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
  
  btnApprove: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, backgroundColor: '#312e59' // Warna Primary
  },
  textApprove: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#64748B', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 4 }
});