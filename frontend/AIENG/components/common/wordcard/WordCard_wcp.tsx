// components\common\wordcard\WordCard_wcp.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { theme } from "../../../Theme";

interface WordCardProps {
  word: {
    id: string;
    wordEn: string;
    wordKo: string;
    imageUrl: string;
    isLearned: boolean;
  };
  onPress?: () => void;
}

const CARD_ASPECT_RATIO = 1.4; // 카드 비율 (높이/너비)
const CARD_WIDTH_PERCENTAGE = 0.15; // 화면 너비의 15%

const WordCard: React.FC<WordCardProps> = ({ word, onPress }) => {
  const { width } = Dimensions.get("window");
  const cardWidth = width * CARD_WIDTH_PERCENTAGE;
  const cardHeight = cardWidth * CARD_ASPECT_RATIO;

  if (!word.isLearned) {
    // 학습하지 않은 단어 카드 (비활성화 상태)
    return (
      <View
        style={[
          styles.container,
          styles.disabledCard,
          { width: cardWidth, height: cardHeight },
        ]}
      >
        <View style={styles.questionMarkContainer}>
          <Text style={styles.questionMark}>?</Text>
        </View>
        <Text style={styles.lockedText}>아직 배우지 않은 단어예요</Text>
      </View>
    );
  }

  // 학습한 단어 카드 (활성화 상태)
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.activeCard,
        { width: cardWidth, height: cardHeight },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: word.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.englishWord}>{word.wordEn}</Text>
        <Text style={styles.koreanWord}>{word.wordKo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    ...theme.shadows.default,
  },
  activeCard: {
    backgroundColor: theme.colors.card,
  },
  disabledCard: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "65%",
  },
  textContainer: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.card,
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
  },
  englishWord: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  koreanWord: {
    ...theme.typography.caption,
    color: theme.colors.subText,
    marginTop: 4,
  },
  questionMarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  questionMark: {
    ...theme.typography.title,
    color: "#999999",
  },
  lockedText: {
    ...theme.typography.caption,
    color: "#999999",
    marginTop: theme.spacing.s,
    textAlign: "center",
    paddingHorizontal: theme.spacing.s,
  },
});

export default WordCard;
