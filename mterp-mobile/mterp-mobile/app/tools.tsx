import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert, RefreshControl } from 'react-native';
import { ChevronLeft, Search, Wrench, MapPin, QrCode, ArrowUpRight, ArrowDownLeft, X, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../src/api';
import CustomAlert from '../components/CustomAlert';

export default function ToolsScreen() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State untuk Pull-to-Refresh
  const [search, setSearch] = useState('');
  
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedTool, setScannedTool] = useState<any>(null);
  const [transLoading, setTransLoading] = useState(false);
  
  const [alert, setAlert] = useState({ visible: false, type: 'success' as any, title: '', message: '' });

  useEffect(() => {
    fetchTools();
  }, []);

  // Fungsi Ambil Data
  const fetchTools = async () => {
    try {
      const res = await api.get('/inventory?kategori=alat');
      setTools(res.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  };

  // Fungsi Refresh saat layar ditarik
  const onRefresh = () => {
    setRefreshing(true);
    fetchTools();
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    // Cari alat berdasarkan ID (Mencocokkan 24 karakter ID MongoDB)
    const tool = tools.find((t: any) => t._id === data);
    if (tool) {
      setScannedTool(tool);
    } else {
      setAlert({ visible: true, type: 'error', title: 'Tidak Ditemukan', message: 'QR Code tidak valid.' });
    }
  };

  const handleTransaction = async (action: 'borrow' | 'return') => {
    if (!scannedTool) return;
    setTransLoading(true);

    try {
      // Kirim Data ke Server
      await api.post('/tools/transaction', {
        toolId: scannedTool._id,
        action,
        kondisi: 'Bagus',
        lokasiProject: 'Lapangan Utama' 
      });

      setScannedTool(null); // Tutup Modal
      
      // AUTO REFRESH DATA (PENTING)
      setLoading(true); 
      await fetchTools(); 

      setAlert({ 
        visible: true, 
        type: 'success', 
        title: 'Berhasil', 
        message: action === 'borrow' ? 'Stok dikurangi. Alat dipinjam.' : 'Stok ditambah. Alat dikembalikan.'
      });

    } catch (error: any) {
      setAlert({ visible: true, type: 'error', title: 'Gagal', message: error.response?.data?.msg || 'Gagal koneksi server' });
    } finally {
      setTransLoading(false);
    }
  };

  const filteredTools = tools.filter((t: any) => t.nama.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }: any) => {
    const isReady = item.stok > 0;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => setScannedTool(item)}>
        <View style={[styles.iconBox, { backgroundColor: isReady ? '#DCFCE7' : '#DBEAFE' }]}>
           <Wrench size={24} color={isReady ? '#166534' : '#1E40AF'} />
        </View>
        <View style={{ flex: 1 }}>
           <Text style={styles.itemName}>{item.nama}</Text>
           <Text style={styles.itemId}>Stok: {item.stok} {item.satuan}</Text>
           <View style={styles.locRow}>
              <MapPin size={12} color="#94A3B8" />
              <Text style={styles.itemLoc}>{item.lokasi || 'Gudang'}</Text>
           </View>
        </View>
        {/* Tombol Manage Visual */}
        <View style={styles.manageBtn}>
           <Settings size={16} color="#312e59" />
           <Text style={styles.manageText}>Atur</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomAlert 
        visible={alert.visible} type={alert.type} title={alert.title} message={alert.message} 
        onClose={() => setAlert({ ...alert, visible: false })} 
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Alat</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
           <Search size={20} color="#94A3B8" />
           <TextInput 
             style={styles.searchInput} placeholder="Cari nama alat..." value={search} onChangeText={setSearch}
           />
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#312e59" style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filteredTools} 
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // FITUR TARIK REFRESH
          ListEmptyComponent={<Text style={{textAlign:'center', marginTop:50, color:'#94A3B8'}}>Data kosong.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { if (!permission?.granted) requestPermission(); setScanning(true); }}>
         <QrCode color="white" size={28} />
      </TouchableOpacity>

      {/* MODAL SCANNER */}
      <Modal visible={scanning} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CameraView style={{ flex: 1 }} onBarcodeScanned={handleBarCodeScanned} barcodeScannerSettings={{ barcodeTypes: ["qr"] }}>
            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerText}>Scan QR Code Alat</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setScanning(false)}><Text style={styles.closeText}>Tutup</Text></TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* MODAL TRANSAKSI */}
      <Modal visible={!!scannedTool} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setScannedTool(null)}>
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>
            
            <View style={styles.modalIcon}>
              <Wrench size={40} color="#312e59" />
            </View>
            
            <Text style={styles.modalTitle}>{scannedTool?.nama}</Text>
            <View style={styles.stockBadge}>
               <Text style={styles.stockText}>Sisa Stok: {scannedTool?.stok}</Text>
            </View>

            <Text style={styles.modalLabel}>Pilih Aksi:</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnBorrow, scannedTool?.stok < 1 && styles.btnDisabled]} 
                onPress={() => handleTransaction('borrow')}
                disabled={transLoading || scannedTool?.stok < 1}
              >
                {transLoading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <ArrowUpRight color="#fff" size={20} />
                    <Text style={styles.actionText}>PINJAM</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.btnReturn]} 
                onPress={() => handleTransaction('return')}
                disabled={transLoading}
              >
                {transLoading ? <ActivityIndicator color="#312e59" /> : (
                  <>
                    <ArrowDownLeft color="#312e59" size={20} />
                    <Text style={[styles.actionText, {color: '#312e59'}]}>KEMBALIKAN</Text>
                  </>
                )}
              </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  searchContainer: { padding: 24, paddingBottom: 0 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemId: { fontSize: 12, color: '#64748B', marginVertical: 2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemLoc: { fontSize: 12, color: '#64748B' },
  
  manageBtn: { alignItems: 'center', justifyContent: 'center', paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },
  manageText: { fontSize: 10, color: '#312e59', fontWeight: 'bold', marginTop: 4 },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: '#312e59', justifyContent: 'center', alignItems: 'center', shadowColor: '#312e59', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  
  scannerOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  scannerText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  closeBtn: { backgroundColor: 'white', padding: 15, borderRadius: 8 },
  closeText: { color: '#312e59', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalClose: { position: 'absolute', top: 16, right: 16 },
  modalIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  stockBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  stockText: { fontSize: 14, fontWeight: 'bold', color: '#312e59' },
  modalLabel: { alignSelf: 'flex-start', fontSize: 12, color: '#94A3B8', fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnBorrow: { backgroundColor: '#312e59' },
  btnReturn: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#312e59' },
  btnDisabled: { opacity: 0.5, backgroundColor: '#94A3B8' },
  actionText: { fontWeight: 'bold', fontSize: 14, color: '#fff' }
});