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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import BGMToggleButton from "../../components/common/BGMToggleButton";
import ProfileButton from "../../components/common/ProfileButton";
import Button from "../../components/common/Button";
import WordCard from "../../components/common/learning/WordCard";
import { useProfile } from "../../contexts/ProfileContext";

// Define types
type NavigationProp = NativeStackNavigationProp<any>;
type RouteType = RouteProp<any, any>;

export interface Word {
  id: string;
  english: string;
  korean: string;
  image?: string;
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

const WordSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();

  // 기본 테마 정보 설정
  const selectedTheme = "동물 (Animals)";
  const themeId = "1";

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
  useEffect(() => {
    loadInitialWords();
  }, [themeId]);

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
      // API 응답 데이터가 부분적으로 생략되어 있으므로, 완전한 데이터를 다시 정의합니다
      const fullData = {
        cards: [
          {
            id: "1",
            word: "cat",
            korean: "고양이",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
          {
            id: "2",
            word: "dog",
            korean: "강아지",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
          {
            id: "3",
            word: "rabbit",
            korean: "토끼",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
          {
            id: "4",
            word: "bird",
            korean: "새",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
          {
            id: "5",
            word: "fish",
            korean: "물고기",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
          {
            id: "6",
            word: "lion",
            korean: "사자",
            imageUrl: require("../../assets/images/main_mascot.png"),
            learned: false,
          },
        ],
      };

      // Transform the API data to our Word format
      const selectedWords = fullData.cards.map((card) => ({
        id: card.id,
        english: card.word,
        korean: card.korean,
        image: card.imageUrl,
        // 이미 학습한 단어인지 확인하여 isLearned 설정
        isLearned: completedWordsList.includes(card.word),
        isFlipped: false,
      }));

      setWords(selectedWords);
      // 선택된 카드 초기화
      setSelectedCardId(null);
    } catch (error) {
      console.error("Failed to fetch theme words:", error);
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

      // 이미 학습된 단어를 포함한 새로운 완료 단어 목록
      const newCompletedWords = [...completedWords, selectedWord.english];
      setCompletedWords(newCompletedWords);

      // 완료 단어 개수 증가
      const newCompletedCount = completedCount + 1;
      setCompletedCount(newCompletedCount);

      // API 응답 시뮬레이션 - 선택한 단어 학습 처리 후 업데이트된 상태
      const themeProgress: ThemeProgress = {
        theme_id: themeId,
        completed_words: newCompletedWords,
        total_words: 6,
        completed_count: newCompletedCount,
      };

      // 선택한 단어만 학습 완료 표시
      const updatedWords = words.map((word) => ({
        ...word,
        isLearned: word.id === selectedCardId ? true : word.isLearned,
        isFlipped: false, // 모든 카드 원래 상태로
      }));

      setWords(updatedWords);
      setSelectedCardId(null); // 선택 초기화

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
      await fetchThemeWords(completedWords);
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
              <Text style={styles.headerTitle}>{selectedTheme}: 단어 선택</Text>
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
              style={[
                styles.refreshButton,
                completedCount > 0 && !selectedCardId && styles.disabledButton,
              ]}
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
