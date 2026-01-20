import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HardHat } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [showSecondScreen, setShowSecondScreen] = useState(false);

  // First screen animations
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-10);
  const logoOpacity = useSharedValue(0);
  
  const companyNameOpacity = useSharedValue(0);
  const companyNameY = useSharedValue(20);
  
  const loadingOpacity = useSharedValue(0);
  const loadingY = useSharedValue(10);

  // Second screen animations - staggered text
  const word1Opacity = useSharedValue(0);
  const word1Y = useSharedValue(30);
  
  const word2Opacity = useSharedValue(0);
  const word2Y = useSharedValue(30);
  
  const word3Opacity = useSharedValue(0);
  const word3Y = useSharedValue(30);
  
  const word4Opacity = useSharedValue(0);
  const word4Y = useSharedValue(30);
  
  const word5Opacity = useSharedValue(0);
  const word5Y = useSharedValue(30);

  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // First screen sequence
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));
    logoRotate.value = withDelay(300, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    
    companyNameOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    companyNameY.value = withDelay(800, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    
    loadingOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
    loadingY.value = withDelay(1200, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    // Transition to second screen after 2.5 seconds
    setTimeout(() => {
      setShowSecondScreen(true);
    }, 2500);
  }, []);

  useEffect(() => {
    if (showSecondScreen) {
      // GSAP-style staggered animation for "Keep it Safe & Sound"
      const staggerDelay = 150; // Delay between each word
      
      word1Opacity.value = withDelay(0, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      word1Y.value = withDelay(0, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      
      word2Opacity.value = withDelay(staggerDelay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      word2Y.value = withDelay(staggerDelay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      
      word3Opacity.value = withDelay(staggerDelay * 2, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      word3Y.value = withDelay(staggerDelay * 2, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      
      word4Opacity.value = withDelay(staggerDelay * 3, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      word4Y.value = withDelay(staggerDelay * 3, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      
      word5Opacity.value = withDelay(staggerDelay * 4, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
      word5Y.value = withDelay(staggerDelay * 4, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

      // Fade out entire screen and call onFinish after all animations complete
      screenOpacity.value = withDelay(2500, withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }));
    }
  }, [showSecondScreen]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const companyNameAnimatedStyle = useAnimatedStyle(() => ({
    opacity: companyNameOpacity.value,
    transform: [{ translateY: companyNameY.value }],
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
    transform: [{ translateY: loadingY.value }],
  }));

  const word1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: word1Opacity.value,
    transform: [{ translateY: word1Y.value }],
  }));

  const word2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: word2Opacity.value,
    transform: [{ translateY: word2Y.value }],
  }));

  const word3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: word3Opacity.value,
    transform: [{ translateY: word3Y.value }],
  }));

  const word4AnimatedStyle = useAnimatedStyle(() => ({
    opacity: word4Opacity.value,
    transform: [{ translateY: word4Y.value }],
  }));

  const word5AnimatedStyle = useAnimatedStyle(() => ({
    opacity: word5Opacity.value,
    transform: [{ translateY: word5Y.value }],
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <LinearGradient colors={['#F8F9FA', '#E9ECEF']} style={StyleSheet.absoluteFill} />
      
      {!showSecondScreen ? (
        // First Screen: MTERP Logo
        <View style={styles.centerContent}>
          <Animated.View style={logoAnimatedStyle}>
            <LinearGradient colors={['#312e59', '#514d8a']} style={styles.logoBox}>
              <HardHat color="white" size={50} />
            </LinearGradient>
          </Animated.View>
          
          <Animated.View style={companyNameAnimatedStyle}>
            <Text style={styles.brandName}>
              MTE<Text style={styles.brandNameOutline}>RP</Text>
            </Text>
            <Text style={styles.companyName}>Mega Tama Emerco Resource Enterprise</Text>
          </Animated.View>
          
          <Animated.View style={loadingAnimatedStyle}>
            <Text style={styles.loadingText}>Loading</Text>
          </Animated.View>
        </View>
      ) : (
        // Second Screen: Keep it Safe & Sound
        <View style={styles.centerContent}>
          <View style={styles.taglineContainer}>
            <Animated.Text style={[styles.taglineWord, word1AnimatedStyle]}>
              Keep
            </Animated.Text>
            <Animated.Text style={[styles.taglineWord, word2AnimatedStyle]}>
              it
            </Animated.Text>
            <Animated.Text style={[styles.taglineWord, word3AnimatedStyle]}>
              Safe &
            </Animated.Text>
            <Animated.Text style={[styles.taglineWord, word4AnimatedStyle]}>
              Sound
            </Animated.Text>
          </View>
          
          <Animated.View style={[companyNameAnimatedStyle, { marginTop: 30 }]}>
            <Text style={styles.companyNameSmall}>Mega Tama Emerco Resource Enterprise</Text>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#312e59',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  brandName: {
    fontSize: 56,
    fontWeight: '900',
    color: '#312e59',
    letterSpacing: -2,
    textAlign: 'center',
  },
  brandNameOutline: {
    fontWeight: '300',
    color: '#312e59',
  },
  companyName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  companyNameSmall: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 14,
    color: '#312e59',
    fontWeight: '600',
    marginTop: 50,
    letterSpacing: 1,
  },
  taglineContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 40,
  },
  taglineWord: {
    fontSize: 64,
    fontWeight: '900',
    color: '#312e59',
    lineHeight: 72,
    letterSpacing: -2,
  },
});
