import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, Search, Wrench, Hammer, MapPin, QrCode } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../src/api';

export default function ToolsScreen() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await api.get('/inventory?kategori=alat');
      setTools(res.data);
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  const filteredTools = tools.filter((t: any) => t.nama.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }: any) => {
    const isReady = item.stok > 0;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={[styles.iconBox, { backgroundColor: isReady ? '#DCFCE7' : '#DBEAFE' }]}>
           <Wrench size={24} color={isReady ? '#166534' : '#1E40AF'} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={styles.itemName}>{item.nama}</Text>
           <Text style={styles.itemId}>ID: {item._id.slice(-6).toUpperCase()}</Text>
           <View style={styles.locRow}>
              <MapPin size={12} color="#94A3B8" />
              <Text style={styles.itemLoc}>{item.lokasi || 'Gudang Utama'}</Text>
           </View>
        </View>
        <View style={[styles.badge, { backgroundColor: isReady ? '#22C55E' : '#3B82F6' }]}>
           <Text style={styles.badgeText}>{isReady ? 'Ready' : 'Dipakai'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tool Inventory</Text>
      </View>

      {/* SEARCH */}
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

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#312e59" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filteredTools} 
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24 }}
        />
      )}

      {/* FAB SCANNER */}
      <TouchableOpacity style={styles.fab}>
         <QrCode color="white" size={28} />
      </TouchableOpacity>
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

  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemId: { fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', marginVertical: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemLoc: { fontSize: 12, color: '#64748B' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: '#312e59', justifyContent: 'center', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 }
});