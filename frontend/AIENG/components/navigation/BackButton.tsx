import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface BackButtonProps {
  onPress: () => void;
  style?: any;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <FontAwesome5 name="arrow-left" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.m,
    backgroundColor: "white",
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.default,
  },
});

export default BackButton;
