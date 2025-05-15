// screens/ProfileSelectScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../App";
import { theme } from "../Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/navigation/BackButton";
import Card from "../components/common/Card";
import NavigationWarningAlert from "../components/navigation/NavigationWarningAlert";
import axios from "axios";
import { Alert } from "react-native";

// 프로필 데이터 타입
interface Profile {
  id: string;
  name: string;
  avatar: any;
  isActive?: boolean;
}

type ProfileSelectScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileSelect"
>;

type ProfileSelectScreenProps = {
  setIsAuthenticated: (value: boolean) => void;
};

const ProfileSelectScreen: React.FC<ProfileSelectScreenProps> = ({
  setIsAuthenticated,
}) => {
  const navigation = useNavigation<ProfileSelectScreenNavigationProp>();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // 가상 프로필 데이터 (추후 API 연동)
  const mockProfiles: Profile[] = [
    {
      id: "1",
      name: "박하나",
      avatar: require("../assets/images/main_mascot.png"),
      isActive: true,
    },
    {
      id: "2",
      name: "박둘",
      avatar: require("../assets/images/main_mascot.png"),
    },
    {
      id: "3",
      name: "박셋",
      avatar: require("../assets/images/main_mascot.png"),
    },
  ];

  useEffect(() => {
    // 화면 진입 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 프로필 데이터 로딩
    setProfiles(mockProfiles);

    // 화면 크기 변경 감지
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  // 프로필 선택 핸들러
  const handleProfileSelect = (profileId: string) => {
    // 선택된 프로필 업데이트
    const updatedProfiles = profiles.map((profile) => ({
      ...profile,
      isActive: profile.id === profileId,
    }));
    setProfiles(updatedProfiles);

    // 선택 애니메이션 후 홈으로 이동
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("Home");
    });
  };

  // 프로필 추가 핸들러 - NavigationWarningAlert 사용
  const handleAddProfile = () => {
    NavigationWarningAlert.show({
      title: "프로필 추가",
      message: "새 프로필을 만들어 볼까요?",
      confirmText: "만들기",
      cancelText: "취소",
      onConfirm: () => {
        navigation.navigate("Signup");
      },
    });
  };

  // 회원 탈퇴 핸들러 - NavigationWarningAlert 사용
  const handleDeleteAccount = () => {
    NavigationWarningAlert.show({
      title: "회원 탈퇴하기",
      message:
        "정말로 회원 탈퇴를 진행하시겠어요? 이 작업은 되돌릴 수 없습니다.",
      confirmText: "탈퇴하기",
      cancelText: "취소",
      onConfirm: async () => {
        try {
          // JWT 토큰 가져오기
          const token = await AsyncStorage.getItem("accessToken");

          if (!token) {
            console.error("토큰이 없습니다");
            Alert.alert(
              "오류",
              "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
            );
            return;
          }

          // 로딩 상태 표시 (선택적)
          // setLoading(true);

          console.log("회원 탈퇴 API 요청 시작");

          // API 요청 헤더 설정
          const headers = {
            Authorization: `Bearer ${token}`,
          };

          // 회원 탈퇴 API 호출
          const response = await axios.put(
            "https://www.aieng.co.kr/api/user/me",
            {},
            { headers }
          );

          console.log("API 응답 상태:", response.status);

          // 성공적으로 처리됐는지 확인 (204 상태 코드)
          if (response.status === 204) {
            console.log("회원 탈퇴 성공");

            // 토큰 삭제
            await AsyncStorage.removeItem("accessToken");

            // 퇴장 애니메이션
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // 인증 상태 업데이트하여 로그인 화면으로 이동
              setIsAuthenticated(false);
            });
          } else {
            throw new Error("예상치 못한 응답 상태: " + response.status);
          }
        } catch (error) {
          console.error("회원 탈퇴 처리 중 오류:", error);

          // 사용자에게 오류 알림
          Alert.alert(
            "회원 탈퇴 실패",
            "회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        } finally {
          // 로딩 상태 해제 (선택적)
          // setLoading(false);
        }
      },
    });
  };

  // 화면 크기에 맞게 그리드 설정
  const isLandscape = dimensions.width > dimensions.height;
  const columns = isLandscape ? 4 : 2;
  const itemWidth = Math.min(dimensions.width / (columns + 0.5), 280);

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={[
          styles.scaleContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.gradientOverlay} />

          {/* Header */}
          <View style={styles.header}>
            <BackButton
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Text style={styles.title}>프로필 선택</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>누구의 프로필로 학습할까요?</Text>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.profileGrid}>
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    style={[
                      styles.profileCard,
                      profile.isActive && styles.activeCard,
                      { width: itemWidth, height: itemWidth * 1.2 },
                    ]}
                    variant="default"
                  >
                    <TouchableOpacity
                      style={styles.profileCardContent}
                      onPress={() => handleProfileSelect(profile.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.avatarContainer}>
                        <Image
                          source={profile.avatar}
                          style={styles.avatarImage}
                          resizeMode="cover"
                        />
                        {profile.isActive && (
                          <View style={styles.activeIndicator}>
                            <FontAwesome5
                              name="check"
                              size={18}
                              color="white"
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.profileName}>{profile.name}</Text>
                    </TouchableOpacity>
                  </Card>
                ))}

                {/* 프로필 추가 버튼 */}
                <Card
                  style={[
                    styles.profileCard,
                    styles.addProfileCard,
                    { width: itemWidth, height: itemWidth * 1.2 },
                  ]}
                  variant="outlined"
                >
                  <TouchableOpacity
                    style={styles.profileCardContent}
                    onPress={handleAddProfile}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addAvatarContainer}>
                      <FontAwesome5
                        name="plus"
                        size={32}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.addProfileText}>프로필 추가</Text>
                  </TouchableOpacity>
                </Card>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteAccountText}>회원 탈퇴하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  backButton: {
    marginLeft: -theme.spacing.s,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  placeholder: {
    width: 24,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.subTitle,
    textAlign: "center",
    color: theme.colors.text,
    marginVertical: theme.spacing.l,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: theme.spacing.m,
    padding: theme.spacing.l,
  },
  profileCard: {
    padding: 0,
    overflow: "hidden",
  },
  profileCardContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.m,
  },
  activeCard: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.m,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
  },
  addProfileCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.accent}20`,
  },
  addAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.m,
  },
  addProfileText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: theme.spacing.m,
  },
  deleteAccountButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.tertiary,
  },
  deleteAccountText: {
    ...theme.typography.caption,
    color: theme.colors.subText,
  },
});

export default ProfileSelectScreen;
