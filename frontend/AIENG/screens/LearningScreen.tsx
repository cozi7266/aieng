// screens/LearningScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../App";
import { theme } from "../Theme";
import BackButton from "../components/navigation/BackButton";
import LearningThemeCard from "../components/common/learning/LearningThemeCard";
import BGMToggleButton from "../components/common/BGMToggleButton";
import ProfileButton from "../components/common/ProfileButton";
import { useProfile } from "../contexts/ProfileContext";
import NavigationWarningAlert from "../components/navigation/NavigationWarningAlert";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API 응답 데이터 타입 정의
interface ThemeData {
  themeId: number;
  themeName: string;
  themeImgUrl: string;
  sessionId: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalWordCount: number;
  learnedWordCount: number;
  progressRate: number;
  isFinished: boolean;
}

type LearningScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LearningScreen"
>;

const LearningScreen: React.FC = () => {
  const navigation = useNavigation<LearningScreenNavigationProp>();
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const { isProfileModalOpen } = useProfile();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;
  const [numColumns, setNumColumns] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 테마 데이터 상태 관리
  const [learningThemes, setLearningThemes] = useState<ThemeData[]>([]);

  // API에서 테마 데이터 가져오기
  const fetchThemes = async () => {
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
      console.log("URL:", "https://www.aieng.co.kr/api/sessions/themes");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
      });

      const response = await axios.get(
        "https://www.aieng.co.kr/api/sessions/themes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        setLearningThemes(response.data.data);
      } else {
        throw new Error(
          response.data.error?.message ||
            "테마 데이터를 불러오는데 실패했습니다."
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

  // 컴포넌트 마운트 시 테마 데이터 로드
  useEffect(() => {
    fetchThemes();
  }, []);

  // 프로필 모달 상태에 따른 애니메이션
  useEffect(() => {
    if (isProfileModalOpen) {
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(borderRadiusAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(borderRadiusAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isProfileModalOpen]);

  // 가로 모드로 화면 고정 (태블릿용)
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();

    // 화면 크기 변경 감지
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // 로고 크기를 화면 크기에 따라 계산
  const logoHeight = dimensions.height * 0.08;
  const logoWidth = logoHeight * 4;

  // 테마 선택 처리 및 완료 상태 확인
  const handleThemeSelection = (item: ThemeData) => {
    if (item.isFinished) {
      // 완료된 테마는 퀴즈 이동 알림 표시
      NavigationWarningAlert.show({
        title: "퀴즈 도전",
        message: `${item.themeName} 테마의 학습을 완료했어요! 퀴즈를 풀고 동요를 만들어 볼까요?`,
        confirmText: "퀴즈 풀기",
        cancelText: "취소",
        onConfirm: () => {
          navigation.navigate("WordQuiz", {
            wordId: item.themeId.toString(),
            themeId: item.themeId.toString(),
            theme: item.themeName,
          });
        },
        onCancel: () => {
          console.log("퀴즈 탐색 취소됨");
        },
      });
    } else {
      // 미완료 테마는 단어 선택 화면으로 이동
      navigation.navigate("WordSelect", {
        theme: item.themeName,
        themeId: item.themeId.toString(),
      });
    }
  };

  // 카드 렌더링 함수
  const renderCard = ({ item }: { item: ThemeData }) => {
    return (
      <LearningThemeCard
        title={item.themeName}
        imageSource={{ uri: item.themeImgUrl }}
        completed={item.learnedWordCount}
        total={item.totalWordCount}
        isCompleted={item.isFinished}
        onPress={() => handleThemeSelection(item)}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>테마를 불러오고 있어요...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BackButton onPress={() => navigation.navigate("Home")} />
            </View>

            <View style={styles.logoTitleContainer}>
              <Text style={styles.headerTitle}>아이잉 : 단어 학습</Text>
            </View>

            <View style={styles.headerButtons}>
              <BGMToggleButton style={styles.headerButton} />
              <ProfileButton style={styles.headerButton} />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>
              테마를 선택하여 단어를 배워보세요!
            </Text>

            <FlatList
              data={learningThemes}
              renderItem={renderCard}
              keyExtractor={(item) => item.themeId.toString()}
              numColumns={numColumns}
              key={numColumns}
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
  logo: {
    marginRight: theme.spacing.m,
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
    paddingBottom: theme.spacing.xxl,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.l,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: theme.spacing.m,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    textAlign: "center",
    marginHorizontal: theme.spacing.xl,
  },
});

export default LearningScreen;
