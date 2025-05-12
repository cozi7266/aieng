// components/song/VoiceItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface VoiceItemProps {
  id: string;
  name: string;
  imageUrl: any;
  isSelected: boolean;
  isAddButton?: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  scaleFactor?: number;
}

const VoiceItem: React.FC<VoiceItemProps> = ({
  id,
  name,
  imageUrl,
  isSelected,
  isAddButton = false,
  onPress,
  disabled = false,
  style,
  scaleFactor = 1,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.voiceItem,
        style,
        isSelected && styles.selectedItem,
        isAddButton && styles.addItem,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {isAddButton ? (
        <View style={styles.addIconContainer}>
          <FontAwesome5
            name={disabled ? "microphone" : "plus"}
            size={24 * scaleFactor}
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <Image
          source={imageUrl}
          style={styles.voiceImage}
          defaultSource={require("../../assets/icon.png")}
        />
      )}
      <Text
        style={[
          styles.voiceName,
          { fontSize: theme.typography.caption.fontSize * scaleFactor },
          isAddButton && styles.addItemText,
        ]}
      >
        {name}
      </Text>

      {!isAddButton && (
        <TouchableOpacity style={styles.playButton}>
          <FontAwesome5 name="play" size={16} color="white" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  voiceItem: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.default,
    position: "relative",
  },
  voiceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.s,
  },
  voiceName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: "center",
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  addItem: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  addIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderStyle: "dashed",
  },
  addItemText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  playButton: {
    position: "absolute",
    right: theme.spacing.s,
    bottom: theme.spacing.s,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VoiceItem;
