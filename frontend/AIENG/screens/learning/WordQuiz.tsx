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

// API 응답 타입 정의
interface QuizQuestionResponse {
  id: number;
  ans_word: string;
  ans_image_url: string;
  ch1_word: string;
  ch2_word: string;
  ch3_word: string;
  ch4_word: string;
  ans_ch_id: number;
}

interface QuizResponse {
  success: boolean;
  data: {
    id: number;
    session_id: number;
    created_at: string;
    questions: QuizQuestionResponse[];
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// 라우트 파라미터 타입 정의
type WordQuizParams = {
  wordId: string;
  themeId: string;
  theme: string;
  sessionId: string;
};

type WordQuizScreenRouteProp = RouteProp<
  { WordQuiz: WordQuizParams },
  "WordQuiz"
>;

// 퀴즈 데이터 타입 정의
interface QuizQuestion {
  questionId: string;
  imageUrl: any;
  correctAnswer: string;
  options: string[];
  correctAnswerKorean: string;
}

const WordQuizScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WordQuizScreenRouteProp>();
  const { wordId, themeId, theme: themeName } = route.params;
  const { stopBgm } = useAudio();

  // 상태 변수
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionResponse[]>(
    []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 진행 단계 (3/3 표시)
  const currentStep = 3;
  const totalSteps = 3;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const fillHeightAnim = useRef(new Animated.Value(0)).current;
  const optionScaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  // 이미지 펄스 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 배경 음악 중지
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      stopBgm();
    });
    return unsubscribe;
  }, [navigation, stopBgm]);

  // 퀴즈 데이터 가져오기
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem("accessToken");
        const selectedChildId = await AsyncStorage.getItem("selectedChildId");

        console.log("[퀴즈 API 요청 정보]");
        console.log(
          "URL:",
          `https://www.aieng.co.kr/api/quiz/create/${route.params.sessionId}`
        );
        console.log("Headers:", {
          Authorization: `Bearer ${token}`,
          "X-Child-Id": selectedChildId,
          "Content-Type": "application/json",
        });

        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        if (!selectedChildId) {
          throw new Error("선택된 자녀 ID가 없습니다.");
        }

        const response = await axios.post<QuizResponse>(
          `https://www.aieng.co.kr/api/quiz/create/${route.params.sessionId}`,
          {},
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
          setQuizQuestions(response.data.data.questions);
          const firstQuestion = response.data.data.questions[0];
          console.log("[첫 번째 퀴즈 문제 정보]");
          console.log("문제 ID:", firstQuestion.id);
          console.log("정답 단어:", firstQuestion.ans_word);
          console.log("이미지 URL:", firstQuestion.ans_image_url);
          console.log("선택지:", {
            ch1: firstQuestion.ch1_word,
            ch2: firstQuestion.ch2_word,
            ch3: firstQuestion.ch3_word,
            ch4: firstQuestion.ch4_word,
          });
          console.log("정답 선택지 번호:", firstQuestion.ans_ch_id);

          setCurrentQuestion({
            questionId: firstQuestion.id.toString(),
            imageUrl: { uri: firstQuestion.ans_image_url },
            correctAnswer: firstQuestion.ans_word,
            options: [
              firstQuestion.ch1_word,
              firstQuestion.ch2_word,
              firstQuestion.ch3_word,
              firstQuestion.ch4_word,
            ],
            correctAnswerKorean: "", // API에서 한글 단어 정보가 없으므로 빈 문자열로 설정
          });
        } else {
          throw new Error(
            response.data.error?.message ||
              "퀴즈 데이터를 불러오는데 실패했습니다."
          );
        }
      } catch (error: any) {
        console.error("[퀴즈 API 에러 정보]");
        console.error("Message:", error.message);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", JSON.stringify(error.response.data, null, 2));
          setError(
            `서버 오류: ${error.response.status} - ${
              error.response.data.error?.message || "알 수 없는 오류"
            }`
          );
        } else if (error.request) {
          console.error("Request:", error.request);
          setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
        } else {
          console.error("Config:", error.config);
          setError(error.message || "요청 처리 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [route.params.sessionId]);

  // 다음 버튼 애니메이션
  useEffect(() => {
    if (isAnswered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(nextButtonAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(nextButtonAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(fillHeightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      fillHeightAnim.setValue(0);
    }
  }, [isAnswered]);

  // 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  // 네비게이션 이벤트 처리
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // 다음 학습 단계로 이동 시에는 경고 표시 안 함
      if (
        e.data.action.type === "NAVIGATE" &&
        (e.data.action.payload?.name === "WordComplete" ||
          e.data.action.payload?.name === "Home")
      ) {
        return;
      }

      // 기본 내비게이션 방지
      e.preventDefault();

      // 경고 표시
      NavigationWarningAlert.show({
        onConfirm: () => {
          navigation.dispatch(e.data.action);
        },
      });
    });

    return unsubscribe;
  }, [navigation]);

  // 다음 문제로 이동
  const handleContinue = () => {
    if (!isAnswered) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = quizQuestions[nextIndex];
      console.log(`[${nextIndex + 1}번째 퀴즈 문제 정보]`);
      console.log("문제 ID:", nextQuestion.id);
      console.log("정답 단어:", nextQuestion.ans_word);
      console.log("이미지 URL:", nextQuestion.ans_image_url);
      console.log("선택지:", {
        ch1: nextQuestion.ch1_word,
        ch2: nextQuestion.ch2_word,
        ch3: nextQuestion.ch3_word,
        ch4: nextQuestion.ch4_word,
      });
      console.log("정답 선택지 번호:", nextQuestion.ans_ch_id);

      setCurrentQuestion({
        questionId: nextQuestion.id.toString(),
        imageUrl: { uri: nextQuestion.ans_image_url },
        correctAnswer: nextQuestion.ans_word,
        options: [
          nextQuestion.ch1_word,
          nextQuestion.ch2_word,
          nextQuestion.ch3_word,
          nextQuestion.ch4_word,
        ],
        correctAnswerKorean: "", // API에서 한글 단어 정보가 없으므로 빈 문자열로 설정
      });
      setSelectedOption(null);
      setIsCorrect(null);
      setIsAnswered(false);
    } else {
      console.log("[퀴즈 완료]");
      console.log("총 문제 수:", quizQuestions.length);
      console.log(
        "마지막 문제 ID:",
        quizQuestions[quizQuestions.length - 1].id
      );

      // 모든 문제를 풀었을 때
      navigation.dispatch(
        CommonActions.navigate({
          name: "WordComplete",
          params: {
            themeId: themeId,
            theme: themeName,
          },
        })
      );
    }
  };

  // 옵션 선택 처리
  const handleOptionSelect = (option: string, index: number) => {
    if (isAnswered) return; // 이미 답변했으면 선택 방지

    console.log("[사용자 답변 정보]");
    console.log("선택한 답:", option);
    console.log("선택지 번호:", index + 1);
    console.log("정답:", currentQuestion?.correctAnswer);
    console.log("정답 여부:", option === currentQuestion?.correctAnswer);

    setSelectedOption(option);
    const correct = option === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
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

  // 노래 화면으로 이동하는 함수 - React Navigation 6에 맞게 수정
  const handleSongPress = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "SongSettingScreen",
      })
    );
  };

  // 로딩 화면
  if (isLoading || !currentQuestion) {
    return <LoadingScreen message="퀴즈를 준비하고 있어요..." />;
  }

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
          <BGMToggleButton style={styles.headerButton} />
          <ProfileButton style={styles.headerButton} />
          <HelpButton
            onPress={() => setHelpModalVisible(true)}
            style={styles.headerButton}
          />
        </View>
      </View>

      {/* 진행 바 */}
      <View style={styles.duoProgressContainer}>
        <View
          style={[
            styles.duoProgressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {/* 피드백 오버레이 - z축으로 상단에 표시 */}
      {isAnswered && (
        <View style={styles.feedbackOverlayContainer}>
          <QuizFeedback
            isCorrect={isCorrect}
            correctAnswer={currentQuestion.correctAnswer}
            correctAnswerKorean={currentQuestion.correctAnswerKorean}
            onSongPress={handleSongPress}
          />
        </View>
      )}

      {/* 배경 애니메이션 레이어 */}
      {isAnswered && (
        <Animated.View
          style={[
            styles.fillBackground,
            {
              height: fillHeightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
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

        {/* 컨트롤 버튼 */}
        <View style={styles.controlsContainer}>
          <Animated.View
            style={{
              transform: [{ scale: isAnswered ? nextButtonAnim : 1 }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                isAnswered ? styles.continueButton : styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!isAnswered}
            >
              <FontAwesome5
                name="arrow-right"
                size={20}
                color={theme.colors.buttonText}
              />
              <Text style={styles.buttonText}>계속하기</Text>
            </TouchableOpacity>
          </Animated.View>
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
  // 헤더 스타일
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
  // 진행 바
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
  // 피드백 오버레이 컨테이너
  feedbackOverlayContainer: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  // 메인 콘텐츠
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
  controlsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.m,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 220,
    ...theme.shadows.default,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  continueButton: {
    backgroundColor: theme.colors.secondary,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.7,
  },
  // 모달 스타일
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
  fillBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(81, 75, 242, 0.15)",
    zIndex: 0,
  },
});

export default WordQuizScreen;
