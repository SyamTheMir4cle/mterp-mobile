import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#312e59',
          color: '#fff',
          shadowColor: '#312e59',
        };
      case 'secondary':
        return {
          backgroundColor: '#64748B',
          color: '#fff',
          shadowColor: '#64748B',
        };
      case 'success':
        return {
          backgroundColor: '#10B981',
          color: '#fff',
          shadowColor: '#10B981',
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          color: '#fff',
          shadowColor: '#EF4444',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          color: '#fff',
          shadowColor: '#F59E0B',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#312e59',
          borderWidth: 2,
          borderColor: '#312e59',
        };
      default:
        return {
          backgroundColor: '#312e59',
          color: '#fff',
          shadowColor: '#312e59',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 12,
          iconSize: 16,
          borderRadius: 8,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 20,
          borderRadius: 10,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 24,
          borderRadius: 14,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 20,
          borderRadius: 10,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
          borderWidth: variantStyles.borderWidth || 0,
          borderColor: variantStyles.borderColor,
          shadowColor: variantStyles.shadowColor,
          shadowOpacity: variant === 'outline' ? 0 : 0.3,
          shadowRadius: variant === 'outline' ? 0 : 10,
          elevation: variant === 'outline' ? 0 : 5,
          width: fullWidth ? '100%' : 'auto',
        },
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.color} size="small" />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'left' && (
            <Icon size={sizeStyles.iconSize} color={variantStyles.color} style={{ marginRight: 8 }} />
          )}
          <Text style={[styles.text, { color: variantStyles.color, fontSize: sizeStyles.fontSize }]}>
            {title}
          </Text>
          {Icon && iconPosition === 'right' && (
            <Icon size={sizeStyles.iconSize} color={variantStyles.color} style={{ marginLeft: 8 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
});
