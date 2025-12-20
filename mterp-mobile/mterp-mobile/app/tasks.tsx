import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ChevronLeft, CheckCircle2, Clock, MapPin, Calendar, Circle } from 'lucide-react-native';
import { router } from 'expo-router';

const INITIAL_TASKS = [
  { id: '1', title: 'Cek Scaffolding Zona B', loc: 'Lantai 3', time: '08:00', status: 'Pending', priority: 'High' },
  { id: '2', title: 'Cor Pondasi Utama', loc: 'Zona A', time: '10:30', status: 'Progress', priority: 'High' },
  { id: '3', title: 'Pembersihan Area Masuk', loc: 'Gerbang Depan', time: '16:00', status: 'Done', priority: 'Low' },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Done' ? 'Pending' : 'Done' } : t));
  };

  const renderItem = ({ item }: any) => {
    const isDone = item.status === 'Done';
    return (
      <TouchableOpacity 
        style={[styles.card, isDone && styles.cardDone]} 
        onPress={() => toggleTask(item.id)}
        activeOpacity={0.8}
      >
        <View style={{ marginRight: 15 }}>
          {isDone ? (
            <CheckCircle2 color="#22C55E" size={24} />
          ) : (
            <Circle color="#CBD5E1" size={24} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskTitle, isDone && styles.textDone]}>{item.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={12} color="#64748B" />
              <Text style={styles.metaText}>{item.loc}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
          </View>
        </View>
        {item.priority === 'High' && !isDone && (
          <View style={styles.badgeHigh}>
            <Text style={styles.badgeText}>HIGH</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Tugas Harian</Text>
          <Text style={styles.subtitle}>Rabu, 25 Oktober</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
           <Calendar color="#312e59" size={24} />
        </View>
      </View>

      <View style={styles.summary}>
         <View style={styles.statBox}>
            <Text style={styles.statNum}>{tasks.filter(t => t.status !== 'Done').length}</Text>
            <Text style={styles.statLabel}>To Do</Text>
         </View>
         <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: '#E2E8F0' }]}>
            <Text style={[styles.statNum, { color: '#22C55E' }]}>{tasks.filter(t => t.status === 'Done').length}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
         </View>
      </View>

      <FlatList 
        data={tasks}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24 }}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  backBtn: { marginRight: 16, padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  summary: { flexDirection: 'row', backgroundColor: '#fff', margin: 24, marginTop: 0, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#312e59' },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },

  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  cardDone: { opacity: 0.6, backgroundColor: '#F8F9FA' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  textDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B' },
  
  badgeHigh: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' }
});