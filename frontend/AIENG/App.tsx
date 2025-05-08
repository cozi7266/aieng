// App.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AudioProvider } from "./contexts/AudioContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import LearningScreen from "./screens/LearningScreen";
import SongScreen from "./screens/SongScreen";
import WordcardScreen from "./screens/WordcardScreen";
import WordSelectScreen from "./screens/learning/WordSelect";
import { theme } from "./Theme";
import * as Font from "expo-font";
import { View, ActivityIndicator } from "react-native";

// 네비게이션 파라미터 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  LearningScreen: undefined;
  SongScreen: undefined;
  WordcardScreen: undefined;
  WordSelect: { theme: string; themeId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf"),
          "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
          "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
          "Pretendard-Light": require("./assets/fonts/Pretendard-Light.otf"),
          RixInooAriDuriR: require("./assets/fonts/RixInooAriDuri_Pro Regular.otf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("폰트 로딩 실패:", error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AudioProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar hidden />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LearningScreen" component={LearningScreen} />
            <Stack.Screen name="SongScreen" component={SongScreen} />
            <Stack.Screen name="WordcardScreen" component={WordcardScreen} />
            <Stack.Screen name="WordSelect" component={WordSelectScreen} />
          </Stack.Navigator>
        </NavigationContainer>
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
