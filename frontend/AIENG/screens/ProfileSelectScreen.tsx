// screens/ProfileSelectScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../App";
import { theme } from "../Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/navigation/BackButton";
import Card from "../components/common/Card";
import NavigationWarningAlert from "../components/navigation/NavigationWarningAlert";
import NavigationAlert from "../components/navigation/NavigationAlert";
import axios from "axios";

// API 응답의 아이 프로필 데이터 타입
interface ChildProfile {
  userId: number;
  childId: number;
  childName: string;
  childGender: string;
  childBirthday: string;
}

// 화면에서 사용하는 프로필 타입
interface Profile {
  id: string;
  name: string;
  childGender?: string;
  childBirthday?: string;
  isActive?: boolean;
}

type ProfileSelectScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileSelect"
>;

type ProfileSelectScreenProps = {
  setIsAuthenticated: (value: boolean) => void;
};

// axios 인터셉터 설정
axios.interceptors.request.use(async (config) => {
  const childId = await AsyncStorage.getItem("selectedChildId");
  if (childId) {
    config.headers["X-Child-Id"] = childId;
  }
  return config;
});

const ProfileSelectScreen: React.FC<ProfileSelectScreenProps> = ({
  setIsAuthenticated,
}) => {
  const navigation = useNavigation<ProfileSelectScreenNavigationProp>();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [isLoading, setIsLoading] = useState(true);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // 화면 크기 변화 감지
  useEffect(() => {
    // 가로 모드 고정
    lockOrientation();

    // 화면 크기 변경 시 dimensions 업데이트
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const lockOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  // API에서 아이 프로필 데이터 가져오기
  const fetchChildProfiles = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const savedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        console.error("토큰이 없습니다");
        Alert.alert(
          "오류",
          "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
        );
        setIsAuthenticated(false);
        return;
      }

      console.log("아이 프로필 API 요청 시작");

      const response = await axios.get("https://www.aieng.co.kr/api/child", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API 응답:", response.data);

      if (response.data.success) {
        // 프로필 데이터 변환
        const profilesWithActive = response.data.data.map(
          (child: ChildProfile) => ({
            id: child.childId.toString(),
            name: child.childName,
            childGender: child.childGender,
            childBirthday: child.childBirthday,
            isActive: child.childId.toString() === savedChildId, // 저장된 자녀 ID와 일치하는 프로필을 활성화
          })
        );

        // 저장된 자녀 ID가 없거나 일치하는 프로필이 없는 경우 첫 번째 프로필을 활성화
        if (
          !savedChildId ||
          !profilesWithActive.some((profile: Profile) => profile.isActive)
        ) {
          if (profilesWithActive.length > 0) {
            profilesWithActive[0].isActive = true;
            await AsyncStorage.setItem(
              "selectedChildId",
              profilesWithActive[0].id
            );
          }
        }

        setProfiles(profilesWithActive);
      } else {
        Alert.alert(
          "오류",
          response.data.error?.message || "프로필을 불러오는데 실패했습니다."
        );
      }
    } catch (error) {
      console.error("프로필 로딩 오류:", error);
      Alert.alert(
        "프로필 로딩 실패",
        "프로필 정보를 가져오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchChildProfiles();
  }, []);

  // 화면이 포커스될 때마다 프로필 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchChildProfiles();
    }, [])
  );

  // 프로필 선택 핸들러
  const handleProfileSelect = async (profileId: string) => {
    try {
      // 선택된 프로필 업데이트
      const updatedProfiles = profiles.map((profile) => ({
        ...profile,
        isActive: profile.id === profileId,
      }));
      setProfiles(updatedProfiles);

      // 선택된 자녀 ID를 AsyncStorage에 저장
      await AsyncStorage.setItem("selectedChildId", profileId);

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
    } catch (error) {
      console.error("프로필 선택 처리 중 오류:", error);
      Alert.alert(
        "오류",
        "프로필 선택 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  // 프로필 추가 핸들러
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

  // 프로필 삭제 핸들러
  const handleDeleteProfile = async (profileId: string) => {
    NavigationWarningAlert.show({
      title: "프로필 삭제",
      message: "이 프로필을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      confirmText: "삭제하기",
      cancelText: "취소",
      onConfirm: async () => {
        try {
          const token = await AsyncStorage.getItem("accessToken");

          if (!token) {
            console.error("토큰이 없습니다");
            Alert.alert(
              "오류",
              "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
            );
            return;
          }

          const response = await axios.put(
            `https://www.aieng.co.kr/api/child/${profileId}/delete`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            // 프로필 목록에서 삭제된 프로필 제거
            setProfiles(profiles.filter((profile) => profile.id !== profileId));
            NavigationAlert.show({
              title: "성공",
              message: "프로필이 삭제되었습니다.",
              confirmText: "확인",
              onConfirm: () => {},
            });
          } else {
            throw new Error("예상치 못한 응답 상태: " + response.status);
          }
        } catch (error) {
          console.error("프로필 삭제 처리 중 오류:", error);
          Alert.alert(
            "프로필 삭제 실패",
            "프로필 삭제 처리 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      },
    });
  };

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = () => {
    NavigationWarningAlert.show({
      title: "회원 탈퇴하기",
      message:
        "정말로 회원 탈퇴를 진행하시겠어요? 이 작업은 되돌릴 수 없습니다.",
      confirmText: "탈퇴하기",
      cancelText: "취소",
      onConfirm: async () => {
        try {
          const token = await AsyncStorage.getItem("accessToken");

          if (!token) {
            console.error("토큰이 없습니다");
            Alert.alert(
              "오류",
              "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
            );
            return;
          }

          const response = await axios.put(
            "https://www.aieng.co.kr/api/user/me",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 204) {
            await AsyncStorage.removeItem("accessToken");
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
              setIsAuthenticated(false);
            });
          } else {
            throw new Error("예상치 못한 응답 상태: " + response.status);
          }
        } catch (error) {
          console.error("회원 탈퇴 처리 중 오류:", error);
          Alert.alert(
            "회원 탈퇴 실패",
            "회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요."
          );
          // 오류 발생 시에도 로그인 화면으로 이동
          await AsyncStorage.removeItem("accessToken");
          setIsAuthenticated(false);
        }
      },
    });
  };

  // 화면 크기에 맞게 그리드 설정
  const isLandscape = dimensions.width > dimensions.height;
  const columns = isLandscape ? 4 : 2;
  const itemWidth = Math.min(dimensions.width / (columns + 0.5), 280);

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>프로필을 불러오고 있어요...</Text>
      </View>
    );
  }

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
            <Text style={styles.title}>프로필 선택</Text>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>누구의 프로필로 학습할까요?</Text>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.profileGrid}>
                {profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <Card
                      key={profile.id}
                      style={
                        [
                          styles.profileCard,
                          profile.isActive && styles.activeCard,
                          { width: itemWidth, height: itemWidth * 0.5 },
                        ] as any
                      }
                      variant="default"
                    >
                      <TouchableOpacity
                        style={styles.profileCardContent}
                        onPress={() => handleProfileSelect(profile.id)}
                        onLongPress={() => handleDeleteProfile(profile.id)}
                        activeOpacity={0.8}
                        delayLongPress={500}
                      >
                        <View style={styles.nameContainer}>
                          {profile.isActive && (
                            <View style={styles.activeIndicator}>
                              <FontAwesome5
                                name="check"
                                size={28}
                                color="white"
                              />
                            </View>
                          )}
                          <Text style={styles.profileName}>{profile.name}</Text>
                        </View>
                      </TouchableOpacity>
                    </Card>
                  ))
                ) : (
                  <Text style={styles.noProfileText}>
                    아직 등록된 프로필이 없어요. 프로필을 추가해보세요!
                  </Text>
                )}

                {/* 프로필 추가 버튼 */}
                {profiles.length < 8 && (
                  <Card
                    style={
                      [
                        styles.profileCard,
                        styles.addProfileCard,
                        { width: itemWidth, height: itemWidth * 0.5 },
                      ] as any
                    }
                    variant="outlined"
                  >
                    <TouchableOpacity
                      style={styles.profileCardContent}
                      onPress={handleAddProfile}
                      activeOpacity={0.8}
                    >
                      <View style={styles.addNameContainer}>
                        <FontAwesome5
                          name="plus"
                          size={24}
                          color={theme.colors.primary}
                          style={{ marginRight: theme.spacing.s }}
                        />
                        <Text style={styles.addProfileText}>프로필 추가</Text>
                      </View>
                    </TouchableOpacity>
                  </Card>
                )}
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginTop: theme.spacing.m,
  },
  noProfileText: {
    ...theme.typography.body,
    fontSize: 20,
    color: theme.colors.subText,
    textAlign: "center",
    marginVertical: theme.spacing.l,
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l + 5,
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    ...theme.shadows.default,
    minHeight: 60,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    marginBottom: 0,
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
  nameContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.l,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: {
    ...theme.typography.title,
    fontSize: 36,
    color: theme.colors.text,
    textAlign: "center",
  },
  addProfileCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.accent}20`,
  },
  addNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addProfileText: {
    ...theme.typography.body,
    fontSize: 24,
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
