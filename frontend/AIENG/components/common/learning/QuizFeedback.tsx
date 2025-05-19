// components/common/learning/QuizFeedback.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../../Theme";

interface QuizFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  correctAnswerKorean: string;
  onSongPress: () => void; // 다음 문제 또는 노래 화면으로 이동하기 위한 함수
  buttonText?: string; // 버튼 텍스트
  isLastQuestion?: boolean; // 마지막 문제인지 여부
}

const QuizFeedback: React.FC<QuizFeedbackProps> = ({
  isCorrect,
  correctAnswer,
  correctAnswerKorean,
  onSongPress,
  buttonText = "동요 만들기",
  isLastQuestion = false,
}) => {
  // 애니메이션 값 설정
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
          backgroundColor: isCorrect
            ? "rgba(213, 245, 227, 0.95)"
            : "rgba(250, 219, 216, 0.95)",
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isCorrect ? "#D5F5E3" : "#FADBD8" },
          ]}
        >
          <FontAwesome5
            name={isCorrect ? "check-circle" : "times-circle"}
            size={40}
            color={isCorrect ? "#27AE60" : "#E74C3C"}
          />
        </View>
        <Text
          style={[
            styles.feedbackText,
            { color: isCorrect ? "#27AE60" : "#E74C3C" },
          ]}
        >
          {isCorrect
            ? "정답이에요! 👏"
            : `아쉬워요. 정답은 "${correctAnswer}" ${
                correctAnswerKorean ? `(${correctAnswerKorean})` : ""
              } 입니다.`}
        </Text>
      </View>

      {/* 버튼 - 다음 문제 또는 동요 만들기 */}
      <TouchableOpacity
        style={styles.songButton}
        onPress={onSongPress}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name={isLastQuestion ? "music" : "arrow-right"}
          size={20}
          color={theme.colors.buttonText}
        />
        <Text style={styles.songButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.large,
    maxWidth: "90%",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: "#CCC",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.m,
  },
  feedbackText: {
    ...theme.typography.bodyMedium,
    fontSize: 26,
    fontWeight: "bold",
    flex: 1,
  },
  songButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.pill,
    marginLeft: theme.spacing.l,
    ...theme.shadows.default,
  },
  songButtonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default QuizFeedback;
