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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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

// 라우트 파라미터 타입 정의
type WordQuizParams = {
  wordId: string;
  themeId: string;
  theme: string;
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
        // API 지연 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 목업 데이터
        const mockWord =
          ["cat", "dog", "rabbit", "bird", "fish", "lion"][
            parseInt(wordId) - 1
          ] || "cat";

        const mockKorean =
          ["고양이", "강아지", "토끼", "새", "물고기", "사자"][
            parseInt(wordId) - 1
          ] || "고양이";

        // 오답 옵션 생성
        const allWords = ["cat", "dog", "rabbit", "bird", "fish", "lion"];
        const wrongOptions = allWords.filter((word) => word !== mockWord);

        // 무작위로 3개 오답 선택
        const shuffledWrong = wrongOptions
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        // 정답 추가 후 모든 옵션 섞기
        const allOptions = [...shuffledWrong, mockWord].sort(
          () => 0.5 - Math.random()
        );

        setCurrentQuestion({
          questionId: wordId,
          imageUrl: require("../../assets/images/themes/animals.png"), // 실제 이미지로 대체 필요
          correctAnswer: mockWord,
          options: allOptions,
          correctAnswerKorean: mockKorean,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch quiz data:", error);
        setError("퀴즈 데이터를 불러오는데 실패했습니다");
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [wordId]);

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
        e.data.action.payload?.name === "WordComplete"
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

  // 옵션 선택 처리
  const handleOptionSelect = (option: string, index: number) => {
    if (isAnswered) return; // 이미 답변했으면 선택 방지

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

  // 다음 화면으로 이동
  const handleContinue = () => {
    if (!isAnswered) return;

    navigation.navigate("WordSelect", {
      themeId: themeId,
      theme: themeName,
    });
  };

  // 노래 화면으로 이동하는 함수 추가
  const handleSongPress = () => {
    // 노래 화면으로 이동
    navigation.navigate("SongScreen", {
      themeId: themeId,
      theme: themeName,
      wordId: wordId,
    });
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
                onConfirm: () => navigation.navigate("Home"),
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
    padding: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
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
