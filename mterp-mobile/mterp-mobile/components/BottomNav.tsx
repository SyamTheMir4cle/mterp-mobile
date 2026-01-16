import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Home, 
  Briefcase, 
  Wrench, 
  Clock, 
  Truck, 
  ClipboardList, 
  CheckSquare,
  FileText
} from 'lucide-react-native';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  route: string;
  roles: string[]; // Array of roles that can see this menu
}

// Define navigation items with role-based access
const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    route: '/home',
    roles: ['owner', 'director', 'supervisor', 'admin_project', 'worker', 'mandor', 'tukang', 'logistik'], // All roles
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    route: '/projects',
    roles: ['owner', 'director', 'supervisor', 'admin_project'], // Management only
  },
  {
    id: 'daily-report',
    label: 'Report',
    icon: FileText,
    route: '/daily-report',
    roles: ['supervisor', 'admin_project', 'mandor'], // Field supervisors
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    route: '/tools',
    roles: ['owner', 'director', 'supervisor', 'admin_project', 'logistik'], // Logistics & management
  },
  {
    id: 'attendance',
    label: 'Attend',
    icon: Clock,
    route: '/attendance',
    roles: ['owner', 'director', 'supervisor', 'admin_project', 'worker', 'mandor', 'tukang'], // Most roles
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: ClipboardList,
    route: '/tasks',
    roles: ['worker', 'tukang', 'mandor', 'supervisor', 'admin_project'], // Field workers
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: CheckSquare,
    route: '/approvals',
    roles: ['owner', 'director', 'supervisor', 'admin_project'], // Management only
  },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState<NavItem[]>([]);
  
  // Animation for nav bar entrance
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserRole();
    
    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (userRole) {
      filterNavItems();
    }
  }, [userRole]);

  const loadUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'worker'); // Default to worker if no role
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole('worker'); // Fallback
    }
  };

  const filterNavItems = () => {
    // Filter nav items based on user role
    const filtered = NAV_ITEMS.filter(item => 
      item.roles.includes(userRole.toLowerCase())
    );
    
    // Limit to max 5 items for better UX
    setVisibleItems(filtered.slice(0, 5));
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  const handleNavPress = async (route: string) => {
    // Don't navigate if already on this route
    if (pathname === route) return;
    
    // Haptic feedback on tap
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (Platform.OS === 'android') {
      await Haptics.selectionAsync();
    }
    
    router.push(route as any);
  };

  // Don't show nav on login/register screens
  if (pathname === '/' || pathname === '/index' || pathname === '/register') {
    return null;
  }

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.navBar,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.route);
          
          return (
            <NavItem
              key={item.id}
              item={item}
              icon={Icon}
              active={active}
              onPress={() => handleNavPress(item.route)}
              delay={index * 50}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

// Animated Navigation Item Component
interface NavItemProps {
  item: NavItem;
  icon: any;
  active: boolean;
  onPress: () => void;
  delay: number;
}

const NavItem: React.FC<NavItemProps> = ({ item, icon: Icon, active, onPress, delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { scale: enterAnim }],
        }}
      >
        <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
          <Icon 
            size={active ? 26 : 22} 
            color={active ? '#312e59' : '#94A3B8'} 
            strokeWidth={active ? 2.5 : 2}
          />
        </View>
      </Animated.View>
      <Animated.Text 
        style={[
          styles.label, 
          active && styles.labelActive,
          { opacity: enterAnim }
        ]}
      >
        {item.label}
      </Animated.Text>
      {active && (
        <Animated.View 
          style={[
            styles.activeIndicator,
            { opacity: enterAnim }
          ]} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#F0EDF6',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  labelActive: {
    color: '#312e59',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: '#312e59',
    borderRadius: 2,
  },
});
