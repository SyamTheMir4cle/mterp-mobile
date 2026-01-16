import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  variant?: 'filled' | 'outlined' | 'ghost';
  disabled?: boolean;
  style?: any;
}

export default function IconButton({
  icon: Icon,
  onPress,
  size = 24,
  color = '#1E293B',
  backgroundColor = '#F1F5F9',
  variant = 'filled',
  disabled = false,
  style,
}: IconButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor,
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const buttonSize = size * 1.8;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
