import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface CreateSongButtonProps {
  onPress: () => void;
}

const CreateSongButton: React.FC<CreateSongButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <FontAwesome5 name="plus" size={20} color="white" style={styles.icon} />
      <Text style={styles.text}>동요 만들기</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    ...theme.shadows.default,
  },
  icon: {
    marginRight: theme.spacing.s,
  },
  text: {
    ...theme.typography.button,
    color: "white",
  },
});

export default CreateSongButton;
