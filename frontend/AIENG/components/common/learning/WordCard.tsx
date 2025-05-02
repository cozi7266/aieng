// components/common/learning/WordCard.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";
import { theme } from "../../../Theme";

interface WordCardProps {
  english: string;
  korean: string;
  image?: any; // 이미지 리소스
  isLearned: boolean;
  isFlipped: boolean; // 카드 뒤집힘 상태
  onPress: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
  english,
  korean,
  image,
  isLearned,
  isFlipped,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isLearned && styles.learnedCard,
        isFlipped && styles.flippedCard, // 선택된 카드 스타일
      ]}
      onPress={onPress}
      disabled={isLearned} // 학습 완료된 카드만 비활성화
      activeOpacity={isLearned ? 1 : 0.7}
    >
      {!isFlipped ? (
        // 카드가 뒤집히지 않은 상태 - 이미지만 표시
        <Image source={image} style={styles.cardImage} resizeMode="cover" />
      ) : (
        // 카드가 뒤집힌 상태 - 단어와 뜻 표시
        <View style={styles.cardContent}>
          <Text style={[styles.englishText, isLearned && styles.learnedText]}>
            {english}
          </Text>
          <Text style={[styles.koreanText, isLearned && styles.learnedText]}>
            ({korean})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  learnedCard: {
    backgroundColor: "#E0E0E0",
    borderColor: "#AAAAAA",
    opacity: 0.7,
  },
  flippedCard: {
    borderColor: theme.colors.secondary,
    borderWidth: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.m,
  },
  englishText: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  koreanText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
  },
  learnedText: {
    color: "#888888",
  },
});

export default WordCard;
