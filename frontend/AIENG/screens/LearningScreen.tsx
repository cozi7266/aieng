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

  // 테마 데이터 상태 관리 (업데이트할 수 있도록 useState 사용)
  const [learningThemes, setLearningThemes] = useState([
    {
      id: "1",
      title: "동물 (Animals)",
      imageUrl: require("../assets/icon.png"),
      progress: {
        completed: 5, // 예시: 완료된 테마
        total: 5,
      },
    },
    {
      id: "2",
      title: "색깔 (Colors)",
      imageUrl: require("../assets/images/themes/colors.png"),
      progress: {
        completed: 3,
        total: 5,
      },
    },
    {
      id: "3",
      title: "음식 (Food)",
      imageUrl: require("../assets/images/themes/food.png"),
      progress: {
        completed: 1,
        total: 5,
      },
    },
    {
      id: "4",
      title: "교통 (Transport)",
      imageUrl: require("../assets/images/themes/transportation.png"),
      progress: {
        completed: 0,
        total: 5,
      },
    },
    {
      id: "5",
      title: "자연 (Nature)",
      imageUrl: require("../assets/images/themes/nature.png"),
      progress: {
        completed: 2,
        total: 5,
      },
    },
    {
      id: "6",
      title: "숫자 (Numbers)",
      imageUrl: require("../assets/images/themes/numbers.png"),
      progress: {
        completed: 0,
        total: 5,
      },
    },
  ]);

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
  const handleThemeSelection = (item) => {
    // 완료 여부 확인 (5/5)
    const isCompleted = item.progress.completed === 5;

    if (isCompleted) {
      // 완료된 테마는 퀴즈 이동 알림 표시
      NavigationWarningAlert.show({
        title: "퀴즈 도전",
        message: `${item.title} 테마의 학습을 완료했어요! 퀴즈를 풀고 동요를 만들어 볼까요?`,
        confirmText: "퀴즈 풀기",
        cancelText: "취소",
        onConfirm: () => {
          console.log(`퀴즈 화면으로 이동: ${item.title}`);

          // 테마 진행도 초기화
          resetThemeProgress(item.id);

          // 퀴즈 화면으로 이동 (미구현)
          // navigation.navigate("QuizScreen", { themeId: item.id, theme: item.title });
        },
        onCancel: () => {
          console.log("퀴즈 탐색 취소됨");
        },
      });
    } else {
      // 미완료 테마는 단어 선택 화면으로 이동
      navigation.navigate("WordSelect", {
        theme: item.title,
        themeId: item.id,
      });
    }
  };

  // 테마 진행도 초기화 함수
  const resetThemeProgress = (themeId) => {
    setLearningThemes((prevThemes) =>
      prevThemes.map((theme) =>
        theme.id === themeId
          ? { ...theme, progress: { ...theme.progress, completed: 0 } }
          : theme
      )
    );
  };

  // 카드 렌더링 함수
  const renderCard = ({ item }) => {
    const isCompleted = item.progress.completed === 5;

    return (
      <LearningThemeCard
        title={item.title}
        imageSource={item.imageUrl}
        completed={item.progress.completed}
        total={item.progress.total}
        isCompleted={isCompleted}
        onPress={() => handleThemeSelection(item)}
      />
    );
  };

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
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={numColumns}
              contentContainerStyle={styles.listContainer}
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
  },
});

export default LearningScreen;
