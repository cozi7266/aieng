// components/common/ProfileBottomSheet.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity, // TouchableOpacity 추가
  BackHandler,
  Platform,
  Easing,
  InteractionManager,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

interface ProfileBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  setIsAuthenticated: (value: boolean) => void;
}

const { height, width } = Dimensions.get("window");

const ProfileBottomSheet: React.FC<ProfileBottomSheetProps> = ({
  visible,
  onClose,
  setIsAuthenticated,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // 모달 닫기 함수 - 애니메이션 완료 후 상호작용 처리
  const handleClose = () => {
    // 애니메이션이 끝난 후 onClose 호출
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // InteractionManager.runAfterInteractions(() => {
      //   onClose();
      // });
      setTimeout(() => onClose(), 50);
    });
  };

  // 바텀시트 표시/숨김 애니메이션
  useEffect(() => {
    if (visible) {
      // 백 버튼 처리 (Android)
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (visible) {
            handleClose(); // onClose 대신 handleClose 호출
            return true;
          }
          return false;
        }
      );

      // 바텀시트 표시 애니메이션
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      return () => backHandler.remove();
    }
  }, [visible]);

  const handleProfileChange = () => {
    handleClose(); // 먼저 바텀시트 닫기
    navigation.navigate("ProfileSelect"); // 프로필 선택 화면으로 이동
  };

  const handleLogout = async () => {
    try {
      // accessToken과 selectedChildId 모두 삭제
      await Promise.all([
        AsyncStorage.removeItem("accessToken"),
        AsyncStorage.removeItem("selectedChildId"),
      ]);

      handleClose();
      // 인증 상태를 먼저 변경
      setIsAuthenticated(false);
      // 네비게이션은 필요 없음 - 상태 변화로 자동 처리됨
    } catch (error) {
      console.error("로그아웃 처리 중 오류 발생:", error);
    }
  };

  // visible이 false고 완전히 닫혔을 때 null 반환
  if (!visible && opacity._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacity,
        },
      ]}
    >
      {/* 오버레이 영역 - 터치하면 모달이 닫힘 */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlayTouch} />
      </TouchableWithoutFeedback>

      {/* 바텀 시트 영역 - 이벤트 버블링 방지 */}
      <TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: translateY }],
              paddingBottom: Math.max(20, insets.bottom),
            },
          ]}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>프로필 설정</Text>

          <TouchableOpacity style={styles.option} onPress={handleProfileChange}>
            <FontAwesome5
              name="user-edit"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}>프로필 변경</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <FontAwesome5
              name="sign-out-alt"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.optionText}> 로그아웃</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  overlayTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0, // 화면 하단에 위치시킴
    width: "80%",
    alignSelf: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    // paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...theme.shadows.default,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    ...theme.typography.title,
    fontSize: 26,
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  optionText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.m,
    color: theme.colors.text,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.accent,
    marginVertical: theme.spacing.xs,
  },
});

export default ProfileBottomSheet;
