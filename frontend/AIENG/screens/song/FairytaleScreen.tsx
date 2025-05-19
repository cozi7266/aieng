// screens/song/FairytaleScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../../App";
import BackButton from "../../components/navigation/BackButton";
import { theme } from "../../Theme";
import { useAudio } from "../../contexts/AudioContext";
import MusicPlayer from "../../components/songs/MusicPlayer";
import FairytaleCarousel from "../../components/songs/FairytaleCarousel";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";

// API 기본 URL
const API_BASE_URL = "https://www.aieng.co.kr";

type FairytaleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FairytaleScreen"
>;

type FairytaleScreenRouteProp = RouteProp<
  RootStackParamList & { FairytaleScreen: { songId: string } },
  "FairytaleScreen"
>;

interface FairytalePage {
  wordId: number;
  wordEn: string;
  wordKo: string;
  wordImgUrl: string;
  sentence: string;
  translation: string;
  sentenceImgUrl: string;
  sentenceTtsUrl: string;
  pageOrder: number;
}

interface Fairytale {
  storybookId: number;
  coverUrl: string;
  title: string;
  description: string;
  pages: FairytalePage[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any;
  audioUrl: any;
  duration: number;
  favorite?: boolean;
}

const FairytaleScreen: React.FC = () => {
  const navigation = useNavigation<FairytaleScreenNavigationProp>();
  const route = useRoute<FairytaleScreenRouteProp>();
  const { width, height } = useWindowDimensions();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fairytale, setFairytale] = useState<Fairytale | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // For responsive design
  const scaleFactor = Math.min(width / 2000, height / 1200);

  // Audio context from the app
  const { stopBgm } = useAudio();

  // Mock song data for development
  const mockSong: Song = {
    id: "1",
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    imageUrl: require("../../assets/icon.png"),
    audioUrl: require("../../assets/sounds/sample.mp3"),
    duration: 228,
    favorite: false,
  };

