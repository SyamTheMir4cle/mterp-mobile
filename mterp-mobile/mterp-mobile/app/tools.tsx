import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { ChevronLeft, Search, Wrench, MapPin, Warehouse, Building2 } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../src/api';

export default function ToolsDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'warehouse' | 'deployed'>('warehouse');
  
  const [data, setData] = useState({ warehouse: [], deployed: [] });

  useEffect(() => {
    fetchDashboard();
  }, [search]); // Auto search saat ngetik

  const fetchDashboard = async () => {
    try {
      // Endpoint baru sesuai backend inventoryController.getToolDashboard
      const res = await api.get(`/inventory/dashboard?search=${search}`);
      setData(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const renderWarehouseItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: item.stok > 0 ? '#DCFCE7' : '#DBEAFE' }]}>
         <Wrench size={24} color={item.stok > 0 ? '#166534' : '#1E40AF'} />
      </View>
      <View style={{ flex: 1 }}>
         <Text style={styles.itemName}>{item.nama}</Text>
         <Text style={styles.itemSub}>Stok Tersedia: {item.stok} {item.satuan}</Text>
         <View style={styles.locRow}>
            <Warehouse size={12} color="#64748B" />
            <Text style={styles.itemLoc}>Gudang Utama</Text>
         </View>
      </View>
    </View>
  );

  const renderDeployedItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
         <Wrench size={24} color="#B45309" />
      </View>
      <View style={{ flex: 1 }}>
         <Text style={styles.itemName}>{item.toolId?.nama}</Text>
         <Text style={styles.itemSub}>Qty: {item.quantity} Unit</Text>
         <View style={styles.locRow}>
            <Building2 size={12} color="#64748B" />
            <Text style={styles.itemLoc}>{item.projectId?.nama}</Text>
         </View>
         {item.notes && <Text style={styles.notes}>"{item.notes}"</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard Alat</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
           <Search size={20} color="#94A3B8" />
           <TextInput 
             style={styles.searchInput} 
             placeholder="Cari alat..." 
             value={search} 
             onChangeText={setSearch} 
           />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'warehouse' && styles.activeTab]} 
          onPress={() => setActiveTab('warehouse')}
        >
          <Text style={[styles.tabText, activeTab === 'warehouse' && styles.activeTabText]}>Gudang ({data.warehouse.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'deployed' && styles.activeTab]} 
          onPress={() => setActiveTab('deployed')}
        >
          <Text style={[styles.tabText, activeTab === 'deployed' && styles.activeTabText]}>Di Proyek ({data.deployed.length})</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#312e59" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={activeTab === 'warehouse' ? data.warehouse : data.deployed}
          renderItem={activeTab === 'warehouse' ? renderWarehouseItem : renderDeployedItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop:50, color:'#94A3B8'}}>Tidak ada data.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 50, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  searchContainer: { padding: 24, paddingBottom: 0 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  
  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 16, gap: 16 },
  tab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#312e59' },
  tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: '#312e59' },

  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginVertical: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemLoc: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  notes: { fontSize: 11, color: '#F59E0B', marginTop: 4, fontStyle: 'italic' }
});