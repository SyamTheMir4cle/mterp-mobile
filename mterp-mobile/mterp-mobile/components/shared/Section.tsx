import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  style?: any;
}

export default function Section({
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  style,
}: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>

        {actionLabel && onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
            {ActionIcon && (
              <ActionIcon size={16} color="#312e59" style={{ marginRight: 4 }} />
            )}
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#312e59',
  },
});
