// screens/LoginScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import KakaoLoginButton from "../components/common/auth/KaKaoLoginButton";
import { login, getProfile } from "@react-native-seoul/kakao-login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { theme } from "../Theme";
import { RootStackParamList } from "../App";

const { width, height } = Dimensions.get("window");
const isLandscape = width > height;

type LoginScreenProps = {
  setIsAuthenticated: (value: boolean) => void;
};

// 네비게이션 타입 정의
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const DividerWithText: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.dividerContainer}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>{text}</Text>
    <View style={styles.dividerLine} />
  </View>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ setIsAuthenticated }) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // 가로 모드로 화면 고정 (태블릿용)
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

  const handleKakaoLogin = async () => {
    console.log("카카오 로그인 시도");
    try {
      // 네이티브 카카오 로그인 실행
      const loginResult = await login();
      console.log("로그인 성공:", loginResult);

      // 액세스 토큰 획득
      const { accessToken } = loginResult;

      // 사용자 프로필 정보 획득 (선택적)
      const profileResult = await getProfile();
      // console.log("사용자 프로필:", profileResult);
      console.log("accessToken: ", accessToken);

      // 백엔드 서버에 토큰 전송
      const response = await axios.post(
        "https://www.aieng.co.kr/api/oauth/kakao/token",
        { token: accessToken }
      );

      const { success, data, error } = response.data;

      // 응답 데이터 상세 로깅
      console.log("=== 로그인 응답 데이터 ===");
      console.log("성공 여부:", success);
      console.log("서버 액세스 토큰:", data.accessToken);
      console.log("사용자 정보:", {
        id: data.user.id,
        nickname: data.user.nickname,
        isNew: data.user.isNew,
      });
      console.log("에러:", error);
      console.log("======================");

      if (success && data) {
        // 액세스 토큰 저장
        await AsyncStorage.setItem("accessToken", data.accessToken);

        // 인증 상태 업데이트 (모든 경우에 true로 설정)
        setIsAuthenticated(true);

        // isNew 값에 따라 다른 화면으로 이동
        if (data.user.isNew) {
          // 신규 회원인 경우 Signup 화면으로 이동
          console.log("신규 회원 - Signup 화면으로 이동");
          navigation.navigate("Signup");
        } else {
          // 기존 회원인 경우 ProfileSelect 화면으로 이동
          console.log("기존 회원 - ProfileSelect 화면으로 이동");
          navigation.navigate("ProfileSelect");
        }
      } else {
        Alert.alert("로그인 오류", error || "로그인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      Alert.alert("로그인 실패", "카카오 로그인 처리 중 오류가 발생했습니다.");
    }
  };

  // 임시 홈스크린 이동 함수 추가
  const handleTempHomeNavigation = async () => {
    await AsyncStorage.setItem("accessToken", "temp_token");
    setIsAuthenticated(true); // 직접 상태 업데이트
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />

      <Card style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/brandlogo-slogun.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subText}>
          즐거운 영어 동요로 학습을 시작해볼까요?
        </Text>

        <View style={styles.loginButtonContainer}>
          <DividerWithText text="SNS 로그인" />
          <KakaoLoginButton onPress={handleKakaoLogin} />

          {/* 임시 홈화면 이동 버튼 추가 */}
          {/* <View style={styles.tempButtonSpacer} />
          <Button
            title="메인 페이지로"
            onPress={handleTempHomeNavigation}
            variant="secondary"
            style={styles.tempHomeButton}
            textStyle={{ fontSize: 18 }}
            height={55} // 원하는 높이 직접 지정
          /> */}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  // 기존 스타일 유지
  textContainer: {
    alignItems: "center",
    marginTop: 5,
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
  loginCard: {
    width: "40%",
    minWidth: 500,
    maxWidth: 600,
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 65,
    borderRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoContainer: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoImage: {
    width: 355,
    height: 200,
  },
  subText: {
    ...theme.typography.body,
    color: theme.colors.subText,
    fontSize: 20,
    marginBottom: 60,
    textAlign: "center",
    lineHeight: 24,
    height: 24,
  },
  loginButtonContainer: {
    width: "50%",
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.accent,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.6,
  },
  // 임시 버튼을 위한 스타일 추가
  tempButtonSpacer: {
    height: theme.spacing.xs, // 카카오 버튼과의 간격
  },
  tempHomeButton: {
    backgroundColor: theme.colors.secondary,
    minWidth: 370,
  },
});

export default LoginScreen;
