// screens/song/SongSettingScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../../App";
import BackButton from "../../components/navigation/BackButton";
import Button from "../../components/common/Button";
import MoodItem from "../../components/songs/MoodItem";
import VoiceItem from "../../components/songs/VoiceItem";
import { theme } from "../../Theme";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";
import { CommonActions } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SongSettingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SongSettingScreen"
>;

// 분위기 인터페이스
interface Mood {
  moodId: number;
  name: string;
  emoji: string;
  selected: boolean;
}

// 목소리 인터페이스
interface Voice {
  voiceId: number;
  childId: number | null;
  name: string;
  description: string;
  audioUrl: string;
  selected: boolean;
}

// TTS 목소리 인터페이스
interface TTSVoice {
  voiceId: number;
  childId: number | null;
  name: string;
  description: string;
  audioUrl: string;
  selected: boolean;
}

// API 응답 타입
interface SongSettingResponse {
  success: boolean;
  data: {
    moods: {
      moodId: number;
      name: string;
    }[];
    voices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
  };
  error: null | string;
}

// TTS API 응답 타입
interface TTSVoiceResponse {
  success: boolean;
  data: {
    defaultVoices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
    customVoices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
  };
  error: null | string;
}

// 분위기별 이모지 매핑
const MOOD_EMOJIS: { [key: string]: string } = {
  "nursery rhyme": "🎵",
  children: "👶",
  kids: "👧",
  happy: "😊",
  playful: "🎈",
  slow: "🐢",
  educational: "📚",
  repetitive: "🔄",
  brighton: "✨",
  "easy listening": "🎧",
};

