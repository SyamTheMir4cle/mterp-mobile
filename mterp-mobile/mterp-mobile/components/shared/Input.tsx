import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon, Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone';
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  style?: any;
  maxLength?: number;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  icon: Icon,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  required = false,
  style,
  maxLength,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  const isPassword = type === 'password';

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {maxLength && value && (
            <Text style={styles.charCount}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {Icon && (
          <Icon size={20} color="#94A3B8" style={styles.icon} />
        )}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            Icon && styles.inputWithIcon,
            isPassword && styles.inputWithPassword,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={getKeyboardType()}
          secureTextEntry={isPassword && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color="#94A3B8" />
            ) : (
              <Eye size={20} color="#94A3B8" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  required: {
    color: '#EF4444',
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#312e59',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.6,
  },
  icon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputWithPassword: {
    paddingRight: 8,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
});
