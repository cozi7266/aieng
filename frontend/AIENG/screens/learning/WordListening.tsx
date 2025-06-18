// screens/learning/WordListening.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../../App";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";
import HelpButton from "../../components/common/HelpButton";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useAudio } from "../../contexts/AudioContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationAlert } from "../../components/navigation/NavigationAlert";

// 라우트 파라미터 타입 정의
type WordListeningParams = {
  wordId: string;
  themeId: string;
  theme: string;
  sessionId: number;
};

type WordListeningScreenRouteProp = RouteProp<
  { WordListening: WordListeningParams },
  "WordListening"
>;

// API 응답 타입 정의
interface WordApiResponse {
  success: boolean;
  data: {
    wordId: number;
    wordEn: string;
    wordKo: string;
    wordImgUrl: string;
    wordTtsUrl: string;
    isLearned: boolean;
  };
  error: null | string;
}

// 단어 데이터 타입 정의
interface WordData {
  id: string;
  english: string;
  korean: string;
  imageUrl: string;
  audioUrl: string;
  isLearned: boolean;
}

const WordListeningScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WordListeningScreenRouteProp>();
  const { wordId, themeId, theme: themeName, sessionId } = route.params;
  const { stopBgm } = useAudio();

  const [word, setWord] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // 진행 단계 (1/2 표시를 위한 변수)
  const currentStep = 1;
  const totalSteps = 2;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const fillHeightAnim = useRef(new Animated.Value(0)).current;

  // 부드러운 플로팅 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 펄스 애니메이션
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

  // API 데이터 가져오기
  useEffect(() => {
    const fetchWordData = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("accessToken");
        const selectedChildId = await AsyncStorage.getItem("selectedChildId");

        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        if (!selectedChildId) {
          throw new Error("선택된 자녀 ID가 없습니다.");
        }

        const response = await axios.get<WordApiResponse>(
          `https://www.aieng.co.kr/api/words/${wordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Child-Id": selectedChildId,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (response.data.success) {
          const wordData = response.data.data;
          setWord({
            id: wordData.wordId.toString(),
            english: wordData.wordEn,
            korean: wordData.wordKo,
            imageUrl: wordData.wordImgUrl,
            audioUrl: wordData.wordTtsUrl,
            isLearned: wordData.isLearned,
          });
        } else {
          setError("단어 데이터를 불러오는데 실패했습니다");
        }
      } catch (error) {
        console.error("API 요청 실패:", error);
        setError("단어 데이터를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordData();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [wordId, themeId]);

  // 재생 버튼 애니메이션
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  // 다음 버튼 애니메이션
  useEffect(() => {
    if (hasListened) {
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
    }
  }, [hasListened]);

  // 세션 ID를 AsyncStorage에 저장
  useEffect(() => {
    if (sessionId) {
      AsyncStorage.setItem("currentSessionId", sessionId.toString());
    }
  }, [sessionId]);

  // 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // 다음 학습 단계로 이동 시에는 경고 표시 안 함
      if (
        e.data.action.type === "NAVIGATE" &&
        (e.data.action.payload?.name === "WordSentence" ||
          e.data.action.payload?.name === "WordSelect")
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

  // 오디오 재생/정지 처리
  const handlePlayAudio = async () => {
    try {
      if (isPlaying && sound.current) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (!word?.audioUrl) {
        throw new Error("오디오 URL이 없습니다");
      }

      setIsPlaying(true);

      // 기존 사운드가 있다면 해제
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }

      // 새로운 사운드 로드 및 재생
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: word.audioUrl },
        { shouldPlay: true }
      );

      sound.current = newSound;
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setIsCompleted(true);
        }
      });
    } catch (error) {
      console.error("오디오 재생 실패:", error);
      setIsPlaying(false);
    }
  };

  // 카드 재생 처리 (단순 재생만)
  const handleCardPlay = async () => {
    try {
      if (!word?.audioUrl) {
        throw new Error("오디오 URL이 없습니다");
      }

      // 기존 사운드가 있다면 해제
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }

      // 새로운 사운드 로드 및 재생
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: word.audioUrl },
        { shouldPlay: true }
      );

      sound.current = newSound;
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("오디오 재생 실패:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (hasListened) {
      // 색상이 아래에서 위로 차오름
      Animated.timing(fillHeightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false, // 높이 애니메이션은 native driver 지원 안됨
      }).start();
    } else {
      fillHeightAnim.setValue(0);
    }
  }, [hasListened]);

  // 발음 평가 시작
  const startPronunciationTest = async () => {
    try {
      setIsRecording(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setIsRecording(false);
        NavigationAlert.show({
          title: "마이크 권한 필요",
          message: "마이크 권한이 필요합니다.",
          confirmText: "확인",
          onConfirm: () => {},
        });
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {}
      }
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      setIsRecording(false);
      NavigationAlert.show({
        title: "녹음 오류",
        message: "녹음을 시작할 수 없습니다.",
        confirmText: "확인",
        onConfirm: () => {},
      });
    }
  };

  // 발음 평가 중지 및 평가
  const stopPronunciationTest = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      if (uri) await evaluatePronunciation(uri);
    } catch {
      NavigationAlert.show({
        title: "녹음 오류",
        message: "녹음을 중지할 수 없습니다.",
        confirmText: "확인",
        onConfirm: () => {},
      });
    }
  };

  // 발음 평가 API 호출
  const evaluatePronunciation = async (audioUri: string) => {
    try {
      setIsEvaluating(true);
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");
      if (!token || !selectedChildId || !word)
        throw new Error("인증 정보가 없습니다.");
      const formData = new FormData();
      formData.append("audio_file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);
      const apiResponse = await axios.post(
        `https://www.aieng.co.kr/api/voice/pronounce-test?expectedText=${encodeURIComponent(
          word.english
        )}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
        }
      );
      if (apiResponse.data) {
        const data = apiResponse.data.data;
        NavigationAlert.show({
          title: "발음 평가 결과",
          message: `인식된 단어: ${
            data.recognized_text || "인식되지 않음"
          }\n\n정확도: ${data.accuracy}%\n\n${data.feedback}`,
          confirmText: "확인",
          onConfirm: () => {},
        });
      }
    } catch (err: any) {
      NavigationAlert.show({
        title: "발음 평가 실패",
        message: err.message || "발음 평가에 실패했습니다.",
        confirmText: "확인",
        onConfirm: () => {},
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // 로딩 화면 표시
  if (isLoading || !word) {
    return <LoadingScreen message="단어를 불러오는 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() =>
              NavigationWarningAlert.show({
                onConfirm: () =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: "WordSelect",
                      params: {
                        themeId: themeId,
                        theme: themeName,
                      },
                    })
                  ),
              })
            }
          />
        </View>

        <View style={styles.logoTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={styles.themeName}>{themeName}</Text> - 단어 듣기
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <HelpButton
            onPress={() => setHelpModalVisible(true)}
            style={styles.headerButton}
          />
        </View>
      </View>

      {/* 듀오링고 스타일 진행 바 */}
      <View style={styles.duoProgressContainer}>
        <View
          style={[
            styles.duoProgressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {/* 배경 애니메이션 레이어 */}
      {hasListened && (
        <Animated.View
          style={[
            styles.fillBackground,
            {
              height: fillHeightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "25%"],
              }),
            },
          ]}
        />
      )}

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContainer}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: word?.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.wordInfo}>
              <View style={styles.wordRow}>
                <TouchableOpacity
                  onPress={handleCardPlay}
                  style={styles.soundIcon}
                >
                  <FontAwesome5
                    name="volume-up"
                    size={27}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.englishWord}>{word?.english}</Text>
                <TouchableOpacity
                  onPress={
                    isRecording ? stopPronunciationTest : startPronunciationTest
                  }
                  style={[
                    styles.playButton,
                    isRecording && styles.recordingButton,
                    { marginLeft: 8 },
                  ]}
                  disabled={isEvaluating}
                >
                  <FontAwesome5
                    name={isRecording ? "stop" : "microphone"}
                    size={27}
                    color={isRecording ? "#FF3B30" : theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.koreanWord}>({word?.korean})</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.controlsContainer}>
          {!hasListened ? (
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isCompleted && styles.playingButton,
                ]}
                onPress={
                  isCompleted ? () => setHasListened(true) : handlePlayAudio
                }
              >
                <FontAwesome5
                  name={isCompleted ? "check-circle" : "volume-up"}
                  size={32}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>
                  {isCompleted ? "완료" : "단어 듣기"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={() =>
                  navigation.navigate("WordSentence", {
                    wordId: word.id,
                    themeId: themeId,
                    theme: themeName,
                    sessionId: sessionId,
                  })
                }
              >
                <FontAwesome5
                  name="arrow-circle-right"
                  size={28}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>계속하기</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* 도움말 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={helpModalVisible}
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
                <FontAwesome5
                  name="times"
                  size={32}
                  color={theme.colors.buttonText}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 가이드</Text>
                <Text style={styles.helpText}>
                  단어를 보고 소리를 들어보세요! 단어의 올바른 발음을 익히는
                  것이 중요해요.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 팁</Text>
                <Text style={styles.helpText}>
                  단어를 눌러 여러 번 들어보고 발음을 따라해 보세요.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  },
  duoProgressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  // 메인 콘텐츠
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.l,
    paddingBottom: 0,
  },
  cardContainer: {
    width: "38%", // 원하는 너비로 조정
    height: 420, // 고정 높이 설정
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 25,
    padding: theme.spacing.l,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  imageContainer: {
    width: "80%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  image: {
    width: "90%",
    height: "90%",
  },
  wordInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
  englishWord: {
    ...theme.typography.largeTitle,
    color: theme.colors.primary,
    fontSize: 40,
    marginBottom: 6,
  },
  koreanWord: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontSize: 24,
  },
  // 버튼 영역
  controlsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginBottom: theme.spacing.l,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
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
  playingButton: {
    backgroundColor: theme.colors.secondary,
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
    zIndex: 0, // 기존 요소들보다 낮은 z-index
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  soundIcon: {
    padding: theme.spacing.s,
  },
  playButton: {
    padding: theme.spacing.s,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
  },
});

export default WordListeningScreen;
