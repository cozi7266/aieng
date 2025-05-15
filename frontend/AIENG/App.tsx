// App.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  LogBox,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AudioProvider } from "./contexts/AudioContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileSelectScreen from "./screens/ProfileSelectScreen";
import LearningScreen from "./screens/LearningScreen";
import SongScreen from "./screens/SongScreen";
import SongSettingScreen from "./screens/song/SongSettingScreen";
import WordcardScreen from "./screens/WordcardScreen";
import WordSelectScreen from "./screens/learning/WordSelect";
import WordListeningScreen from "./screens/learning/WordListening";
import WordSentenceScreen from "./screens/learning/WordSentence";
import WordQuizScreen from "./screens/learning/WordQuiz";
import { theme } from "./Theme";
import * as Font from "expo-font";
import { AlertProvider } from "./components/navigation/NavigationWarningAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "./components/common/LoadingScreen";

// NativeEventEmitter 경고 무시
LogBox.ignoreLogs([
  "new NativeEventEmitter()",
  "`new NativeEventEmitter()` was called with a non-null argument",
]);

// 네비게이션 파라미터 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  ProfileSelect: undefined;
  LearningScreen: undefined;
  SongScreen: undefined;
  SongSettingScreen: undefined;
  WordcardScreen: undefined;
  WordSelect: { theme: string; themeId: string };
  WordListening: {
    wordId: string;
    themeId: string;
    theme: string;
  };
  WordSentence: {
    wordId: string;
    themeId: string;
    theme: string;
  };
  WordQuiz: {
    wordId: string;
    themeId: string;
    theme: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 초기값을 false로 설정
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf"),
          "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
          "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
          "Pretendard-Light": require("./assets/fonts/Pretendard-Light.otf"),
          RixInooAriDuriR: require("./assets/fonts/RixInooAriDuri_ProRegular.otf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("폰트 로딩 실패:", error);
      }
    }
    loadFonts();

    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("토큰 확인 실패:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthToken();

    // 앱이 포그라운드로 돌아올 때마다 인증 상태 확인
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkAuthToken();
      }
    };

    // 버전에 따라 다른 이벤트 리스너 등록 방식 사용
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      // 버전에 따른 이벤트 리스너 제거 방식 사용
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen message="앱을 시작하고 있어요..." />;
  }

  return (
    <AudioProvider>
      <SafeAreaProvider>
        <AlertProvider>
          <NavigationContainer>
            <StatusBar hidden />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!isAuthenticated ? (
                // 인증되지 않은 사용자를 위한 스택
                <>
                  <Stack.Screen name="Login">
                    {(props) => (
                      <LoginScreen
                        {...props}
                        setIsAuthenticated={setIsAuthenticated}
                      />
                    )}
                  </Stack.Screen>
                </>
              ) : (
                // 인증된 사용자를 위한 스택
                <>
                  <Stack.Screen name="Signup">
                    {(props) => (
                      <SignupScreen
                        {...props}
                        setIsAuthenticated={setIsAuthenticated}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Home">
                    {(props) => (
                      <HomeScreen
                        {...props}
                        setIsAuthenticated={setIsAuthenticated}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="ProfileSelect">
                    {(props) => (
                      <ProfileSelectScreen
                        {...props}
                        setIsAuthenticated={setIsAuthenticated}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="LearningScreen"
                    component={LearningScreen}
                  />
                  <Stack.Screen name="SongScreen" component={SongScreen} />
                  <Stack.Screen
                    name="SongSettingScreen"
                    component={SongSettingScreen}
                  />
                  <Stack.Screen
                    name="WordcardScreen"
                    component={WordcardScreen}
                  />
                  <Stack.Screen
                    name="WordSelect"
                    component={WordSelectScreen}
                  />
                  <Stack.Screen
                    name="WordListening"
                    component={WordListeningScreen}
                  />
                  <Stack.Screen
                    name="WordSentence"
                    component={WordSentenceScreen}
                  />
                  <Stack.Screen name="WordQuiz" component={WordQuizScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AlertProvider>
      </SafeAreaProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
