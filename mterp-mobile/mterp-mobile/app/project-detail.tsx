import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { TrendingUp, Share2, Wrench, FileText, Download, CheckCircle2 } from 'lucide-react-native';
import { LineChart } from "react-native-chart-kit";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import api from '../src/api';
import { Header, Badge, ProgressBar, Card } from '../components/shared'; 

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams();
  
  // State projectData diinisialisasi null atau dari params, tapi akan di-update oleh API
  const initialProject = params.project ? JSON.parse(params.project as string) : null;
  const [projectData, setProjectData] = useState<any>(initialProject);
  
  const [chartData, setChartData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // --- AUTO REFRESH SAAT LAYAR DIBUKA ---
  useFocusEffect(
    useCallback(() => {
      if (initialProject?._id) {
        refreshData();
      }
    }, [initialProject?._id])
  );

  const refreshData = async () => {
    // Jangan set loading true agar tidak flickering parah, cukup update diam-diam
    try {
      // 1. Ambil Data Proyek Terbaru (Untuk Progress Item)
      const resProject = await api.get(`/projects/${initialProject._id}`);
      setProjectData(resProject.data);

      // 2. Ambil Data S-Curve Terbaru
      const resChart = await api.get(`/projects/${initialProject._id}/scurve`);
      if (resChart.data && resChart.data.labels?.length > 0) {
        setChartData(resChart.data);
      }
    } catch (e) {
      console.log("Gagal refresh data:", e);
    }
  };

  if (!projectData) return <View style={styles.center}><Text>Loading Data...</Text></View>;

  const workItems = projectData.workItems || [];
  const screenWidth = Dimensions.get("window").width;

  // --- GENERATE PDF REPORT ---
  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 20px; }
              h1 { color: #312e59; }
              .header { margin-bottom: 20px; border-bottom: 2px solid #312e59; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { backgroundColor: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Laporan Proyek: ${projectData.nama}</h1>
              <p><strong>Lokasi:</strong> ${projectData.lokasi}</p>
              <p><strong>Total Progress:</strong> ${projectData.progress}%</p>
            </div>
            <h3>Progress Detail Item Pekerjaan</h3>
            <table>
              <tr><th>Item Pekerjaan</th><th>Target</th><th>Realisasi (%)</th></tr>
              ${workItems.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.target}</td>
                  <td>${item.progress || 0}%</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (e) { Alert.alert("Error", "Gagal export PDF"); }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header 
        title={projectData.nama}
        subtitle={projectData.lokasi}
        rightIcon={Share2}
        onRightPress={generatePDF}
      />

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'overview' && styles.activeTab]} onPress={() => setActiveTab('overview')}>
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'docs' && styles.activeTab]} onPress={() => setActiveTab('docs')}>
          <Text style={[styles.tabText, activeTab === 'docs' && styles.activeTabText]}>Dokumen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
        
        {activeTab === 'overview' ? (
          <>
            {/* PROGRESS CARD */}
            <View style={styles.progressCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', opacity: 0.8 }}>Total Progress</Text>
                <TrendingUp color="#fff" size={20} />
              </View>
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 }}>
                {projectData.progress}%
              </Text>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 }}>
                <View style={{ width: `${projectData.progress}%`, height: '100%', backgroundColor: '#fff', borderRadius: 3 }} />
              </View>
            </View>

            {/* S-CURVE CHART */}
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>📈 Kurva S (S-Curve)</Text>
              {chartData && chartData.labels?.length > 0 ? (
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        data: chartData.plannedData,
                        color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // Abu-abu (Planned)
                        strokeWidth: 2,
                        withDots: false
                      },
                      {
                        data: chartData.actualData,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Hijau (Actual)
                        strokeWidth: 3,
                        withDots: true
                      }
                    ],
                    legend: ["Rencana", "Realisasi"]
                  }}
                  width={screenWidth - 48}
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(49, 46, 89, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              ) : (
                <Text style={{textAlign:'center', color:'#94A3B8', padding: 20}}>Belum ada data kurva.</Text>
              )}
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.gridAction}>
              <TouchableOpacity 
                style={[styles.actionBtn, { flex: 1, backgroundColor: '#10B981' }]} 
                onPress={() => router.push({ pathname: '/daily-report', params: { project: JSON.stringify(projectData) } } as any)}
              >
                <CheckCircle2 color="#fff" size={24} />
                <Text style={styles.actionBtnText}>Laporan Harian</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, { flex: 1, backgroundColor: '#F59E0B' }]} 
                onPress={() => router.push({ pathname: '/project-tools', params: { projectId: projectData._id } } as any)}
              >
                <Wrench color="#fff" size={24} />
                <Text style={styles.actionBtnText}>Alat Proyek</Text>
              </TouchableOpacity>
            </View>

            {/* LIST ITEM PEKERJAAN (DYNAMIC UPDATE) */}
            <Text style={styles.sectionTitle}>Item Pekerjaan</Text>
            {workItems.length > 0 ? (
              workItems.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemTarget}>Target: {item.target}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.itemVal}>{item.progress || 0}%</Text>
                    <View style={{width: 60, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 4}}>
                       <View style={{width: `${item.progress || 0}%`, height: '100%', backgroundColor: '#312e59', borderRadius: 2}} />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{color: '#94A3B8', fontStyle: 'italic', textAlign: 'center'}}>Belum ada item pekerjaan.</Text>
            )}
          </>
        ) : (
          /* TAB DOKUMEN */
          <View>
            <Text style={styles.sectionTitle}>Dokumen Proyek</Text>
            <View style={styles.docsContainer}>
              {projectData.documents ? Object.entries(projectData.documents).map(([key, val]: any) => (
                 val ? (
                  <TouchableOpacity key={key} style={styles.docItem} onPress={() => Alert.alert('Info', 'Membuka dokumen: ' + val)}>
                    <View style={styles.docIcon}>
                      <FileText color="#3B82F6" size={20} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.docTitle}>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</Text>
                      <Text style={styles.docSub}>Ketuk untuk melihat</Text>
                    </View>
                    <Download color="#94A3B8" size={20} />
                  </TouchableOpacity>
                 ) : null
              )) : (
                <Text style={{textAlign: 'center', color: '#94A3B8', marginTop: 20}}>Tidak ada dokumen terlampir.</Text>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 24 },
  tab: { marginRight: 24, paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#312e59' },
  tabText: { color: '#64748B', fontWeight: '600' },
  activeTabText: { color: '#312e59' },

  progressCard: { backgroundColor: '#312e59', padding: 24, borderRadius: 20, marginBottom: 20, shadowColor: '#312e59', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  
  chartCard: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 20, elevation: 2, minHeight: 250 },

  gridAction: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 4 },
  itemTarget: { fontSize: 12, color: '#64748B' },
  itemVal: { fontSize: 16, fontWeight: 'bold', color: '#312e59' },

  docsContainer: { gap: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  docIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  docSub: { fontSize: 12, color: '#64748B' }
});