import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../Theme';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 180, showText = true }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.logoCircle, { width: size, height: size }]}>
        <Ionicons 
          name="musical-notes" 
          size={size * 0.5} 
          color={theme.colors.primary} 
        />
      </View>
      {showText && <Text style={styles.logoText}>아이잉</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    backgroundColor: theme.colors.card,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    ...theme.shadows.default,
  },
  logoText: {
    ...theme.typography.largeTitle,
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
  }
});

export default Logo;
