// components/home/MenuCard.tsx
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  ViewStyle,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Card from "../Card";
import { theme } from "../../../Theme";

interface MenuCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
}

const { width } = Dimensions.get("window");
// 태블릿 화면 크기에 따른 카드 크기 계산
const cardWidth = Math.min(width * 0.25, 350);
const iconSize = Math.min(width * 0.09, 90);

const MenuCard: React.FC<MenuCardProps> = ({ title, icon, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Card
        style={{
          ...styles.card,
          width: cardWidth,
          height: cardWidth * 1.15,
        }}
      >
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
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    textAlign: "center",
  },
});

export default MenuCard;
