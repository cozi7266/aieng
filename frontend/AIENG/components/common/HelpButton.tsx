// components/common/HelpButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface HelpButtonProps {
  onPress: () => void;
  style?: any;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <FontAwesome5
        name="question-circle"
        size={32}
        color={theme.colors.primary}
      />
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

export default HelpButton;
