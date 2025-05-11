// screens/KakaoAuthCallbackScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../Theme";
import { RootStackParamList } from "../App";

type KakaoAuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const KakaoAuthCallbackScreen = () => {
  const navigation = useNavigation<KakaoAuthNavigationProp>();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // URL 파라미터에서 code 추출
        const params = route.params as { code?: string; provider?: string };
        const code = params?.code;
        const provider = params?.provider || "kakao";

        console.log("인증 코드:", code);
        console.log("제공자:", provider);

        if (!code) {
          throw new Error("인증 코드가 없습니다");
        }

        // 서버에 인증 코드 전송
        const response = await axios.post(
          `https://www.aieng.co.kr/api/oauth/${provider}`,
          { code }
        );

        const { success, data, error } = response.data;

        console.log("인증 응답:", response.data);

        if (success && data) {
          // 액세스 토큰 저장
          await AsyncStorage.setItem("accessToken", data.accessToken);

          // isNew 값에 따라 화면 이동
          if (data.user.isNew) {
            navigation.navigate("Home");
          } else {
            navigation.navigate("Signup");
          }
        } else {
          throw new Error(error || "인증 처리 중 오류가 발생했습니다");
        }
      } catch (err) {
        console.error("인증 처리 오류:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    processAuth();
  }, [navigation, route.params]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>카카오 계정으로 로그인 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("Login")}
        >
          로그인 화면으로 돌아가기
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>로그인 정보 처리 중...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: "Pretendard-Medium",
  },
  errorText: {
    color: theme.colors.primary,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Pretendard-Medium",
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "Pretendard-Medium",
  },
});

export default KakaoAuthCallbackScreen;
