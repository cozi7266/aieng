// components/common/BGMToggleButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAudio } from "../../contexts/AudioContext";
import { theme } from "../../Theme";

interface BGMToggleButtonProps {
  style?: any;
}

const BGMToggleButton: React.FC<BGMToggleButtonProps> = ({ style }) => {
  const { isBgmPlaying, toggleBgm } = useAudio();

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={toggleBgm}>
      <FontAwesome5
        name={isBgmPlaying ? "volume-up" : "volume-mute"}
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

export default BGMToggleButton;
