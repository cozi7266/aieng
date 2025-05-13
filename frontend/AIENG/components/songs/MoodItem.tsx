// components/song/MoodItem.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface MoodItemProps {
  id: string;
  name: string;
  emoji: string;
  isSelected: boolean;
  isAddButton?: boolean;
  onPress: () => void;
  style?: any;
  scaleFactor?: number;
}

const MoodItem: React.FC<MoodItemProps> = ({
  id,
  name,
  emoji,
  isSelected,
  isAddButton = false,
  onPress,
  style,
  scaleFactor = 1,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.moodItem,
        style,
        isSelected && styles.selectedItem,
        isAddButton && styles.addItem,
      ]}
      onPress={onPress}
    >
      {isAddButton ? (
        <FontAwesome5
          name="plus"
          size={24 * scaleFactor}
          color={theme.colors.primary}
        />
      ) : (
        <Text style={[styles.moodEmoji, { fontSize: 48 * scaleFactor }]}>
          {emoji}
        </Text>
      )}
      <Text
        style={[
          styles.moodName,
          { fontSize: theme.typography.caption.fontSize * scaleFactor },
          isAddButton && styles.addItemText,
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  moodItem: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.s,
    ...theme.shadows.default,
  },
  moodEmoji: {
    marginBottom: theme.spacing.xs,
  },
  moodName: {
    ...theme.typography.caption,
    color: theme.colors.text,
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
  addItemText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
});

export default MoodItem;
