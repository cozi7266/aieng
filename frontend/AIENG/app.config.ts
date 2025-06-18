import { ConfigContext, ExpoConfig } from "@expo/config";
import "dotenv/config";

// 카카오 네이티브 앱 키 환경변수에서 가져오기
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY;
// console.log("Kakao Native Key:", kakaoNativeAppKey);

export default ({ config }: ConfigContext): ExpoConfig => ({
  // 기본 구성
  name: "aieng",
  slug: "snack-2821173a-cc06-41ba-91fd-e370f061b94b",
  version: "1.0.0",
  orientation: "landscape",
  icon: "./assets/images/brandlogo.png",
  userInterfaceStyle: "light",

  // 스플래시 화면 설정
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  // iOS 설정
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ssafy.aieng",
  },

  // Android 설정
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/brandlogo.png",
      backgroundColor: "#ffffff",
    },
    package: "com.ssafy.aieng",
    icon: "./assets/images/brandlogo.png",
    appName: "aieng",
  },

  // 웹 설정
  web: {
    favicon: "./assets/favicon.png",
  },

  // 플러그인 설정
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
          kotlinVersion: "1.8.10",
          gradleVersion: "7.4.2",
          compileSdkVersion: 33,
          targetSdkVersion: 33,
          buildToolsVersion: "33.0.0",
          minSdkVersion: 23,
        },
      },
    ],
    [
      "@react-native-seoul/kakao-login",
      {
        kakaoAppKey: kakaoNativeAppKey,
        overrideKakaoSDKVersion: "2.11.2",
      },
    ],
  ],

  // 딥링크 스키마 설정
  scheme: "aieng",

  extra: {
    eas: {
      projectId: "df946e45-ec3b-4a26-845c-82b90ec5ae71",
    },
    versions: {
      kotlin: "1.8.10",
      gradle: "7.4.2",
      androidGradlePlugin: "7.4.2",
      buildTools: "33.0.0",
      compileSdk: 33,
      targetSdk: 33,
      minSdk: 23,
      kakao: {
        sdk: "2.11.2",
      },
    },
  },
});
