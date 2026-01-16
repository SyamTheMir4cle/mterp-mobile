import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: any;
}

export default function ProgressBar({
  progress,
  height = 8,
  color = '#10B981',
  backgroundColor = '#E2E8F0',
  showLabel = false,
  label,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label || 'Progress'}</Text>
          <Text style={styles.percentage}>{clampedProgress.toFixed(0)}%</Text>
        </View>
      )}
      
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  percentage: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  track: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