  const playTts = async (ttsUrl: string) => {
    try {
      console.log("TTS 재생 시작:", ttsUrl);
      if (sound) {
        console.log("이전 음성 정지");
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: ttsUrl },
        { shouldPlay: true }
      );
      console.log("새로운 음성 로드 완료");
      setSound(newSound);
    } catch (error) {
      console.error("TTS 재생 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    const fetchFairytale = async () => {
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

        const url = `${API_BASE_URL}/api/books/${route.params.songId}`;
        console.log("[API 요청] URL:", url);
        console.log("[API 요청] Headers:", {
          Authorization: `Bearer ${token}`,
          "X-Child-Id": selectedChildId,
        });

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        console.log("[API 응답] 전체 데이터:", response.data);

        if (response.data.success) {
          const storybookData = response.data.data;
          console.log("[API 응답] 동화책 데이터:", storybookData);

          // 데이터 구조 확인
          if (
            !storybookData ||
            !storybookData.pages ||
            !Array.isArray(storybookData.pages)
          ) {
            console.error(
              "[데이터 구조 오류] pages 배열이 없거나 잘못된 형식입니다:",
              storybookData
            );
            throw new Error("동화책 데이터 형식이 올바르지 않습니다.");
          }

          // 데이터 변환
          const transformedData: Fairytale = {
            storybookId: storybookData.storybookId,
            coverUrl: storybookData.coverUrl,
            title: storybookData.title,
            description: storybookData.description,
            pages: storybookData.pages.map((page: any) => ({
              wordId: page.wordId,
              wordEn: page.wordEn,
              wordKo: page.wordKo,
              wordImgUrl: page.wordImgUrl,
              sentence: page.sentence,
              translation: page.translation,
              sentenceImgUrl: page.sentenceImgUrl,
              sentenceTtsUrl: page.sentenceTtsUrl,
              pageOrder: page.pageOrder,
            })),
          };

          console.log("[변환된 데이터]", transformedData);
          setFairytale(transformedData);
          setSong(mockSong); // Mock song data 설정
        } else {
          console.error("[API 응답 실패]", response.data);
          setError(
            response.data.error?.message || "동화책을 불러오는데 실패했습니다."
          );
        }
      } catch (err: any) {
        console.error("[API 에러]", err);
        if (err.response) {
          console.log("[서버 응답]", {
            status: err.response.status,
            data: err.response.data,
          });
          setError(
            `서버 오류: ${err.response.status} - ${
              err.response.data.error?.message || "알 수 없는 오류"
            }`
          );
        } else if (err.request) {
          console.log("[네트워크 에러]", err.request);
          setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
        } else {
          console.log("[기타 에러]", err);
          setError(err.message || "요청 처리 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Lock screen orientation to landscape for tablet
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();
    fetchFairytale();

    return () => {
      // Cleanup
      ScreenOrientation.unlockAsync();
      stopBgm();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [route.params.songId]);

  const handlePreviousPage = () => {
    if (fairytale && currentPageIndex > 0) {
      console.log("이전 페이지로 이동:", currentPageIndex - 1);
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (fairytale && currentPageIndex < fairytale.pages.length - 1) {
      console.log("다음 페이지로 이동:", currentPageIndex + 1);
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // Handle previous song logic
    console.log("Previous song");
  };

  const handleNext = () => {
    // Handle next song logic
    console.log("Next song");
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const handleToggleFavorite = () => {
    if (!song) return;
    setSong((prevSong) =>
      prevSong ? { ...prevSong, favorite: !prevSong.favorite } : null
    );
  };

  // Dynamic styles based on screen size
  const dynamicStyles = {
    header: {
      paddingVertical: theme.spacing.m * scaleFactor,
      paddingHorizontal: theme.spacing.xl * scaleFactor,
    },
    headerTitle: {
      fontSize: theme.typography.title.fontSize * scaleFactor,
    },
    pageIndicator: {
      fontSize: theme.typography.caption.fontSize * scaleFactor,
    },
  };

  if (isLoading) {
    console.log("[상태] 로딩 중...");
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>동화책을 불러오고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    console.log("[상태] 에러 발생:", error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!fairytale || !fairytale.pages || fairytale.pages.length === 0) {
    console.log("[상태] 데이터 없음:", { fairytale });
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>동화책을 불러오고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("[상태] 현재 페이지 데이터:", {
    currentPageIndex,
    currentPage: fairytale.pages[currentPageIndex],
    totalPages: fairytale.pages.length,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
            {fairytale.title}
          </Text>
        </View>
        <View style={styles.pageIndicator}>
          <Text style={[styles.pageIndicatorText, dynamicStyles.pageIndicator]}>
            {fairytale.pages[currentPageIndex].pageOrder} /{" "}
            {fairytale.pages.length}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Fairy Tale Carousel + 자막 오버레이 */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            alignSelf: "center",
            marginTop: theme.spacing.s,
          }}
        >
          <FairytaleCarousel
            pages={fairytale.pages.map((page) => ({
              id: page.wordId.toString(),
              imageUrl: { uri: page.wordImgUrl },
              text: page.sentence,
            }))}
            currentIndex={currentPageIndex}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            scaleFactor={scaleFactor}
          />
          {/* 자막 클릭 시 TTS 재생 */}
          <TouchableOpacity
            style={styles.subtitleOverlay}
            onPress={() => {
              console.log(
                "현재 페이지 데이터:",
                fairytale.pages[currentPageIndex]
              );
              playTts(fairytale.pages[currentPageIndex].sentenceTtsUrl);
            }}
          >
            <View style={styles.subtitleContainer}>
              <View style={styles.subtitleRow}>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() =>
                    playTts(fairytale.pages[currentPageIndex].sentenceTtsUrl)
                  }
                >
                  <FontAwesome5 name="volume-up" size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.subtitleText}>
                    {fairytale.pages[currentPageIndex].sentence}
                  </Text>
                  <Text style={styles.subtitleTextKo}>
                    {fairytale.pages[currentPageIndex].translation}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        {/* Music Player */}
        <View style={styles.playerContainer}>
          {song && (
            <MusicPlayer
              song={song}
              isPlaying={isPlaying}
              isRepeat={isRepeat}
              onPlayPause={handlePlayPause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRepeat={handleRepeat}
              onToggleFavorite={handleToggleFavorite}
              scaleFactor={scaleFactor}
            />
          )}
        </View>
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
    ...theme.shadows.default,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing.m,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  pageIndicator: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  pageIndicatorText: {
    ...theme.typography.caption,
    color: "white",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  subtitleOverlay: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  subtitleContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 16,
    padding: 16,
    maxWidth: "90%",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitleText: {
    color: "white",
    fontSize: theme.typography.body.fontSize * 1.1,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitleTextKo: {
    color: "white",
    fontSize: theme.typography.body.fontSize * 0.95,
    textAlign: "center",
  },
  soundButton: {
    marginRight: 12,
    padding: 8,
  },
  playerContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    width: "75%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.subText,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});

export default FairytaleScreen;
