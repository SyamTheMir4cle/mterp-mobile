import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, MapPin, ListTodo, Wrench, ChevronRight, TrendingUp, DollarSign, PieChart } from 'lucide-react-native';
import api from '../src/api';
import { Header, Section } from '../components/shared';
import { ProjectData } from '../src/types';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback ID if params differ
  const targetId = projectId || '1';

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      // Mock Data if API fails or for demo
      // In real app: const res = await api.get(`/projects/${targetId}`);
      // setProject(res.data);
      
      // MOCK DATA FOR DEMO VISUALIZATION
      setProject({
          id: '1',
          name: 'Pembangunan Ruko 3 Lantai',
          location: 'Jakarta Selatan',
          description: 'Ruko modern dengan style industrial',
          totalBudget: 1500000000,
          globalDates: {
              planned: { start: '2024-02-01', end: '2024-08-01' },
              actual: { start: '2024-02-05', end: '' }
          },
          documents: {
            shopDrawing: null, 
            hse: null, 
            manPowerList: null, 
            workItemsList: null, 
            materialList: null, 
            toolsList: null
          },
          supplies: [],
          workItems: [
              { 
                  id: 1, name: 'Pondasi', qty: 50, volume: 'm3', cost: 150000000, weight: 10, 
                  logic: 'Inflexible', dates: { plannedStart: '2024-02-01', plannedEnd: '2024-02-28' }, 
                  resources: [], actuals: { progressPercent: 50, costUsed: 75000000, resourcesUsed: [] }
              }
          ]
      });

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#312e59" style={{ flex: 1 }} />;
  if (!project) return <View style={styles.container}><Text>Project Not Found</Text></View>;

  const plannedStart = project.globalDates?.planned?.start || '-';
  const plannedEnd = project.globalDates?.planned?.end || '-';
  const actualStart = project.globalDates?.actual?.start || 'Not Started';
  
  // Calc Budget Used (Mock logic)
  const budgetUsed = project.workItems?.reduce((acc, item) => acc + (item.actuals?.costUsed || 0), 0) || 0;
  const progress = project.workItems?.reduce((acc, item) => acc + ( (item.actuals?.progressPercent || 0) * (item.weight || 0) / 100 ), 0) || 0;

  return (
    <View style={styles.container}>
      <Header title="Project Dashboard" />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Banner */}
        <View style={styles.banner}>
            <Text style={styles.title}>{project.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <MapPin size={14} color="#CBD5E1" />
                <Text style={styles.location}>{project.location}</Text>
            </View>
            <Text style={styles.budget}>Rv {project.totalBudget?.toLocaleString()}</Text>
        </View>

        {/* 1. PROGRESS SUMMARY */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <TrendingUp size={20} color="#10B981" />
                <Text style={styles.statVal}>{progress.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Actual Progress</Text>
            </View>
            <View style={styles.statCard}>
                <DollarSign size={20} color="#F59E0B" />
                <Text style={styles.statVal}>{(budgetUsed / project.totalBudget * 100).toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Budget Used</Text>
            </View>
        </View>

        {/* 2. DATES COMPARISON */}
        <Section title="Timeline (Planned vs Actual)">
            <View style={styles.dateCard}>
                <View style={[styles.dateCol, { borderRightWidth: 1, borderColor: '#F1F5F9' }]}>
                    <Text style={styles.dateLabel}>PLANNED</Text>
                    <Text style={styles.dateVal}>{plannedStart}</Text>
                    <Text style={{ textAlign: 'center', color: '#CBD5E1' }}>↓</Text>
                    <Text style={styles.dateVal}>{plannedEnd}</Text>
                </View>
                <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>ACTUAL</Text>
                    <Text style={[styles.dateVal, { color: '#312e59' }]}>{actualStart}</Text>
                    <Text style={{ textAlign: 'center', color: '#CBD5E1' }}>↓</Text>
                    <Text style={[styles.dateVal, { color: '#64748B' }]}>In Progress</Text>
                </View>
            </View>
        </Section>

        {/* 3. S-CURVE PLACEHOLDER */}
        <Section title="S-Curve Analysis">
            <View style={styles.chartPlaceholder}>
                <PieChart size={32} color="#CBD5E1" />
                <Text style={{ color: '#94A3B8', marginTop: 8 }}>Chart will be generated based on Daily Reports</Text>
            </View>
        </Section>

        {/* 4. ACTIONS */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/daily-report', params: { project: JSON.stringify(project) } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}><ListTodo size={20} color="#1E40AF" /></View>
                <View>
                    <Text style={styles.actionTitle}>Update Harian (Daily Report)</Text>
                    <Text style={styles.actionSub}>Input progress, cuaca, & material</Text>
                </View>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/project-tools', params: { projectId: project.id || '1', projectName: project.name } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconBox, { backgroundColor: '#FAE8FF' }]}><Wrench size={20} color="#86198F" /></View>
                <View>
                    <Text style={styles.actionTitle}>Alat & Inventaris</Text>
                    <Text style={styles.actionSub}>Cek stok alat di lapangan</Text>
                </View>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  
  banner: { backgroundColor: '#312e59', padding: 24, borderRadius: 24, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  location: { color: '#CBD5E1', fontSize: 13 },
  budget: { color: '#FCD34D', fontWeight: 'bold', fontSize: 16, marginTop: 12 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#64748B' },

  dateCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  dateCol: { flex: 1, padding: 16, alignItems: 'center', gap: 8 },
  dateLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  dateVal: { fontWeight: 'bold', color: '#334155' },

  chartPlaceholder: { height: 150, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 12, marginTop: 8 },
  actionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontWeight: 'bold', color: '#1E293B', fontSize: 15 },
  actionSub: { fontSize: 12, color: '#64748B' },
});