import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
  style?: any;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  style,
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#DBEAFE',
          color: '#1E40AF',
          borderColor: '#93C5FD',
        };
      case 'success':
        return {
          backgroundColor: '#D1FAE5',
          color: '#065F46',
          borderColor: '#6EE7B7',
        };
      case 'danger':
        return {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          borderColor: '#FCA5A5',
        };
      case 'warning':
        return {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          borderColor: '#FDE68A',
        };
      case 'info':
        return {
          backgroundColor: '#E0E7FF',
          color: '#3730A3',
          borderColor: '#C7D2FE',
        };
      case 'neutral':
        return {
          backgroundColor: '#F1F5F9',
          color: '#475569',
          borderColor: '#CBD5E1',
        };
      default:
        return {
          backgroundColor: '#DBEAFE',
          color: '#1E40AF',
          borderColor: '#93C5FD',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          fontSize: 10,
          iconSize: 12,
          borderRadius: 4,
        };
      case 'medium':
        return {
          paddingVertical: 4,
          paddingHorizontal: 10,
          fontSize: 12,
          iconSize: 14,
          borderRadius: 6,
        };
      case 'large':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 14,
          iconSize: 16,
          borderRadius: 8,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 10,
          fontSize: 12,
          iconSize: 14,
          borderRadius: 6,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
          borderWidth: 1,
          borderColor: variantStyles.borderColor,
        },
        style,
      ]}
    >
      {Icon && (
        <Icon
          size={sizeStyles.iconSize}
          color={variantStyles.color}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: variantStyles.color,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
