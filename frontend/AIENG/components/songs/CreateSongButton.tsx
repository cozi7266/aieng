import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface CreateSongButtonProps {
  onPress: () => void;
  style?: any;
  scaleFactor?: number;
}

const CreateSongButton: React.FC<CreateSongButtonProps> = ({
  onPress,
  style,
  scaleFactor = 1,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <FontAwesome5 name="cog" size={32} color={theme.colors.primary} />
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

export default CreateSongButton;
