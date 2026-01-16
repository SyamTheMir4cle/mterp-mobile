import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

/**
 * Role Testing Utility Component
 * 
 * This component allows developers to quickly switch between different user roles
 * to test role-based navigation and features without logging in/out repeatedly.
 * 
 * Usage: Add this component to your dev screens or enable it via a secret gesture.
 */

const AVAILABLE_ROLES = [
  { id: 'owner', label: 'Owner', color: '#EF4444', description: 'Full system access' },
  { id: 'director', label: 'Director', color: '#F59E0B', description: 'Management oversight' },
  { id: 'supervisor', label: 'Supervisor', color: '#10B981', description: 'Project supervision' },
  { id: 'admin_project', label: 'Project Admin', color: '#3B82F6', description: 'Project administration' },
  { id: 'mandor', label: 'Mandor', color: '#8B5CF6', description: 'Field coordinator' },
  { id: 'worker', label: 'Worker', color: '#6B7280', description: 'General worker' },
  { id: 'tukang', label: 'Tukang', color: '#14B8A6', description: 'Skilled craftsman' },
  { id: 'logistik', label: 'Logistics', color: '#EC4899', description: 'Materials & tools' },
];

interface RoleSwitcherProps {
  visible: boolean;
  onClose: () => void;
  currentRole?: string;
}

export default function RoleSwitcher({ visible, onClose, currentRole }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole || 'worker');

  const handleRoleSwitch = async (roleId: string) => {
    try {
      // Get current user data
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        // Update role
        userData.role = roleId;
        // Save back
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setSelectedRole(roleId);
        
        // Show confirmation
        alert(`✅ Role switched to: ${roleId.toUpperCase()}\n\nReloading app...`);
        
        // Reload to home to see changes
        router.replace('/home' as any);
        onClose();
      }
    } catch (error) {
      console.error('Error switching role:', error);
      alert('Failed to switch role');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient colors={['#312e59', '#514d8a']} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconBox}>
                <User size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Role Testing</Text>
                <Text style={styles.subtitle}>Switch user role for testing</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Role List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>SELECT ROLE</Text>
            
            {AVAILABLE_ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardActive,
                ]}
                onPress={() => handleRoleSwitch(role.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIndicator, { backgroundColor: role.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleLabel}>{role.label}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                {selectedRole === role.id && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>CURRENT</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Warning */}
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ FOR DEVELOPMENT ONLY
              </Text>
              <Text style={styles.warningSubtext}>
                This tool is for testing purposes. Changes persist until logout.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: '#312e59',
    backgroundColor: '#F0EDF6',
  },
  roleIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  activeBadge: {
    backgroundColor: '#312e59',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  warning: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
});