const SongSettingScreen: React.FC = () => {
  const navigation = useNavigation<SongSettingScreenNavigationProp>();
  const { width, height } = useWindowDimensions();

  // 반응형 스케일링
  const scaleFactor = Math.min(width / 2000, height / 1200);

  // 동적 스타일 생성
  const dynamicStyles = {
    tabButton: {
      paddingVertical: theme.spacing.s * scaleFactor,
      paddingHorizontal: theme.spacing.l * scaleFactor,
    },
    tabText: {
      fontSize: theme.typography.button.fontSize * scaleFactor,
    },
  };

  // 상태 관리
  const [activeTab, setActiveTab] = useState<"song" | "tts">("song");
  const [moods, setMoods] = useState<Mood[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [ttsVoices, setTTSVoices] = useState<TTSVoice[]>([]);
  const [isTTSRecording, setIsTTSRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 화면 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // 동요 설정 조회
  const fetchSongSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/song-settings");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      const response = await axios.get<SongSettingResponse>(
        "https://www.aieng.co.kr/api/voice/song-settings",
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

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const { moods: apiMoods, voices: apiVoices } = response.data.data;

        // 분위기에 이모지 추가
        const moodsWithEmoji = apiMoods.map((mood) => ({
          ...mood,
          emoji: MOOD_EMOJIS[mood.name] || "😊", // 기본 이모지 설정
          selected: false,
        }));

        // 목소리 상태 업데이트
        const voicesWithSelected = apiVoices.map((voice) => ({
          ...voice,
          selected: false,
        }));

        setMoods(moodsWithEmoji);
        setVoices(voicesWithSelected);
      } else {
        throw new Error(
          response.data.error || "동요 설정을 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        setError(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", error.config);
        setError(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 동요 설정 조회
  useEffect(() => {
    fetchSongSettings();
  }, []);

  // 분위기 선택 처리
  const handleMoodSelect = (moodId: number) => {
    setMoods((prevMoods) =>
      prevMoods.map((mood) => ({
        ...mood,
        selected: mood.moodId === moodId,
      }))
    );
  };

  // 목소리 선택 처리
  const handleVoiceSelect = (voiceId: number) => {
    setVoices((prevVoices) =>
      prevVoices.map((voice) => ({
        ...voice,
        selected: voice.voiceId === voiceId,
      }))
    );
  };

  // TTS 목소리 설정 조회
  const fetchTTSVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/tts-settings");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      const response = await axios.get<TTSVoiceResponse>(
        "https://www.aieng.co.kr/api/voice/tts-settings",
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

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const { defaultVoices, customVoices } = response.data.data;

        // 기본 목소리와 커스텀 목소리를 합쳐서 상태 업데이트
        const allVoices = [
          ...defaultVoices.map((voice) => ({ ...voice, selected: false })),
          ...customVoices.map((voice) => ({ ...voice, selected: false })),
        ];

        setTTSVoices(allVoices);
      } else {
        throw new Error(
          response.data.error || "목소리 설정을 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        setError(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", error.config);
        setError(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 TTS 목소리 설정 조회
  useEffect(() => {
    fetchTTSVoices();
  }, []);

  // TTS 목소리 선택 처리
  const handleTTSVoiceSelect = (voiceId: number) => {
    setTTSVoices((prevVoices) =>
      prevVoices.map((voice) => ({
        ...voice,
        selected: voice.voiceId === voiceId,
      }))
    );
  };

  // TTS 목소리 추가 처리
  const handleAddTTSVoice = () => {
    setIsTTSRecording(true);

    // 녹음 과정 시뮬레이션 (실제 녹음 기능으로 대체 필요)
    setTimeout(() => {
      setIsTTSRecording(false);
      fetchTTSVoices(); // 목소리 추가 후 목록 새로고침
    }, 2000);
  };

  // TTS 목소리 삭제 처리
  const handleDeleteTTSVoice = async (voiceId: number) => {
    try {
      // TODO: 목소리 삭제 API 호출
      await fetchTTSVoices(); // 삭제 후 목록 새로고침
    } catch (err) {
      console.error("목소리 삭제 실패:", err);
    }
  };

  // 설정 저장 및 다음 단계로 진행
  const handleSaveSettings = () => {
    const selectedMood = moods.find((mood) => mood.selected);
    const selectedVoice = voices.find((voice) => voice.selected);
    const selectedTTSVoice = ttsVoices.find((voice) => voice.selected);

    // 선택 검증
    if (!selectedMood || !selectedVoice || !selectedTTSVoice) {
      console.log("모든 설정을 완료해 주세요.");
      return;
    }

    console.log("Selected mood:", selectedMood);
    console.log("Selected voice:", selectedVoice);
    console.log("Selected TTS voice:", selectedTTSVoice);

    // TODO: API 연동 시 여기에 모든 설정을 한번에 전송
    // const settings = {
    //   mood: selectedMood,
    //   voice: selectedVoice,
    //   ttsVoice: selectedTTSVoice,
    // };

    // Home 화면으로 이동
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        {/* 탭 선택기 */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "song" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("song")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "song" && styles.activeTabText,
              ]}
            >
              동요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "tts" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("tts")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "tts" && styles.activeTabText,
              ]}
            >
              TTS 설정
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.contentContainer}>
        {activeTab === "song" ? (
          <>
            {/* 좌측 - 목소리 설정 */}
            <View style={styles.leftContainer}>
              <Text style={styles.sectionTitle}>동요 목소리 설정</Text>
              <Text style={styles.sectionSubtitle}>
                동요를 부를 텍스트를 목소리를 선택해주세요{"\n"}(가수의 성별을
                선택 가능)
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <ScrollView contentContainerStyle={styles.voiceGrid}>
                  {voices.map((voice) => (
                    <VoiceItem
                      key={voice.voiceId}
                      id={voice.voiceId.toString()}
                      name={voice.name}
                      gender={voice.voiceId === 1 ? "male" : "female"}
                      isSelected={voice.selected}
                      onPress={() => handleVoiceSelect(voice.voiceId)}
                      style={styles.voiceItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 우측 - 분위기 설정 */}
            <View style={styles.rightContainer}>
              <Text style={styles.sectionTitle}>동요 분위기 설정</Text>
              <Text style={styles.sectionSubtitle}>
                생성될 동요의 분위기를 선택해주세요
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <View style={styles.moodGrid}>
                  {moods.map((mood) => (
                    <MoodItem
                      key={mood.moodId}
                      id={mood.moodId.toString()}
                      name={mood.name}
                      emoji={mood.emoji}
                      isSelected={mood.selected}
                      onPress={() => handleMoodSelect(mood.moodId)}
                      style={styles.moodItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* 좌측 - TTS 목소리 설정 */}
            <View style={styles.leftContainer}>
              <Text style={styles.sectionTitle}>TTS 목소리 설정</Text>
              <Text style={styles.sectionSubtitle}>
                학습에서 텍스트를 읽어줄 TTS 목소리를 선택해주세요{"\n"}(1초
                이상 눌러 내 목소리 변경)
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <ScrollView contentContainerStyle={styles.voiceGrid}>
                  {ttsVoices.map((voice) => (
                    <VoiceItem
                      key={voice.voiceId}
                      id={voice.voiceId.toString()}
                      name={voice.name}
                      gender={
                        voice.voiceId <= 2
                          ? voice.voiceId === 1
                            ? "male"
                            : "female"
                          : "custom"
                      }
                      isSelected={voice.selected}
                      onPress={() => handleTTSVoiceSelect(voice.voiceId)}
                      onDelete={
                        voice.voiceId > 2
                          ? () => handleDeleteTTSVoice(voice.voiceId)
                          : undefined
                      }
                      style={styles.voiceItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}

                  {/* TTS 목소리 추가 버튼 */}
                  <VoiceItem
                    id="add-tts-voice"
                    name={isTTSRecording ? "녹음 중..." : "내 목소리 추가"}
                    gender="custom"
                    isSelected={false}
                    isAddButton={true}
                    onPress={handleAddTTSVoice}
                    disabled={isTTSRecording}
                    style={styles.voiceItem}
                    scaleFactor={scaleFactor}
                  />
                </ScrollView>
              )}
            </View>

            {/* 우측 - 추후 추가될 내용 */}
            <View style={styles.rightContainer}>
              <Text style={styles.sectionTitle}>추가 설정</Text>
              <Text style={styles.sectionSubtitle}>
                추후 추가될 설정 내용이 들어갈 자리입니다.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          title="저장하기"
          onPress={handleSaveSettings}
          variant="primary"
        />
      </View>
    </SafeAreaView>
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
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    ...theme.shadows.default,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: 100,
  },
  headerRight: {
    width: 100,
  },
  backButton: {
    marginRight: theme.spacing.m,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    padding: 4,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -65 }], // 탭 선택기의 절반 너비만큼 왼쪽으로 이동
  },
  tab: {
    borderRadius: theme.borderRadius.pill,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  activeTabText: {
    color: "white",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: theme.colors.accent,
    padding: theme.spacing.l,
  },
  rightContainer: {
    flex: 1,
    padding: theme.spacing.l,
  },
  ttsContainer: {
    flex: 1,
    padding: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.subText,
    marginBottom: theme.spacing.l,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.s,
  },
  moodItem: {
    width: "22%",
    aspectRatio: 1,
    marginBottom: theme.spacing.m,
  },
  voiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  voiceItem: {
    width: 150,
    height: 180,
    margin: theme.spacing.m,
  },
  buttonContainer: {
    alignItems: "center",
    paddingBottom: theme.spacing.l,
    marginTop: theme.spacing.xl,
  },
  errorText: {
    color: "#FF3B30", // 직접 에러 색상 지정
    ...theme.typography.body,
    textAlign: "center",
    marginTop: theme.spacing.l,
  },
});

export default SongSettingScreen;
