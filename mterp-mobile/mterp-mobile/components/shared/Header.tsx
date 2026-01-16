import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, LucideIcon } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
  style?: any;
  backgroundColor?: string;
}

export default function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon: RightIcon,
  onRightPress,
  style,
  backgroundColor = '#fff',
}: HeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        { backgroundColor },
        style,
      ]}
    >
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ChevronLeft color="#1E293B" size={24} />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>

      {RightIcon && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={styles.rightBtn}>
          <RightIcon color="#1E293B" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 16,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rightBtn: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
  },
});
