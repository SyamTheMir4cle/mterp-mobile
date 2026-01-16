import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
  onPress?: () => void;
  elevated?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

export default function Card({
  children,
  style,
  padding = 16,
  onPress,
  elevated = true,
  borderColor,
  borderWidth = 0,
}: CardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.card,
        {
          padding,
          borderWidth,
          borderColor: borderColor || 'transparent',
        },
        elevated && styles.elevated,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
