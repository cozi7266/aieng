// components/home/MenuCard.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../Card';
import { theme } from '../../../Theme';

interface MenuCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  style?: any;
}

const { width } = Dimensions.get('window');
// 태블릿 화면 크기에 따른 카드 크기 계산 (갤럭시 탭 A9+ 기준)
const cardWidth = Math.min(width * 0.25, 400); // 화면 너비의 25%, 최대 400px
const iconSize = Math.min(width * 0.06, 100); // 화면 너비의 6%, 최대 100px

const MenuCard: React.FC<MenuCardProps> = ({ title, icon, onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Card style={[styles.card, { width: cardWidth, height: cardWidth * 1.15 }]}>
        <FontAwesome5 
          name={icon} 
          size={iconSize}
          color={theme.colors.primary} 
        />
        <Text style={styles.title}>{title}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    margin: theme.spacing.l,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    textAlign: 'center',
  },
});

export default MenuCard;
