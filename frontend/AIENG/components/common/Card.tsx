import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../Theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  variant = 'default' 
}) => {
  return (
    <View 
      style={[
        styles.card, 
        variant === 'outlined' && styles.outlinedCard,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    ...theme.shadows.default,
  },
  outlinedCard: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowOpacity: 0.08,
  }
});

export default Card;
