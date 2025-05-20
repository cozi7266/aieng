// screens/SongScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../App";
import BackButton from "../components/navigation/BackButton";
import { theme } from "../Theme";
import { useAudio } from "../contexts/AudioContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// axios 기본 설정
const api = axios.create({
  baseURL: Platform.select({
    ios: "http://localhost:8080",
    android: "http://10.0.2.2:8080", // Android 에뮬레이터용
  }),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 노래 관련 컴포넌트 임포트
import SongCard from "../components/songs/SongCard";
import MusicPlayer from "../components/songs/MusicPlayer";
import SongLyrics from "../components/songs/SongLyrics";
import CreateSongButton from "../components/songs/CreateSongButton";

type SongScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SongScreen"
>;

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any;
  audioUrl: any;
  duration: number;
  lyrics?: string;
  favorite: boolean;
}

interface Storybook {
  storybookId: number;
  title: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Storybook[];
  error: null | string;
}

interface SongStatusResponse {
  success: boolean;
  data: {
    status: "NONE" | "REQUESTED" | "IN_PROGRESS" | "READY" | "SAVED" | "FAILED";
    details: {
      songId: number | null;
      sessionId: number;
      storybookId: number;
      redisKeyExists: boolean;
      rdbSaved: boolean;
      songUrl: string | null;
      lyricsKo: string | null;
      lyricsEn: string | null;
    };
  };
  error: null | {
    code: string;
    message: string;
  };
}

interface SongStatus {
  status: "NONE" | "REQUESTED" | "IN_PROGRESS" | "READY" | "SAVED" | "FAILED";
  details: {
    songId: number | null;
    sessionId: number;
    storybookId: number;
    redisKeyExists: boolean;
    rdbSaved: boolean;
    songUrl: string | null;
    lyricsKo: string | null;
    lyricsEn: string | null;
  };
}

const SongScreen: React.FC = () => {
  const navigation = useNavigation<SongScreenNavigationProp>();
  const { width, height } = useWindowDimensions(); // 동적 화면 크기 사용
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [currentSongStatus, setCurrentSongStatus] = useState<SongStatus | null>(
    null
  );
  const spinValue = useRef(new Animated.Value(0)).current;

  // 반응형 레이아웃을 위한 계산
  const isLandscape = width > height;
  const isTablet = width > 768; // 태블릿 기준 화면 너비

  // 화면 크기에 따른 그리드 열 수 계산
  const numColumns = 3;

  // 동적 스타일을 위한 계산 값
  const scaleFactor = Math.min(width / 2000, height / 1200);

  const songCardWidth = (width * 0.6 - theme.spacing.m * 8) / numColumns;

  // 오디오 컨텍스트
  const { toggleBgm, stopBgm } = useAudio();

  // 더미 데이터 - 로컬 이미지 유지
  const mockSongs: Song[] = [
    {
      id: "1",
      title: "Twinkle Twinkle Little Star",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/sample.mp3"),
      duration: 228,
      lyrics:
        "Twinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky\nTwinkle, twinkle, little star\nHow I wonder what you are",
      favorite: false,
    },
    // 나머지 노래 데이터는 그대로 유지
    {
      id: "2",
      title: "Old MacDonald Had a Farm",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 180,
      lyrics:
        "Old MacDonald had a farm, E-I-E-I-O\nAnd on his farm he had a cow, E-I-E-I-O\nWith a moo moo here and a moo moo there\nHere a moo, there a moo, everywhere a moo moo\nOld MacDonald had a farm, E-I-E-I-O",
      favorite: false,
    },
    {
      id: "3",
      title: "The Wheels on the Bus",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/sample.mp3"),
      duration: 228,
      lyrics:
        "The wheels on the bus go round and round\nRound and round, round and round\nThe wheels on the bus go round and round\nAll through the town",
      favorite: false,
    },
    {
      id: "4",
      title: "Itsy Bitsy Spider",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 180,
      lyrics:
        "The itsy bitsy spider went up the water spout\nDown came the rain and washed the spider out\nOut came the sun and dried up all the rain\nAnd the itsy bitsy spider went up the spout again",
      favorite: false,
    },
    {
      id: "5",
      title: "Baa Baa Black Sheep",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/sample.mp3"),
      duration: 228,
      lyrics:
        "Baa, baa, black sheep, have you any wool?\nYes sir, yes sir, three bags full\nOne for the master, one for the dame\nAnd one for the little boy who lives down the lane",
      favorite: false,
    },
    {
      id: "6",
      title: "Row Row Row Your Boat",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 180,
      lyrics:
        "Row, row, row your boat\nGently down the stream\nMerrily, merrily, merrily, merrily\nLife is but a dream",
      favorite: false,
    },
    {
      id: "7",
      title: "Row Row Row Your Boat",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/sample.mp3"),
      duration: 228,
      lyrics:
        "Row, row, row your boat\nGently down the stream\nMerrily, merrily, merrily, merrily\nLife is but a dream",
      favorite: true,
    },
  ];

  useEffect(() => {
    // 화면 가로 모드 고정 (태블릿용)
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    const fetchStorybooks = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const selectedChildId = await AsyncStorage.getItem("selectedChildId");

        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        if (!selectedChildId) {
          throw new Error("선택된 자녀 ID가 없습니다.");
        }

        console.log("[동화책 목록 요청]");

        const response = await axios.get<ApiResponse>(
          "https://www.aieng.co.kr/api/books",
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
          const books = response.data.data;
          console.log(
            "[동화책 목록]",
            books.map((book) => ({
              id: book.storybookId,
              title: book.title,
              coverUrl: book.coverUrl,
            }))
          );
          setStorybooks(books);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("[동화책 목록 조회 실패]", {
            message: error.response?.data?.error?.message || error.message,
            status: error.response?.status,
          });
        } else {
          console.error("알 수 없는 에러:", error);
        }
      }
    };

    lockOrientation();
    setSongs(mockSongs);
    fetchStorybooks();

    // 첫번째 노래를 기본 선택
    if (mockSongs.length > 0) {
      setCurrentSong(mockSongs[0]);
    }

    return () => {
      ScreenOrientation.unlockAsync();
      stopBgm();
    };
  }, []);

  useEffect(() => {
    if (
      currentSongStatus?.status === "REQUESTED" ||
      currentSongStatus?.status === "IN_PROGRESS"
    ) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [currentSongStatus?.status]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const checkSongStatus = async (sessionId: number, storybookId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      console.log("[동요 상태 확인]", { sessionId, storybookId });

      const response = await axios.get<SongStatusResponse>(
        `https://www.aieng.co.kr/api/songs/sessions/${sessionId}/storybook/${storybookId}/status`,
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
        console.log("[동요 상태]", response.data);
        return response.data.data;
      } else {
        throw new Error(
          response.data.error?.message || "동요 상태 확인에 실패했습니다."
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[동요 상태 확인 실패]", {
          message: error.response?.data?.error?.message || error.message,
          status: error.response?.status,
        });
      } else {
        console.error("알 수 없는 에러:", error);
      }
      throw error;
    }
  };

  const handleSongPress = async (song: Song) => {
    try {
      const sessionId = await AsyncStorage.getItem("currentSessionId");

      if (!sessionId) {
        console.error("현재 세션 ID가 없습니다.");
        return;
      }

      const storybookId = parseInt(song.id);

      console.log("[동요 상태 확인]", {
        sessionId,
        storybookId,
        songId: song.id,
      });

      const status = await checkSongStatus(parseInt(sessionId), storybookId);
      console.log("동화/동요 상태:", status);

      setCurrentSong(song);
      setCurrentSongStatus(status);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message || error.message;
        console.error("동요 상태 확인 실패:", errorMessage);

        if (error.response?.status === 404) {
          console.log("학습 세션이 만료되었거나 존재하지 않습니다.");
        }
      } else {
        console.error("알 수 없는 에러:", error);
      }
    }
  };

  const handleNavigateToStory = (song: Song) => {
    navigation.navigate("FairytaleScreen", { songId: song.id });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const previousIndex =
        currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      setCurrentSong(songs[previousIndex]);
    }
  };

  const handleNext = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const nextIndex =
        currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
      setCurrentSong(songs[nextIndex]);
    }
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const handleNavigateToSettings = () => {
    navigation.navigate("SongSettingScreen");
  };

  const handleToggleFavorite = () => {
    if (!currentSong) return;

    // 즐겨찾기 상태 토글
    setSongs((prevSongs) =>
      prevSongs.map((song) =>
        song.id === currentSong.id
          ? { ...song, favorite: !song.favorite }
          : song
      )
    );

    // 현재 선택된 노래의 즐겨찾기 상태도 업데이트
    setCurrentSong((prevSong) =>
      prevSong ? { ...prevSong, favorite: !prevSong.favorite } : null
    );
  };

  const handleCreateSong = async () => {
    if (!currentSong) return;

    try {
      const sessionId = await AsyncStorage.getItem("currentSessionId");
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!sessionId || !token || !selectedChildId) {
        throw new Error("필요한 정보가 없습니다.");
      }

      console.log("[동요 생성 요청]", {
        sessionId,
        storybookId: currentSong.id,
      });

      // TODO: 동요 생성 API 호출
      // const response = await axios.post(...);

      // 임시로 상태만 업데이트
      setCurrentSongStatus({
        status: "REQUESTED",
        details: {
          songId: null,
          sessionId: parseInt(sessionId),
          storybookId: parseInt(currentSong.id),
          redisKeyExists: false,
          rdbSaved: false,
          songUrl: null,
          lyricsKo: null,
          lyricsEn: null,
        },
      });
    } catch (error) {
      console.error("동요 생성 실패:", error);
    }
  };

  const handleSaveSong = async () => {
    if (!currentSong) return;

    try {
      const sessionId = await AsyncStorage.getItem("currentSessionId");
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!sessionId || !token || !selectedChildId) {
        throw new Error("필요한 정보가 없습니다.");
      }

      console.log("[동요 저장 요청]", {
        sessionId,
        storybookId: currentSong.id,
      });

      // TODO: 동요 저장 API 호출
      // const response = await axios.post(...);

      // 임시로 상태만 업데이트
      setCurrentSongStatus((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: "SAVED",
          details: {
            ...prev.details,
            rdbSaved: true,
          },
        };
      });
    } catch (error) {
      console.error("동요 저장 실패:", error);
    }
  };

  const filteredSongs =
    activeTab === "all" ? songs : songs.filter((song) => song.favorite);

  // 동적 스타일 생성
  const dynamicStyles = {
    header: {
      paddingVertical: theme.spacing.m * scaleFactor,
      paddingHorizontal: theme.spacing.xl * scaleFactor,
    },
    headerTitle: {
      fontSize: theme.typography.title.fontSize * scaleFactor,
    },
    tabButton: {
      paddingVertical: theme.spacing.s * scaleFactor,
      paddingHorizontal: theme.spacing.l * scaleFactor,
    },
    tabText: {
      fontSize: theme.typography.button.fontSize * scaleFactor,
    },
    contentPadding: {
      padding: theme.spacing.l * scaleFactor,
    },
    songCardSize: {
      width: songCardWidth,
      height: songCardWidth * 1.3, // 높이도 비율에 맞게 설정
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          {/* <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
            나의 동요 모음
          </Text> */}
        </View>

        {/* 탭 선택기 */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "all" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              모든 동요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "favorites" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("favorites")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "favorites" && styles.activeTabText,
              ]}
            >
              즐겨찾기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <CreateSongButton
            onPress={handleNavigateToSettings}
            scaleFactor={scaleFactor}
          />
          {/* 테스트용 상태 변경 버튼들 */}
          <View style={styles.testButtonsContainer}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "NONE",
                  details: {
                    songId: null,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: false,
                    rdbSaved: false,
                    songUrl: null,
                    lyricsKo: null,
                    lyricsEn: null,
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>NONE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "REQUESTED",
                  details: {
                    songId: null,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: false,
                    rdbSaved: false,
                    songUrl: null,
                    lyricsKo: null,
                    lyricsEn: null,
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>REQUESTED</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "IN_PROGRESS",
                  details: {
                    songId: null,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: false,
                    rdbSaved: false,
                    songUrl: null,
                    lyricsKo: null,
                    lyricsEn: null,
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>IN_PROGRESS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "READY",
                  details: {
                    songId: 1,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: true,
                    rdbSaved: false,
                    songUrl: "https://example.com/song.mp3",
                    lyricsKo: "한글 가사",
                    lyricsEn: "English lyrics",
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>READY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "SAVED",
                  details: {
                    songId: 1,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: true,
                    rdbSaved: true,
                    songUrl: "https://example.com/song.mp3",
                    lyricsKo: "한글 가사",
                    lyricsEn: "English lyrics",
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>SAVED</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                setCurrentSongStatus({
                  status: "FAILED",
                  details: {
                    songId: null,
                    sessionId: 1,
                    storybookId: parseInt(currentSong?.id || "0"),
                    redisKeyExists: false,
                    rdbSaved: false,
                    songUrl: null,
                    lyricsKo: null,
                    lyricsEn: null,
                  },
                });
              }}
            >
              <Text style={styles.testButtonText}>FAILED</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.contentContainer}>
        {/* 왼쪽 - 노래 그리드 */}
        <View style={[styles.leftContainer, dynamicStyles.contentPadding]}>
          <FlatList
            data={storybooks}
            keyExtractor={(item) => item.storybookId.toString()}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: "flex-start" }}
            renderItem={({ item }) => (
              <SongCard
                song={{
                  id: item.storybookId.toString(),
                  title: item.title,
                  artist: "동화",
                  imageUrl: { uri: item.coverUrl },
                  audioUrl: require("../assets/sounds/sample.mp3"),
                  duration: 228,
                  lyrics: item.description,
                  favorite: false,
                }}
                isActive={currentSong?.id === item.storybookId.toString()}
                isPlaying={false}
                onPress={() =>
                  handleSongPress({
                    id: item.storybookId.toString(),
                    title: item.title,
                    artist: "동화",
                    imageUrl: { uri: item.coverUrl },
                    audioUrl: require("../assets/sounds/sample.mp3"),
                    duration: 228,
                    lyrics: item.description,
                    favorite: false,
                  })
                }
                onStoryPress={() =>
                  handleNavigateToStory({
                    id: item.storybookId.toString(),
                    title: item.title,
                    artist: "동화",
                    imageUrl: { uri: item.coverUrl },
                    audioUrl: require("../assets/sounds/sample.mp3"),
                    duration: 228,
                    lyrics: item.description,
                    favorite: false,
                  })
                }
                style={dynamicStyles.songCardSize}
                scaleFactor={scaleFactor}
                isStoryButtonEnabled={
                  currentSongStatus?.status === "SAVED" &&
                  currentSong?.id === item.storybookId.toString()
                }
              />
            )}
            contentContainerStyle={styles.songGrid}
          />
        </View>

        {/* 오른쪽 - 현재 선택된 동요 정보 */}
        <View style={[styles.rightContainer, dynamicStyles.contentPadding]}>
          {currentSong ? (
            <>
              {/* 현재 동요 정보 */}
              <View style={styles.currentSongContainer}>
                <Image
                  source={currentSong.imageUrl}
                  style={[
                    styles.currentSongImage,
                    {
                      width: 120 * scaleFactor,
                      height: 120 * scaleFactor,
                      borderRadius: theme.borderRadius.medium * scaleFactor,
                    },
                  ]}
                  defaultSource={require("../assets/icon.png")}
                />
                <View style={styles.currentSongInfo}>
                  <Text
                    style={[
                      styles.currentSongTitle,
                      {
                        fontSize: theme.typography.title.fontSize * scaleFactor,
                      },
                    ]}
                  >
                    {currentSong.title}
                  </Text>
                  <Text
                    style={[
                      styles.currentSongArtist,
                      {
                        fontSize: theme.typography.body.fontSize * scaleFactor,
                      },
                    ]}
                  >
                    {currentSong.artist}
                  </Text>
                </View>
              </View>

              {/* 가사 */}
              <SongLyrics
                lyrics={currentSong.lyrics || "가사가 없습니다"}
                scaleFactor={scaleFactor}
              />

              {/* 동요 상태에 따른 UI 표시 */}
              {currentSongStatus?.status === "SAVED" ? (
                <MusicPlayer
                  song={currentSong}
                  isPlaying={isPlaying}
                  isRepeat={isRepeat}
                  onPlayPause={handlePlayPause}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onRepeat={handleRepeat}
                  onToggleFavorite={handleToggleFavorite}
                  scaleFactor={scaleFactor}
                />
              ) : (
                <View style={styles.playerContainer}>
                  <View style={styles.playerControls}>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>
                        {currentSongStatus?.status === "REQUESTED" ||
                        currentSongStatus?.status === "IN_PROGRESS"
                          ? "동요를 생성하고 있어요..."
                          : currentSongStatus?.status === "READY"
                          ? "동요가 생성되었어요!"
                          : "동요를 생성해주세요"}
                      </Text>
                    </View>
                    {currentSongStatus?.status === "NONE" ||
                    !currentSongStatus ? (
                      <TouchableOpacity
                        style={styles.createSongButton}
                        onPress={handleCreateSong}
                      >
                        <FontAwesome5
                          name="music"
                          size={40 * scaleFactor}
                          color="white"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.createSongButtonText}>
                          동요 생성하기
                        </Text>
                      </TouchableOpacity>
                    ) : currentSongStatus?.status === "READY" ? (
                      <TouchableOpacity
                        style={styles.createSongButton}
                        onPress={handleSaveSong}
                      >
                        <FontAwesome5
                          name="save"
                          size={40 * scaleFactor}
                          color="white"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.createSongButtonText}>
                          저장하기
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.createSongButton, styles.disabledButton]}
                        disabled={true}
                      >
                        <View style={styles.spinnerContainer}>
                          <Animated.View
                            style={{
                              transform: [{ rotate: spin }],
                              width: 40 * scaleFactor,
                              height: 40 * scaleFactor,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome5
                              name="spinner"
                              size={40 * scaleFactor}
                              color="white"
                            />
                          </Animated.View>
                        </View>
                        <Text
                          style={[
                            styles.createSongButtonText,
                            styles.disabledButtonText,
                          ]}
                        >
                          생성 중...
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noSongContainer}>
              <Text
                style={[
                  styles.noSongText,
                  {
                    fontSize: theme.typography.subTitle.fontSize * scaleFactor,
                  },
                ]}
              >
                재생할 동요를 선택해 주세요.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -theme.spacing.xxl,
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
  tabSelector: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    padding: 4,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    paddingBottom: 0,
  },
  leftContainer: {
    flex: 1.5,
  },
  rightContainer: {
    flex: 1,
    backgroundColor: "white",
    margin: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.default,
  },
  songGrid: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.m,
  },
  currentSongContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.l,
  },
  currentSongImage: {
    marginRight: theme.spacing.l,
  },
  currentSongInfo: {
    flex: 1,
  },
  currentSongTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  currentSongArtist: {
    ...theme.typography.body,
    color: theme.colors.subText,
  },
  noSongContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSongText: {
    ...theme.typography.subTitle,
    color: theme.colors.subText,
  },
  playerContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    ...theme.shadows.default,
  },
  playerControls: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.colors.subText,
    textAlign: "center",
    fontSize: theme.typography.body.fontSize * 0.8,
  },
  createSongButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.medium,
    minWidth: 200,
    ...theme.shadows.default,
  },
  disabledButton: {
    backgroundColor: theme.colors.subText,
    opacity: 0.7,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: theme.spacing.s + 3,
  },
  spinningIcon: {
    marginRight: theme.spacing.s + 3,
  },
  createSongButtonText: {
    ...theme.typography.button,
    color: "white",
  },
  spinnerContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.s + 3,
  },
  testButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.m,
  },
  testButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
  },
  testButtonText: {
    color: "white",
    fontSize: 12,
  },
});

export default SongScreen;
