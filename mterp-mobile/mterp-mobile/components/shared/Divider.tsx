import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DividerProps {
  label?: string;
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: any;
}

export default function Divider({
  label,
  color = '#E2E8F0',
  thickness = 1,
  spacing = 16,
  style,
}: DividerProps) {
  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: spacing }, style]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical: spacing,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  label: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
