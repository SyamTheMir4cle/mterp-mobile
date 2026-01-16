import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { X, LucideIcon } from 'lucide-react-native';

interface ChipProps {
  label: string;
  onPress?: () => void;
  onRemove?: () => void;
  icon?: LucideIcon;
  selected?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium';
  style?: any;
}

export default function Chip({
  label,
  onPress,
  onRemove,
  icon: Icon,
  selected = false,
  variant = 'outline',
  size = 'medium',
  style,
}: ChipProps) {
  const getVariantStyles = () => {
    if (selected) {
      return {
        backgroundColor: '#312e59',
        borderColor: '#312e59',
        textColor: '#fff',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#DBEAFE',
          borderColor: '#93C5FD',
          textColor: '#1E40AF',
        };
      case 'secondary':
        return {
          backgroundColor: '#F1F5F9',
          borderColor: '#CBD5E1',
          textColor: '#475569',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#CBD5E1',
          textColor: '#475569',
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: '#CBD5E1',
          textColor: '#475569',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: 11,
          iconSize: 12,
          borderRadius: 6,
        };
      case 'medium':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 13,
          iconSize: 14,
          borderRadius: 8,
        };
      default:
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 13,
          iconSize: 14,
          borderRadius: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {Icon && (
        <Icon
          size={sizeStyles.iconSize}
          color={variantStyles.textColor}
          style={{ marginRight: 4 }}
        />
      )}
      
      <Text
        style={[
          styles.label,
          {
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {label}
      </Text>

      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <X size={sizeStyles.iconSize} color={variantStyles.textColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
  removeBtn: {
    marginLeft: 4,
    padding: 2,
  },
});
