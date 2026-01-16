import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  style?: any;
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  style,
}: AlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#D1FAE5',
          borderColor: '#6EE7B7',
          textColor: '#065F46',
          icon: CheckCircle,
        };
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#FCA5A5',
          textColor: '#991B1B',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#FDE68A',
          textColor: '#92400E',
          icon: AlertTriangle,
        };
      case 'info':
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#93C5FD',
          textColor: '#1E40AF',
          icon: Info,
        };
      default:
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#93C5FD',
          textColor: '#1E40AF',
          icon: Info,
        };
    }
  };

  const alertStyles = getAlertStyles();
  const Icon = alertStyles.icon;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: alertStyles.backgroundColor,
          borderColor: alertStyles.borderColor,
        },
        style,
      ]}
    >
      <Icon size={20} color={alertStyles.textColor} style={styles.icon} />
      
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: alertStyles.textColor }]}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: alertStyles.textColor }]}>
          {message}
        </Text>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={18} color={alertStyles.textColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
  },
});
