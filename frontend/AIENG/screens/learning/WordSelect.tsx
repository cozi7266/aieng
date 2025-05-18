// screens/learning/WordSelect.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import BGMToggleButton from "../../components/common/BGMToggleButton";
import ProfileButton from "../../components/common/ProfileButton";
import Button from "../../components/common/Button";
import WordCard from "../../components/common/learning/WordCard";
import { useProfile } from "../../contexts/ProfileContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Define types
type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<any, any>;

export interface Word {
  id: string;
  english: string;
  korean: string;
  image?: { uri: string };
  isLearned: boolean;
  isFlipped: boolean;
}

// API response types
interface ThemeProgress {
  theme_id: string;
  completed_words: string[];
  total_words: number;
  completed_count: number;
}

// API 응답 타입 추가
interface WordResponse {
  wordId: number;
  wordEn: string;
  wordKo: string;
  wordImgUrl: string;
  wordTtsUrl: string;
  isLearned: boolean;
}

interface SessionResponse {
  sessionId: number;
  themeEn: string;
  themeKo: string;
  words: WordResponse[];
  new: boolean;
}

interface ApiError {
  code: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  data: SessionResponse | null;
  error: ApiError | null;
}

const WordSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();

  // 기본 테마 정보 설정
  const selectedTheme = route.params?.theme || "동물 (Animals)";
  const themeId = route.params?.themeId || "1";

  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const { isProfileModalOpen } = useProfile();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;

  // State for words and progress
  const [words, setWords] = useState<Word[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(6);
  // 완료된 단어 목록을 추적하는 상태 추가
  const [completedWords, setCompletedWords] = useState<string[]>([]);

  // 선택된 카드 ID를 추적하는 상태
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // 테마 정보를 저장할 상태 추가
  const [themeInfo, setThemeInfo] = useState<{ ko: string; en: string }>({
    ko: "",
    en: "",
  });

  // 세션 ID를 저장할 상태 추가
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Profile modal animation
  useEffect(() => {
    if (isProfileModalOpen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(borderRadiusAnim, {
          toValue: 20,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(borderRadiusAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isProfileModalOpen]);

  // Lock screen orientation to landscape
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();

    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Load words based on theme and check for completed words
  useFocusEffect(
    React.useCallback(() => {
      loadInitialWords();
    }, [themeId])
  );

  // Function to load initial words (when completedCount is 0)
  const loadInitialWords = async () => {
    try {
      // Simulate API call to get theme progress
      const themeProgress: ThemeProgress = {
        theme_id: themeId,
        completed_words: [],
        // completed_words: ["cat", "lion", "rabbit"],
        total_words: 6,
        completed_count: 0,
      };

      setCompletedCount(themeProgress.completed_count);
      setTotalWords(themeProgress.total_words);
      setCompletedWords(themeProgress.completed_words);

      // Fetch theme words
      await fetchThemeWords(themeProgress.completed_words);
    } catch (error) {
      console.error("Failed to load words:", error);
    }
  };

  // Function to fetch theme words
  const fetchThemeWords = async (completedWordsList: string[] = []) => {
    try {
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
      console.log(
        "URL:",
        `https://www.aieng.co.kr/api/sessions/themes/${themeId}/start`
      );
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      const response = await axios.post<ApiResponse>(
        `https://www.aieng.co.kr/api/sessions/themes/${themeId}/start`,
        {}, // 빈 body
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
        const sessionData = response.data.data;

        if (!sessionData) {
          throw new Error("세션 데이터가 없습니다.");
        }

        // 세션 ID 저장
        setSessionId(sessionData.sessionId);

        // 테마 정보 업데이트
        setThemeInfo({
          ko: sessionData.themeKo,
          en: sessionData.themeEn,
        });

        // Transform the API data to our Word format
        const selectedWords = sessionData.words.map((word) => ({
          id: word.wordId.toString(),
          english: word.wordEn,
          korean: word.wordKo,
          image: { uri: word.wordImgUrl },
          isLearned: word.isLearned,
          isFlipped: false,
        }));

        setWords(selectedWords);
        setSelectedCardId(null);
      } else {
        throw new Error(
          response.data.error?.message || "단어를 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        throw new Error(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        throw new Error(
          "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
        );
      } else {
        console.log("Config:", error.config);
        throw new Error(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 리롤 API 호출 함수 추가
  const reshuffleWords = async () => {
    if (!sessionId) {
      throw new Error("세션 ID가 없습니다.");
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[리롤 API 요청]");
      console.log(
        "URL:",
        `https://www.aieng.co.kr/api/sessions/${sessionId}/themes/${themeId}/reshuffle`
      );

      const response = await axios.post<ApiResponse>(
        `https://www.aieng.co.kr/api/sessions/${sessionId}/themes/${themeId}/reshuffle`,
        {}, // 빈 body
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

      if (response.data.success && response.data.data) {
        const sessionData = response.data.data;

        // 테마 정보 업데이트
        setThemeInfo({
          ko: sessionData.themeKo,
          en: sessionData.themeEn,
        });

        // Transform the API data to our Word format
        const selectedWords = sessionData.words.map((word) => ({
          id: word.wordId.toString(),
          english: word.wordEn,
          korean: word.wordKo,
          image: { uri: word.wordImgUrl },
          isLearned: word.isLearned,
          isFlipped: false,
        }));

        setWords(selectedWords);
        setSelectedCardId(null);
      } else {
        throw new Error(
          response.data.error?.message || "단어를 다시 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      console.error("리롤 실패:", error);
      throw error;
    }
  };

  // 카드 토글 기능 - 단어 정보 보여주기/숨기기
  const handleToggleCard = (wordId: string) => {
    // 이미 학습된 카드는 토글하지 않음
    const cardToToggle = words.find((word) => word.id === wordId);
    if (cardToToggle?.isLearned) return;

    // 이미 선택된 카드인 경우 선택 취소
    if (selectedCardId === wordId) {
      setSelectedCardId(null);

      // 모든 카드 뒤집기 취소
      const updatedWords = words.map((word) => ({
        ...word,
        isFlipped: false,
      }));

      setWords(updatedWords);
    } else {
      // 다른 카드를 선택한 경우, 모든 카드를 원래 상태로 되돌린 후 선택한 카드만 뒤집기
      setSelectedCardId(wordId);

      const updatedWords = words.map((word) => ({
        ...word,
        isFlipped: word.id === wordId,
      }));

      setWords(updatedWords);
    }
  };

  // 학습 시작하기 - 선택된 카드가 있을 때만 호출
  const startLearning = async () => {
    if (!selectedCardId) return;

    try {
      const selectedWord = words.find((word) => word.id === selectedCardId);
      if (!selectedWord) return;

      navigation.navigate("WordListening", {
        wordId: selectedWord.id,
        themeId: themeId,
        theme: selectedTheme,
      });
    } catch (error) {
      console.error("학습 시작 실패:", error);
    }
  };

  // Refresh words - only available when completedCount is 0
  const handleRefreshWords = async () => {
    if (completedCount === 0) {
      if (sessionId) {
        // 세션이 있는 경우 리롤 API 호출
        await reshuffleWords();
      } else {
        // 세션이 없는 경우 기존 API 호출
        await fetchThemeWords(completedWords);
      }
    }
  };

  // 버튼 액션 처리
  const handleButtonAction = () => {
    if (selectedCardId) {
      // 선택된 카드가 있으면 학습 시작
      startLearning();
    } else if (completedCount === 0) {
      // 진행률이 0이고 선택된 카드가 없을 때만 새로운 단어 가져오기
      handleRefreshWords();
    }
    // 다른 경우에는 아무 동작도 하지 않음
  };

  // Render a word card
  const renderWordCard = ({ item }: { item: Word }) => (
    <WordCard
      english={item.english}
      korean={item.korean}
      image={item.image}
      isLearned={item.isLearned}
      isFlipped={item.isFlipped}
      onPress={() => handleToggleCard(item.id)}
    />
  );

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={[
          styles.scaleContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              borderRadius: borderRadiusAnim,
            },
          ]}
        >
          <View style={styles.gradientOverlay} />

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BackButton
                onPress={() => navigation.navigate("LearningScreen")}
              />
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {themeInfo.ko
                  ? `${themeInfo.ko} (${themeInfo.en})`
                  : selectedTheme}
                : 단어 선택
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.progressText}>
                {completedCount}/{totalWords}
              </Text>
              <BGMToggleButton style={styles.headerButton} />
              <ProfileButton style={styles.headerButton} />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <View style={styles.cardsContainer}>
              <FlatList
                data={words}
                renderItem={renderWordCard}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={styles.wordRow}
                scrollEnabled={false}
              />
            </View>

            <Button
              title={
                completedCount === 0 && !selectedCardId
                  ? "새로운 단어 보기"
                  : "학습 시작하기"
              }
              onPress={handleButtonAction}
              variant="primary"
              style={
                completedCount > 0 && !selectedCardId
                  ? styles.disabledButton
                  : styles.refreshButton
              }
              disabled={completedCount > 0 && !selectedCardId}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scaleContainer: {
    flex: 1,
    overflow: "hidden",
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.accent,
    opacity: 0.1,
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
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  headerTitle: {
    ...theme.typography.accent,
    color: theme.colors.secondary,
    fontSize: 40,
  },
  progressText: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginRight: theme.spacing.l,
  },
  headerButton: {
    marginLeft: theme.spacing.m,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.m,
  },
  cardsContainer: {
    flex: 0,
    marginTop: 15,
    marginBottom: 20,
  },
  wordRow: {
    justifyContent: "space-evenly",
    marginBottom: theme.spacing.l,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    width: "35%",
    minWidth: 150,
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
    borderColor: "#AAAAAA",
    opacity: 0.7,
  },
});

export default WordSelectScreen;
