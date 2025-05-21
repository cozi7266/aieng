// screens/WordcardScreen.tsx
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../App";
import { theme } from "../Theme";
import BackButton from "../components/navigation/BackButton";
import BGMToggleButton from "../components/common/BGMToggleButton";
import ProfileButton from "../components/common/ProfileButton";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 테마 카드 컴포넌트 (재사용)
import LearningThemeCard from "../components/common/learning/LearningThemeCard";

// 테마 데이터 타입
interface ThemeData {
  themeId: number;
  themeKo: string;
  themeEn: string;
  imageUrl: string;
  totalWords: number;
  learnedWords: number;
}

type WordcardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WordcardScreen"
>;

const WordcardScreen: React.FC = () => {
  const navigation = useNavigation<WordcardScreenNavigationProp>();
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;
  const numColumns = 3; // 태블릿 가로 모드 기준

  // 테마 데이터 불러오기
  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");
      if (!token || !selectedChildId)
        throw new Error("로그인 정보가 없습니다.");

      const response = await axios.get(
        "https://www.aieng.co.kr/api/dictionaries/themes",
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
        setThemes(response.data.data);
      } else {
        throw new Error("테마 정보를 불러오지 못했습니다.");
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
    };
  }, []);

  // 테마 데이터 로딩
  useFocusEffect(
    React.useCallback(() => {
      fetchThemes();
    }, [])
  );

  // 테마 카드 클릭 시 상세로 이동
  const handleThemePress = (item: ThemeData) => {
    navigation.navigate("WordCollectionScreen", {
      theme: `${item.themeKo} (${item.themeEn})`,
      themeId: item.themeId.toString(),
    });
  };

  // 카드 렌더링
  const renderCard = ({ item }: { item: ThemeData }) => (
    <LearningThemeCard
      title={`${item.themeKo} (${item.themeEn})`}
      imageSource={{ uri: item.imageUrl }}
      completed={item.learnedWords}
      total={item.totalWords}
      isCompleted={item.learnedWords === item.totalWords && item.totalWords > 0}
      onPress={() => handleThemePress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>테마를 불러오고 있어요...</Text>
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
              <Text style={styles.headerTitle}>아이잉 : 단어 도감</Text>
            </View>
            <View style={styles.headerButtons}>
              {/* <BGMToggleButton style={styles.headerButton} /> */}
              {/* <ProfileButton style={styles.headerButton} /> */}
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>
              테마를 선택해 단어 도감을 확인해보세요!
            </Text>
            <FlatList
              data={themes}
              renderItem={renderCard}
              keyExtractor={(item) => item.themeId.toString()}
              numColumns={numColumns}
              contentContainerStyle={styles.listContainer}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
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
    paddingBottom: 0,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    fontSize: 28,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 0,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
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

export default WordcardScreen;
