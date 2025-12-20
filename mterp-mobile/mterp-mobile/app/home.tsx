import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Wrench, ClipboardList, Clock, Truck, CheckSquare, AlertCircle, ChevronLeft } from 'lucide-react-native';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('userData').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER SECTION */}
        <LinearGradient colors={['#312e59', '#514d8a']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.username}>{user?.fullName || 'User'}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>{user?.role || 'STAFF'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Hiasan Background Header */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
        </LinearGradient>

        {/* MAIN GRID */}
        <View style={styles.gridContainer}>
          
          {/* BIG CARD: Tool Tracking */}
          <TouchableOpacity 
            style={styles.bigCard} 
            onPress={() => router.push('/tools' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.bigCardContent}>
              <LinearGradient colors={['#312e59', '#514d8a']} style={styles.iconBoxBig}>
                <Wrench size={32} color="white" />
              </LinearGradient>
              <View>
                <Text style={styles.cardTitle}>Tool Tracking</Text>
                <Text style={styles.cardSubtitle}>Manage Inventory</Text>
              </View>
            </View>
            <View style={styles.arrowCircle}>
              <ChevronLeft size={20} color="#312e59" style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <DashboardCard 
              icon={Clock} label="Attendance" sub="07:45 In" 
              color="#10B981" bg="#D1FAE5" 
              onPress={() => router.push('/attendance')} 
            />
            <DashboardCard 
              icon={Truck} label="Materials" sub="Request Item" 
              color="#8B5CF6" bg="#EDE9FE" 
              onPress={() => {router.push('/materials')}} // Buat nanti
            />
          </View>

          <View style={styles.row}>
             <DashboardCard 
              icon={ClipboardList} label="My Tasks" sub="3 Pending" 
              color="#F59E0B" bg="#FEF3C7" 
              onPress={() => router.push('/tasks')} // Buat nanti
            />
             <DashboardCard 
              icon={CheckSquare} label="Approvals" sub="Review" 
              color="#3B82F6" bg="#DBEAFE" 
              onPress={() => {router.push('/approvals')}} // Buat nanti
            />
          </View>

        </View>

        {/* NOTIFICATION FEED */}
        <View style={styles.feedSection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>SITE UPDATES</Text>
             <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
          </View>

          <View style={styles.notifCard}>
             <View style={styles.notifLine} />
             <View style={styles.notifIcon}>
                <AlertCircle size={20} color="#D97706" />
             </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Heavy Rain Warning</Text>
                <Text style={styles.notifBody}>Stop all crane operations immediately until further notice.</Text>
                <Text style={styles.notifTime}>10 mins ago</Text>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// Komponen Kecil untuk Card
const DashboardCard = ({ icon: Icon, label, sub, color, bg, onPress }: any) => (
  <TouchableOpacity style={styles.smallCard} onPress={onPress}>
    <View style={[styles.iconBoxSmall, { backgroundColor: bg }]}>
      <Icon size={24} color={color} />
    </View>
    <View style={{ marginTop: 12 }}>
      <Text style={styles.cardTitleSmall}>{label}</Text>
      <Text style={styles.cardSubSmall}>{sub}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    position: 'relative', overflow: 'hidden'
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  logoutBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  headerDecor1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerDecor2: { position: 'absolute', bottom: -20, left: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(129, 140, 248, 0.2)', filter: 'blur(20px)' },

  gridContainer: { padding: 24, marginTop: -30 },
  
  bigCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5
  },
  bigCardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBoxBig: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  arrowCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  smallCard: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, justifyContent: 'center', alignItems: 'center'
  },
  iconBoxSmall: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardTitleSmall: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  cardSubSmall: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  feedSection: { paddingHorizontal: 24, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  seeAll: { fontSize: 12, fontWeight: 'bold', color: '#312e59' },

  notifCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: '#F1F5F9', position: 'relative', overflow: 'hidden'
  },
  notifLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#F59E0B' },
  notifIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  notifBody: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 10, color: '#94A3B8', marginTop: 6, fontWeight: '600' }
});