import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, type, title, message, onClose }: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={64} color="#22C55E" />;
      case 'error': return <XCircle size={64} color="#EF4444" />;
      case 'warning': return <AlertTriangle size={64} color="#F59E0B" />;
    }
  };

  const getBtnColor = () => {
    switch (type) {
      case 'success': return '#22C55E';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: getBtnColor() }]} 
            onPress={onClose}
          >
            <Text style={styles.btnText}>OK, Mengerti</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(49, 46, 89, 0.6)', // Navy transparan
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  alertBox: {
    width: width - 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 50
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});