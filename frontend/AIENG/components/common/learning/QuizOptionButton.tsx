// components/common/learning/QuizOptionButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { theme } from "../../../Theme";

interface QuizOptionButtonProps {
  text: string;
  onPress: () => void;
  isSelected: boolean;
  isCorrect: boolean | null;
  isAnswered: boolean;
  isCorrectAnswer: boolean;
  scaleAnim: Animated.Value;
  disabled?: boolean;
}

const QuizOptionButton: React.FC<QuizOptionButtonProps> = ({
  text,
  onPress,
  isSelected,
  isCorrect,
  isAnswered,
  isCorrectAnswer,
  scaleAnim,
  disabled = false,
}) => {
  // 상태에 따른 배경색 가져오기
  const getBackgroundColor = () => {
    if (!isAnswered) {
      return theme.colors.card; // 기본 색상
    }

    if (isSelected) {
      return isCorrect ? "#A3E4D7" /* 연한 초록 */ : "#F5B7B1" /* 연한 빨강 */;
    }

    if (isCorrectAnswer) {
      return "#A3E4D7"; // 정답 표시
    }

    return theme.colors.card;
  };

  // 상태에 따른 테두리 색상 가져오기
  const getBorderColor = () => {
    if (!isAnswered) {
      return theme.colors.primary; // 기본 테두리
    }

    if (isSelected) {
      return isCorrect ? "#27AE60" /* 짙은 초록 */ : "#E74C3C" /* 짙은 빨강 */;
    }

    if (isCorrectAnswer) {
      return "#27AE60"; // 정답 테두리 표시
    }

    return theme.colors.primary;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
        onPress={onPress}
        disabled={disabled || isAnswered}
      >
        <Text style={styles.optionText}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    width: "49%",
    minWidth: 250, // 최소 너비 설정
    height: 80,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "0.5%", // 좌우 간격만 추가
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  optionText: {
    ...theme.typography.title,
    fontSize: 30,
    color: theme.colors.secondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.s,
  },
});

export default QuizOptionButton;
