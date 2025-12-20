import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ChevronLeft, Plus, Package, Clock, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';

const REQUESTS = [
  { id: '1', item: 'Semen Tiga Roda', qty: '50 Sak', status: 'Pending', date: 'Hari Ini' },
  { id: '2', item: 'Besi Beton 10mm', qty: '200 Bt', status: 'Approved', date: 'Kemarin' },
];

export default function MaterialsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Material Request</Text>
      </View>

      <View style={styles.banner}>
        <Package color="rgba(255,255,255,0.2)" size={100} style={{ position: 'absolute', right: -20, bottom: -20 }} />
        <Text style={styles.bannerTitle}>Butuh Material?</Text>
        <Text style={styles.bannerText}>Ajukan permintaan barang langsung ke gudang pusat.</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { /* Nanti buat form */ }}>
          <Plus color="#312e59" size={20} />
          <Text style={styles.addBtnText}>Buat Request Baru</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Riwayat Permintaan</Text>
      
      <FlatList 
        data={REQUESTS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Package color="#312e59" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.item}</Text>
              <View style={styles.row}>
                <Text style={styles.qty}>{item.qty}</Text>
                <Text style={styles.date}>• {item.date}</Text>
              </View>
            </View>
            <View style={[styles.status, item.status === 'Approved' ? styles.stApprove : styles.stPending]}>
              {item.status === 'Approved' ? <CheckCircle2 size={12} color="#166534" /> : <Clock size={12} color="#B45309" />}
              <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#166534' : '#B45309' }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#312e59', flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  
  banner: { backgroundColor: '#312e59', margin: 24, padding: 24, borderRadius: 24, marginTop: -20, overflow: 'hidden' },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 20, maxWidth: '70%' },
  addBtn: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
  addBtnText: { color: '#312e59', fontWeight: 'bold', fontSize: 14 },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginLeft: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  iconBox: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  qty: { fontSize: 12, fontWeight: 'bold', color: '#475569', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  date: { fontSize: 12, color: '#94A3B8' },
  
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  stPending: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
  stApprove: { backgroundColor: '#DCFCE7', borderColor: '#DCFCE7' },
  statusText: { fontSize: 10, fontWeight: 'bold' }
});