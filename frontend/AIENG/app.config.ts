import { ConfigContext, ExpoConfig } from "@expo/config";

// 카카오 네이티브 앱 키 환경변수에서 가져오기
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  // 기본 구성
  name: "ssafy-ieng",
  slug: "snack-2821173a-cc06-41ba-91fd-e370f061b94b",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  
  // 스플래시 화면 설정
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  
  // iOS 설정
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ssafy.ieng"
  },
  
  // Android 설정
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.ssafy.ieng"
  },
  
  // 웹 설정
  web: {
    favicon: "./assets/favicon.png"
  },
  
  // 플러그인 설정
  plugins: [
    [
      "@react-native-seoul/kakao-login",
      {
        kakaoAppKey: kakaoNativeAppKey, // 환경변수에서 가져온 카카오 앱 키
        kotlinVersion: "1.9.0"
      }
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/"
          ]
        }
      }
    ],
    "expo-web-browser"
  ],
  
  // 딥링크 스키마 설정
  scheme: "ieng"
});
