// screens\wordcard\WordCollectionScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../../App";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import BGMToggleButton from "../../components/common/BGMToggleButton";
import ProfileButton from "../../components/common/ProfileButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

// 단어 카드 및 모달 컴포넌트
import WordCard from "../../components/common/wordcard/WordCard_wcp";
import WordDetailModal from "../../components/common/wordcard/WordDetailModal";

// 단어 데이터 타입
interface WordData {
  wordId: number;
  wordEn: string;
  wordKo: string;
  imgUrl: string;
  ttsUrl: string;
  learned: boolean;
}

// 라우트 파라미터 타입
type WordCollectionScreenRouteProp = RouteProp<
  RootStackParamList,
  "WordCollectionScreen"
>;

type WordCollectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WordCollectionScreen"
>;

const WordCollectionScreen: React.FC = () => {
  const navigation = useNavigation<WordCollectionScreenNavigationProp>();
  const route = useRoute<WordCollectionScreenRouteProp>();
  const { theme: themeName, themeId } = route.params;

  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;
  const numColumns = 6; // 태블릿 가로 모드 기준 - 한 줄에 6개 카드 표시

  // 테마에 해당하는 단어 데이터 불러오기
  const fetchWords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");
      if (!token || !selectedChildId)
        throw new Error("로그인 정보가 없습니다.");

      const response = await axios.get(
        `https://www.aieng.co.kr/api/dictionaries/themes/${themeId}/words`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (response.data.success) {
        setWords(response.data.data);
      } else {
        throw new Error("단어 정보를 불러오지 못했습니다.");
      }
    } catch (e: any) {
      setError(e.message || "알 수 없는 오류입니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 방향 고정 및 크기 갱신
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();

    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setDimensions(window)
    );

    return () => {
      sub.remove();
      ScreenOrientation.unlockAsync();

      // 사운드 리소스 해제
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // 단어 데이터 로딩
  useFocusEffect(
    React.useCallback(() => {
      fetchWords();

      return () => {
        // 화면에서 벗어날 때 모달 닫기
        setModalVisible(false);

        // 사운드 리소스 해제
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [themeId])
  );

  // 단어 카드 클릭 핸들러
  const handleWordCardPress = (word: WordData) => {
    if (word.learned) {
      setSelectedWord(word);
      setModalVisible(true);
    }
    // 학습하지 않은 단어는 클릭해도 반응하지 않음
  };

  // 발음 듣기 버튼 클릭 핸들러
  const playWordAudio = async () => {
    if (!selectedWord?.ttsUrl) return;

    try {
      // 이전 사운드가 있으면 언로드
      if (sound) {
        await sound.unloadAsync();
      }

      // 새 사운드 로드 및 재생
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: selectedWord.ttsUrl },
        { shouldPlay: true }
      );
      setSound(newSound);

      // 재생 완료 이벤트 리스너
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("오디오 재생 실패:", error);
    }
  };

  // 단어 카드 렌더링
  const renderWordCard = ({ item }: { item: WordData }) => (
    <WordCard
      word={{
        id: item.wordId.toString(),
        wordEn: item.wordEn,
        wordKo: item.wordKo,
        imageUrl: item.imgUrl,
        isLearned: item.learned,
      }}
      onPress={() => handleWordCardPress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>단어 카드를 불러오고 있어요...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 학습한 단어와 학습하지 않은 단어 통계
  const learnedCount = words.filter((word) => word.learned).length;
  const totalCount = words.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={[styles.scaleContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Animated.View
          style={[styles.container, { borderRadius: borderRadiusAnim }]}
        >
          <View style={styles.gradientOverlay} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BackButton onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.logoTitleContainer}>
              <Text style={styles.headerTitle}>{themeName} - 단어 도감</Text>
            </View>
            <View style={styles.headerButtons}>
              <BGMToggleButton style={styles.headerButton} />
              <ProfileButton style={styles.headerButton} />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.progressContainer}>
              <Text style={styles.subtitle}>
                전체 {totalCount}개 중 {learnedCount}개의 단어를 모았어요! (
                {progressPercentage}%)
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </View>

            <FlatList
              data={words}
              renderItem={renderWordCard}
              keyExtractor={(item) => item.wordId.toString()}
              numColumns={numColumns}
              contentContainerStyle={styles.listContainer}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <WordDetailModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            word={
              selectedWord
                ? {
                    id: selectedWord.wordId.toString(),
                    wordEn: selectedWord.wordEn,
                    wordKo: selectedWord.wordKo,
                    imageUrl: selectedWord.imgUrl,
                    audioUrl: selectedWord.ttsUrl,
                  }
                : null
            }
            onListenPress={playWordAudio}
          />
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
  logoTitleContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...theme.typography.accent,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.m,
    fontSize: 40,
  },
  headerButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerButton: {
    marginLeft: theme.spacing.m,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.m,
  },
  progressContainer: {
    marginBottom: theme.spacing.l,
    alignItems: "center",
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.m,
    fontSize: 28,
  },
  progressBarContainer: {
    width: "60%",
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    marginBottom: theme.spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    textAlign: "center",
    marginHorizontal: theme.spacing.xl,
  },
});

export default WordCollectionScreen;
