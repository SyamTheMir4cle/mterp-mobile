import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
  style?: any;
}

export default function Avatar({
  uri,
  name,
  size = 40,
  onPress,
  showBadge = false,
  badgeColor = '#10B981',
  style,
}: AvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBackgroundColor = (name?: string) => {
    if (!name) return '#94A3B8';
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const AvatarWrapper = onPress ? TouchableOpacity : View;

  return (
    <AvatarWrapper
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : name ? (
        <View
          style={[
            styles.initialsContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getBackgroundColor(name),
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: size * 0.4,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.iconContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <User size={size * 0.5} color="#fff" />
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: badgeColor,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </AvatarWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
