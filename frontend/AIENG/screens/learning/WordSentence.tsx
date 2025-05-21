// screens/learning/WordSentence.tsx
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
  NavigationAction,
} from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";
import HelpButton from "../../components/common/HelpButton";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useAudio } from "../../contexts/AudioContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { NavigationAlert } from "../../components/navigation/NavigationAlert";

// 라우트 파라미터 타입 정의
type WordSentenceParams = {
  wordId: string;
  themeId: string;
  theme: string;
  sessionId: number;
};

type WordSentenceScreenRouteProp = RouteProp<
  { WordSentence: WordSentenceParams },
  "WordSentence"
>;

// API 응답 타입 정의
interface SentenceApiResponse {
  success: boolean;
  data: {
    word: string;
    sentence: string;
    translation: string;
    image_url: string;
    audio_url: string;
    cached_at: string;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// 단어 및 문장 데이터 타입 정의
interface SentenceData {
  id: string;
  word: string; // 강조할 단어
  sentence: string;
  sentenceKorean: string;
  imageUrl: any;
  audioUrl: string;
}

// 네비게이션 액션 타입 정의
type NavigationActionWithPayload = NavigationAction & {
  payload?: {
    name: string;
    params?: any;
  };
};

const WordSentenceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WordSentenceScreenRouteProp>();
  const { wordId, themeId, theme: themeName, sessionId } = route.params;
  const { stopBgm } = useAudio();

  const [sentence, setSentence] = useState<SentenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<{
    recognized_text: string;
    expected_text: string;
    accuracy: number;
    confidence: number;
    feedback: string;
  } | null>(null);

  // 진행 단계 (2/2 표시를 위한 변수)
  const currentStep = 2;
  const totalSteps = 2;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const fillHeightAnim = useRef(new Animated.Value(0)).current;

  // 애니메이션 설정
  useEffect(() => {
    // 플로팅 애니메이션
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

    // 펄스 애니메이션
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
    const fetchSentenceData = async () => {
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

        if (!sessionId) {
          throw new Error("세션 ID가 없습니다.");
        }

        console.log("[세션 ID 확인]", sessionId);
        console.log("[단어 ID 확인]", wordId);

        // 먼저 단어 정보를 가져옵니다
        console.log("[단어 정보 API 요청]");
        const wordUrl = `https://www.aieng.co.kr/api/words/${wordId}`;
        console.log("URL:", wordUrl);
        console.log("Headers:", {
          Authorization: `Bearer ${token}`,
          "X-Child-Id": selectedChildId,
          "Content-Type": "application/json",
        });

        const wordResponse = await axios.get(wordUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
          },
        });

        console.log("[단어 정보 API 응답]");
        console.log("Status:", wordResponse.status);
        console.log("Data:", JSON.stringify(wordResponse.data, null, 2));

        if (!wordResponse.data.success) {
          throw new Error("단어 정보를 가져오는데 실패했습니다.");
        }

        const wordData = wordResponse.data.data;
        setCurrentWord(wordData.wordEn);

        // 문장 생성 API 요청
        console.log("[문장 생성 API 요청]");
        const sentenceUrl = `https://www.aieng.co.kr/api/learning/sessions/${sessionId}/words/${wordData.wordEn}/generation`;
        console.log("URL:", sentenceUrl);
        console.log("Headers:", {
          Authorization: `Bearer ${token}`,
          "X-Child-Id": selectedChildId,
          "Content-Type": "application/json",
        });
        console.log("Path Variables:", {
          sessionId,
          wordEn: wordData.wordEn,
        });

        const response = await axios.post<SentenceApiResponse>(
          sentenceUrl,
          {}, // 빈 body
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Child-Id": selectedChildId,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("[문장 생성 API 응답]");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data) {
          const sentenceData = response.data.data;
          setSentence({
            id: wordId,
            word: sentenceData.word,
            sentence: sentenceData.sentence,
            sentenceKorean: sentenceData.translation,
            imageUrl: { uri: sentenceData.image_url },
            audioUrl: sentenceData.audio_url,
          });
        } else {
          throw new Error(
            response.data.error?.message ||
              "문장 데이터를 불러오는데 실패했습니다"
          );
        }
      } catch (error: any) {
        console.error("[API 에러 상세 정보]");
        if (error.response) {
          // 서버가 응답을 반환한 경우
          console.error("Status:", error.response.status);
          console.error("Data:", JSON.stringify(error.response.data, null, 2));
          console.error(
            "Headers:",
            JSON.stringify(error.response.headers, null, 2)
          );
        } else if (error.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          console.error("Request:", error.request);
        } else {
          // 요청 설정 중 에러가 발생한 경우
          console.error("Error Message:", error.message);
        }
        console.error("Config:", JSON.stringify(error.config, null, 2));

        setError(
          error.response?.data?.error?.message ||
            error.message ||
            "문장 데이터를 불러오는데 실패했습니다"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentenceData();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [wordId, themeId, sessionId]);

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

  // 다음 버튼 애니메이션 및 배경 채우기 애니메이션
  useEffect(() => {
    if (hasListened) {
      // 다음 버튼 애니메이션
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

      // 배경 채우기 애니메이션
      Animated.timing(fillHeightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      fillHeightAnim.setValue(0);
    }
  }, [hasListened]);

  // 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  // React Navigation의 beforeRemove 이벤트 처리 (useEffect 추가)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const action = e.data.action as NavigationActionWithPayload;
      if (action.type === "NAVIGATE" && action.payload?.name === "WordSelect") {
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

      if (!sentence?.audioUrl) {
        throw new Error("오디오 URL이 없습니다");
      }

      setIsPlaying(true);

      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: sentence.audioUrl },
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

  // 문장 카드 재생 처리 (단순 재생만)
  const handleCardPlay = async () => {
    try {
      if (!sentence?.audioUrl) {
        throw new Error("오디오 URL이 없습니다");
      }

      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: sentence.audioUrl },
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

  // 문장에서 단어 하이라이트 처리
  const renderHighlightedSentence = () => {
    if (!sentence) return null;

    const parts = sentence.sentence.split(
      new RegExp(`(${sentence.word})`, "i")
    );

    return (
      <TouchableOpacity onPress={handleCardPlay}>
        <Text style={styles.sentenceText}>
          {parts.map((part, index) =>
            part.toLowerCase() === sentence.word.toLowerCase() ? (
              <Text key={index} style={styles.highlightedWord}>
                {part}
              </Text>
            ) : (
              <Text key={index}>{part}</Text>
            )
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  // 발음 평가 시작
  const startPronunciationTest = async () => {
    try {
      setError(null);
      setIsRecording(true);

      // 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setError("마이크 권한이 필요합니다.");
        return;
      }

      // 녹음 준비
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 이전 녹음 정리
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (err) {
          console.log("이전 녹음 정리 중 오류:", err);
        }
      }

      // 녹음 시작
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      setError("녹음을 시작할 수 없습니다.");
      setIsRecording(false);
    }
  };

  // 발음 평가 중지 및 평가
  const stopPronunciationTest = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("녹음 파일을 저장할 수 없습니다.");
      }
      setRecordedUri(uri);
      setRecording(null);

      // 오디오 모드 재설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // 발음 평가 API 호출
      await evaluatePronunciation(uri);
    } catch (err) {
      console.error("녹음 중지 실패:", err);
      setError("녹음을 중지할 수 없습니다.");
    }
  };

  // 발음 평가 API 호출
  const evaluatePronunciation = async (audioUri: string) => {
    try {
      setIsEvaluating(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token || !selectedChildId) {
        throw new Error("인증 정보가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[발음 평가 API 요청]");
      console.log(
        "URL:",
        `https://www.aieng.co.kr/api/voice/pronounce-test?expectedText=${encodeURIComponent(
          sentence?.word || ""
        )}`
      );
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "multipart/form-data",
      });

      // FormData 생성
      const formData = new FormData();
      formData.append("audio_file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      // API 호출
      console.log("[API 호출 시작]");
      const apiResponse = await axios.post(
        `https://www.aieng.co.kr/api/voice/pronounce-test?expectedText=${encodeURIComponent(
          sentence?.word || ""
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

      console.log("[API 응답]");
      console.log("Status:", apiResponse.status);
      console.log("Data:", JSON.stringify(apiResponse.data, null, 2));

      if (apiResponse.data) {
        setPronunciationFeedback(apiResponse.data.data);
        // 모달로 결과 표시
        NavigationAlert.show({
          title: "발음 평가 결과",
          message: `인식된 단어: ${apiResponse.data.data.recognized_text}\n\n정확도: ${apiResponse.data.data.accuracy}%\n신뢰도: ${apiResponse.data.data.confidence}%\n\n${apiResponse.data.data.feedback}`,
          confirmText: "확인",
          onConfirm: () => {
            setPronunciationFeedback(null);
          },
        });
      }
    } catch (err: any) {
      console.error("[발음 평가 실패 상세 정보]");
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", JSON.stringify(err.response.data, null, 2));
        console.error(
          "Headers:",
          JSON.stringify(err.response.headers, null, 2)
        );
        NavigationAlert.show({
          title: "발음 평가 실패",
          message: `서버 오류: ${err.response.status} - ${
            err.response.data?.message || "알 수 없는 오류"
          }`,
          confirmText: "확인",
          onConfirm: () => {},
        });
      } else if (err.request) {
        console.error("Request:", err.request);
        NavigationAlert.show({
          title: "발음 평가 실패",
          message: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.",
          confirmText: "확인",
          onConfirm: () => {},
        });
      } else {
        console.error("Error Message:", err.message);
        NavigationAlert.show({
          title: "발음 평가 실패",
          message: err.message || "발음 평가에 실패했습니다.",
          confirmText: "확인",
          onConfirm: () => {},
        });
      }
      console.error("Config:", JSON.stringify(err.config, null, 2));
    } finally {
      setIsEvaluating(false);
    }
  };

  // 로딩 화면 표시
  if (isLoading || !sentence) {
    return <LoadingScreen message="문장을 불러오는 중..." />;
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
            <Text style={styles.themeName}>{themeName}</Text> - 문장 학습
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
        {/* 문장 카드 */}
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
                source={sentence.imageUrl}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.textContainer}>
              {renderHighlightedSentence()}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleCardPlay}
                  style={styles.playButton}
                >
                  <FontAwesome5
                    name="volume-up"
                    size={27}
                    color={theme.colors.primary}
                    style={styles.soundIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.divider}>/</Text>
                <TouchableOpacity
                  onPress={
                    isRecording ? stopPronunciationTest : startPronunciationTest
                  }
                  style={[
                    styles.playButton,
                    isRecording && styles.recordingButton,
                  ]}
                  disabled={isEvaluating}
                >
                  <FontAwesome5
                    name={isRecording ? "stop" : "microphone"}
                    size={27}
                    color={isRecording ? "#FF3B30" : theme.colors.primary}
                    style={styles.soundIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.koreanSentence}>
                {sentence.sentenceKorean}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 컨트롤 버튼 영역 */}
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
                  {isCompleted ? "완료" : "문장 듣기"}
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
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: "WordSelect",
                      params: {
                        themeId: themeId,
                        theme: themeName,
                      },
                    })
                  )
                }
              >
                <FontAwesome5
                  name="arrow-circle-right"
                  size={28}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>학습 마치기</Text>
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
                <Text style={styles.helpSectionTitle}>문장 학습 가이드</Text>
                <Text style={styles.helpText}>
                  단어가 포함된 문장을 듣고 발음해보세요! 단어가 문장 속에서
                  어떻게 사용되는지 이해하는 것이 중요해요.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 팁</Text>
                <Text style={styles.helpText}>
                  문장을 들으면 학습을 끝낼 수 있어요! 여러 번 들어보고 문장을
                  따라해 보세요.
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
    width: "70%", // 원하는 너비로 조정
    height: 420, // 고정 높이 설정
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 25,
    padding: theme.spacing.l,
    justifyContent: "space-between",
    alignItems: "center",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    flexDirection: "row",
  },
  imageContainer: {
    width: "35%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: "90%",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.m,
  },
  sentenceText: {
    ...theme.typography.title,
    color: theme.colors.secondary,
    fontSize: 30,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 42,
  },
  highlightedWord: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  koreanSentence: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontSize: 22,
    textAlign: "center",
  },
  // 버튼 영역
  controlsContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
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
    zIndex: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  divider: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: "bold",
    marginHorizontal: theme.spacing.xs,
  },
  playButton: {
    padding: 10,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 50,
    padding: 10,
  },
  soundIcon: {
    // paddingTop: theme.spacing.xs,
  },
  feedbackContainer: {
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  feedbackTitle: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  feedbackText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  feedbackMessage: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontStyle: "italic",
    marginTop: theme.spacing.s,
  },
});

export default WordSentenceScreen;
