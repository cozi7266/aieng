// App.tsx
import React from "react";
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
import { theme } from "./Theme";

// 네비게이션 파라미터 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  LearningScreen: undefined;
  SongScreen: undefined;
  WordcardScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
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
});
