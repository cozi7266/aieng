// components\common\wordcard\WordDetailModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../../../Theme";

interface WordDetailModalProps {
  visible: boolean;
  onClose: () => void;
  word: {
    id: string;
    wordEn: string;
    wordKo: string;
    imageUrl: string;
    pronunciation?: string;
    example?: string;
    exampleKo?: string;
    audioUrl?: string;
  } | null;
  onListenPress?: () => void;
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({
  visible,
  onClose,
  word,
  onListenPress,
}) => {
  if (!word) return null;

  const { width } = Dimensions.get("window");
  const modalWidth = width * 0.7; // 화면 너비의 70%

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.modalContainer, { width: modalWidth }]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.leftSection}>
              <Image
                source={{ uri: word.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.rightSection}>
              <View style={styles.header}>
                <Text style={styles.englishWord}>{word.wordEn}</Text>
                {word.pronunciation && (
                  <Text style={styles.pronunciation}>
                    /{word.pronunciation}/
                  </Text>
                )}
              </View>

              <Text style={styles.koreanWord}>{word.wordKo}</Text>

              {word.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>예문</Text>
                  <Text style={styles.example}>{word.example}</Text>
                  {word.exampleKo && (
                    <Text style={styles.exampleTranslation}>
                      {word.exampleKo}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.listenButton}
                onPress={onListenPress}
              >
                <AntDesign name="sound" size={24} color="white" />
                <Text style={styles.listenButtonText}>발음 듣기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    ...theme.shadows.default,
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.s,
    right: theme.spacing.s,
    zIndex: 1,
    padding: theme.spacing.xs,
  },
  content: {
    flexDirection: "row",
  },
  leftSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: theme.spacing.l,
  },
  rightSection: {
    flex: 2,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.borderRadius.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: theme.spacing.xs,
  },
  englishWord: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  pronunciation: {
    ...theme.typography.body,
    color: theme.colors.subText,
    marginBottom: 5,
  },
  koreanWord: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  exampleContainer: {
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: "rgba(156, 153, 242, 0.1)",
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  exampleLabel: {
    ...theme.typography.captionMedium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  example: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontStyle: "italic",
    marginBottom: theme.spacing.xs,
  },
  exampleTranslation: {
    ...theme.typography.caption,
    color: theme.colors.subText,
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignSelf: "flex-start",
    marginTop: theme.spacing.m,
  },
  listenButtonText: {
    ...theme.typography.button,
    color: "white",
    marginLeft: theme.spacing.xs,
  },
});

export default WordDetailModal;
