// components/song/MoodEmojiPicker.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { theme } from "../../Theme";

interface MoodEmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: string) => void;
}

// 분위기 관련 이모지 모음
const MOOD_EMOJIS = [
  "😊",
  "😄",
  "😁",
  "😆",
  "🥰",
  "😍",
  "🤗",
  "😀",
  "😃",
  "😢",
  "😭",
  "😞",
  "😔",
  "🥺",
  "😕",
  "😟",
  "😥",
  "😓",
  "😮",
  "😯",
  "😲",
  "😳",
  "🙀",
  "😱",
  "😨",
  "😧",
  "😦",
  "😠",
  "😡",
  "🤬",
  "😤",
  "😾",
  "👿",
  "💢",
  "👹",
  "👺",
  "🥳",
  "🎉",
  "🎊",
  "✨",
  "🎇",
  "🎆",
  "🤩",
  "🌟",
  "⭐",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "💕",
  "💞",
  "💓",
];

const MoodEmojiPicker: React.FC<MoodEmojiPickerProps> = ({
  visible,
  onClose,
  onEmojiSelected,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>분위기 이모지 선택</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={MOOD_EMOJIS}
            keyExtractor={(item, index) => `emoji-${index}`}
            numColumns={6}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.emojiItem}
                onPress={() => {
                  onEmojiSelected(item);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.emojiGrid}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    height: "70%",
    backgroundColor: "white",
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.default,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    ...theme.typography.subTitle,
    color: "white",
  },
  closeButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    backgroundColor: "white",
    borderRadius: theme.borderRadius.pill,
  },
  closeButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
    fontSize: 20,
  },
  emojiGrid: {
    padding: theme.spacing.m,
  },
  emojiItem: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    margin: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
  },
  emoji: {
    fontSize: 40,
  },
});

export default MoodEmojiPicker;
