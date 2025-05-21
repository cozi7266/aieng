// screens/learning/WordQuiz.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";
import BGMToggleButton from "../../components/common/BGMToggleButton";
import ProfileButton from "../../components/common/ProfileButton";
import HelpButton from "../../components/common/HelpButton";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useAudio } from "../../contexts/AudioContext";
import QuizOptionButton from "../../components/common/learning/QuizOptionButton";
import QuizFeedback from "../../components/common/learning/QuizFeedback";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationAlert from "../../components/navigation/NavigationAlert";

// 새로운 API 응답 타입 정의
interface QuizQuestionResponse {
  quizQuestionId: number;
  ansWord: string;
  ansImageUrl: string;
  ch1Word: string;
  ch2Word: string;
  ch3Word: string;
  ch4Word: string;
  ansChId: number;
  isCompleted: boolean;
}

interface QuizResponse {
  success: boolean;
  data: {
    quizId: number | null;
    createdAt: string;
    questions: QuizQuestionResponse[];
    isCompleted: boolean;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// 퀴즈 데이터 타입 정의
interface QuizQuestion {
  questionId: number;
  imageUrl: any;
  correctAnswer: string;
  options: string[];
  correctAnswerIndex: number; // 정답 선택지 인덱스 (1-4)
  correctAnswerKorean: string;
}

const WordQuizScreen: React.FC = () => {
  // 상태 변수들
  const navigation = useNavigation();
  const route = useRoute<
    RouteProp<
      {
        WordQuiz: {
          wordId: string;
          themeId: string;
          theme: string;
          sessionId: string;
        };
      },
      "WordQuiz"
    >
  >();
  const { wordId, themeId, theme: themeName, sessionId } = route.params;
  const { stopBgm } = useAudio();

  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // 퀴즈 단계 계산 (1/4, 2/4, 3/4, 4/4)
  const totalSteps = 4;
  const currentStep = currentQuestionIndex + 1;
  const progressPercentage = (currentStep / totalSteps) * 100;
  const isLastQuestion = currentStep === totalSteps;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const optionScaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  // 퀴즈 데이터 가져오기
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem("accessToken");
        const selectedChildId = await AsyncStorage.getItem("selectedChildId");

        if (!token || !selectedChildId) {
          throw new Error("인증 정보가 없습니다.");
        }

        // 새로운 API 엔드포인트로 모든 퀴즈 문제 가져오기
        const response = await axios.get<QuizResponse>(
          `https://www.aieng.co.kr/api/quiz/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Child-Id": selectedChildId,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("[퀴즈 API 응답 정보]");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data) {
          const quizData = response.data.data;
          console.log("\n[퀴즈 완료 상태]");
          console.log("전체 퀴즈 완료 여부:", quizData.isCompleted);

          // 퀴즈가 이미 완료된 경우
          if (quizData.isCompleted) {
            NavigationAlert.show({
              title: "퀴즈 완료",
              message: "이미 퀴즈를 완료했습니다. 학습 화면으로 돌아갑니다.",
              confirmText: "확인",
              onConfirm: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "LearningScreen" }],
                  })
                );
              },
            });
            return;
          }

          const quizQuestions = quizData.questions.map((q) => ({
            questionId: q.quizQuestionId,
            imageUrl: { uri: q.ansImageUrl },
            correctAnswer: q.ansWord,
            options: [q.ch1Word, q.ch2Word, q.ch3Word, q.ch4Word],
            correctAnswerIndex: q.ansChId,
            correctAnswerKorean: "",
          }));

          console.log("\n[변환된 퀴즈 문제 정보]");
          console.log("총 문제 수:", quizQuestions.length);
          quizQuestions.forEach((q, index) => {
            console.log(`\n[${index + 1}번째 문제]`);
            console.log("문제 ID:", q.questionId);
            console.log("정답 단어:", q.correctAnswer);
            console.log("이미지 URL:", q.imageUrl.uri);
            console.log("선택지:", q.options);
            console.log("정답 선택지 번호:", q.correctAnswerIndex);
            console.log(
              "문제 완료 여부:",
              quizData.questions[index].isCompleted
            );
          });

          setAllQuestions(quizQuestions);
        } else {
          throw new Error(
            response.data.error?.message ||
              "퀴즈 데이터를 불러오는데 실패했습니다."
          );
        }
      } catch (error: any) {
        console.error("[퀴즈 API 에러]", error);
        setError(
          error.response?.data?.error?.message ||
            error.message ||
            "퀴즈를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [sessionId]);

  // 정답 제출 함수
  const submitAnswer = async (questionId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token || !selectedChildId) {
        console.error("토큰 또는 자녀 ID가 없습니다.");
        return false;
      }

      // 현재 문제의 정답 인덱스 가져오기
      const currentQuestion = allQuestions[currentQuestionIndex];

      // 정답 인덱스를 사용하여 항상 정답으로 제출
      await axios.post(
        "https://www.aieng.co.kr/api/quiz/submit",
        {
          quizQuestionId: questionId,
          selectedChoiceId: currentQuestion.correctAnswerIndex,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
          },
        }
      );

      return true;
    } catch (error) {
      console.error("정답 제출 중 오류 발생:", error);
      return false;
    }
  };

  // 다음 문제로 이동 또는 노래 화면으로 이동
  const handleContinue = async () => {
    if (!isAnswered) return;

    const currentQuestion = allQuestions[currentQuestionIndex];

    // 문제 정답 제출
    await submitAnswer(currentQuestion.questionId);

    // 마지막 문제가 아니면 다음 문제로 이동
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setIsAnswered(false);
    }
  };

  // 노래 화면으로 이동
  const handleSongPress = async () => {
    // 마지막 문제의 경우 정답 제출 후 노래 화면으로 이동
    if (isLastQuestion && isAnswered) {
      const currentQuestion = allQuestions[currentQuestionIndex];
      await submitAnswer(currentQuestion.questionId);

      navigation.dispatch(
        CommonActions.navigate({
          name: "SongSettingScreen",
        })
      );
    }
  };

  // 옵션 선택 처리
  const handleOptionSelect = (option: string, index: number) => {
    if (isAnswered) return; // 이미 답변했으면 선택 방지

    const currentQuestion = allQuestions[currentQuestionIndex];
    setSelectedOption(option);
    setIsCorrect(option === currentQuestion.correctAnswer);
    setIsAnswered(true);

    // 선택한 옵션 애니메이션
    Animated.sequence([
      Animated.timing(optionScaleAnims[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(optionScaleAnims[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 로딩 화면
  if (isLoading || allQuestions.length === 0) {
    return <LoadingScreen message="퀴즈를 준비하고 있어요..." />;
  }

  const currentQuestion = allQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() =>
              NavigationWarningAlert.show({
                onConfirm: () =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: "Home",
                    })
                  ),
              })
            }
          />
        </View>
        <View style={styles.logoTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={styles.themeName}>{themeName}</Text> - 단어 퀴즈
          </Text>
        </View>
        <View style={styles.headerButtons}>
          {/* <BGMToggleButton style={styles.headerButton} /> */}
          {/* <ProfileButton style={styles.headerButton} /> */}
          <HelpButton
            onPress={() => setHelpModalVisible(true)}
            style={styles.headerButton}
          />
        </View>
      </View>

      {/* 진행 바 */}
      <View style={styles.duoProgressContainer}>
        <View
          style={[styles.duoProgressFill, { width: `${progressPercentage}%` }]}
        />
      </View>

      {/* 피드백 오버레이 */}
      {isAnswered && (
        <View style={styles.feedbackOverlayContainer}>
          <QuizFeedback
            isCorrect={isCorrect ?? false}
            correctAnswer={currentQuestion.correctAnswer}
            correctAnswerKorean={currentQuestion.correctAnswerKorean}
            onSongPress={isLastQuestion ? handleSongPress : handleContinue}
            buttonText={isLastQuestion ? "동요 만들기" : "다음 문제"}
            isLastQuestion={isLastQuestion}
          />
        </View>
      )}

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContainer}>
        {/* 이미지 컨테이너 */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={currentQuestion.imageUrl}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        {/* 옵션 컨테이너 */}
        <View style={styles.optionsContainer}>
          {[0, 1].map((row) => (
            <View key={`row-${row}`} style={styles.optionRow}>
              {[0, 1].map((col) => {
                const index = row * 2 + col;
                if (index < currentQuestion.options.length) {
                  const option = currentQuestion.options[index];
                  return (
                    <QuizOptionButton
                      key={`option-${index}`}
                      text={option}
                      onPress={() => handleOptionSelect(option, index)}
                      isSelected={selectedOption === option}
                      isCorrect={
                        isAnswered
                          ? option === currentQuestion.correctAnswer
                          : null
                      }
                      isAnswered={isAnswered}
                      isCorrectAnswer={option === currentQuestion.correctAnswer}
                      scaleAnim={optionScaleAnims[index]}
                    />
                  );
                }
                return null;
              })}
            </View>
          ))}
        </View>
      </View>

      {/* 도움말 모달 */}
      <Modal
        visible={helpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학습 도움말</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHelpModalVisible(false)}
              >
                <FontAwesome5 name="times" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>단어 퀴즈 가이드</Text>
                <Text style={styles.helpText}>
                  그림을 보고 어떤 단어인지 맞춰보세요! 4개의 선택지 중에서
                  그림에 해당하는 단어를 선택하세요.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 팁</Text>
                <Text style={styles.helpText}>
                  오답을 선택해도 괜찮아요. 정답을 확인하고 다음 문제로 넘어가
                  보세요. 퀴즈를 통해 단어를 더 잘 기억할 수 있답니다!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    ...theme.shadows.default,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  logoTitleContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...theme.typography.accent,
    color: theme.colors.secondary,
    fontSize: 40,
    marginBottom: theme.spacing.s,
  },
  themeName: {
    color: theme.colors.primary,
  },
  headerButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerButton: {
    marginLeft: theme.spacing.m,
  },
  duoProgressContainer: {
    height: 12,
    backgroundColor: "#E5E5E5",
    width: "100%",
    zIndex: 10,
  },
  duoProgressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  feedbackOverlayContainer: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
    paddingBottom: 0,
  },
  imageContainer: {
    width: 500,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.xxl,
    ...theme.shadows.default,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  image: {
    width: "85%",
    height: "85%",
  },
  optionsContainer: {
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.xl,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing.l,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "60%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    ...theme.shadows.default,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  modalTitle: {
    color: theme.colors.buttonText,
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: theme.spacing.l,
  },
  helpSection: {
    marginBottom: theme.spacing.l,
  },
  helpSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  helpText: {
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 26,
  },
});

export default WordQuizScreen;
