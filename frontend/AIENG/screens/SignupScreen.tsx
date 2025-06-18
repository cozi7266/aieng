// screens/SignupScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { theme } from "../Theme";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// 네비게이션 타입 정의
type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signup"
>;

// Props 타입 정의 추가
type SignupScreenProps = {
  setIsAuthenticated: (value: boolean) => void;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ setIsAuthenticated }) => {
  // useNavigation 훅을 사용하여 navigation 객체 가져오기
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const scrollRef = useRef<ScrollView>(null);

  // 상태 관리
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    gender: "",
    birthDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 유효성 검사
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", gender: "", birthDate: "" };

    if (!childName.trim()) {
      newErrors.name = "아이 이름을 입력해주세요.";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "성별을 선택해주세요.";
      isValid = false;
    }

    if (!year || !month || !day) {
      newErrors.birthDate = "생년월일을 모두 입력해주세요.";
      isValid = false;
    } else {
      // 날짜 유효성 검사
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10) - 1; // JavaScript의 월은 0부터 시작
      const dayNum = parseInt(day, 10);

      const date = new Date(yearNum, monthNum, dayNum);
      const currentYear = new Date().getFullYear();

      if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum ||
        date.getDate() !== dayNum ||
        yearNum <= 1000 ||
        yearNum > currentYear
      ) {
        newErrors.birthDate = "올바른 생년월일을 입력해주세요.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // 회원가입 제출 처리 - API 연동
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // 생년월일 형식 변환 (YYYY-MM-DD)
        const formattedMonth = month.padStart(2, "0");
        const formattedDay = day.padStart(2, "0");
        const birthDate = `${year}-${formattedMonth}-${formattedDay}`;

        // API에 맞는 성별 형식으로 변환 (male -> M, female -> F)
        const genderCode = gender === "male" ? "M" : "F";

        // 액세스 토큰 가져오기
        const token = await AsyncStorage.getItem("accessToken");

        if (!token) {
          Alert.alert(
            "인증 오류",
            "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요."
          );
          return;
        }

        // API 요청 데이터 구성
        const requestData = {
          childName: childName,
          childGender: genderCode,
          childBirthdate: birthDate,
          childImgUrl: "", // 프로필 이미지는 기본값으로 빈 문자열 사용
        };

        console.log("아이 등록 요청 데이터:", requestData);

        // API 호출
        const response = await axios.post(
          "https://www.aieng.co.kr/api/child",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("아이 등록 응답:", response.data);

        if (response.data.success) {
          Alert.alert(
            "회원가입 완료",
            "아이 정보가 성공적으로 등록되었습니다!",
            [
              {
                text: "확인",
                onPress: () => {
                  // 인증 상태 변경하여 Home 화면으로 자동 이동
                  setIsAuthenticated(true);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "등록 실패",
            response.data.error || "알 수 없는 오류가 발생했습니다."
          );
        }
      } catch (error) {
        console.error("아이 등록 API 오류:", error);
        Alert.alert(
          "등록 실패",
          "서버 통신 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 스크롤 핸들러 - 입력 필드가 키보드에 가려지지 않도록 스크롤 조정
  const handleInputFocus = (position: "name" | "gender" | "birthDate") => {
    if (scrollRef.current) {
      let yOffset = 0;

      if (position === "name") {
        yOffset = 0; // 이름 필드는 맨 위
      } else if (position === "gender") {
        yOffset = 120; // 성별 필드 위치
      } else if (position === "birthDate") {
        yOffset = 240; // 생년월일 필드 위치
      }

      // 스크롤 위치 조정
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        <View style={styles.gradientOverlay} />

        <Card style={styles.signupCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/brandlogo-slogun.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.titleText}>아이 정보를 등록해주세요</Text>

          <ScrollView
            ref={scrollRef}
            style={styles.formContainer}
            contentContainerStyle={{
              ...styles.formContentContainer,
              paddingBottom: Platform.OS === "android" ? 120 : theme.spacing.xl,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* 아이 이름 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>아이 이름</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={childName}
                onChangeText={setChildName}
                placeholder="이름을 입력해주세요"
                placeholderTextColor="#9E9E9E"
                onFocus={() => handleInputFocus("name")}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* 성별 선택 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "male" && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender("male")}
                  onFocus={() => handleInputFocus("gender")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === "male" && styles.genderButtonTextSelected,
                    ]}
                  >
                    남자아이
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "female" && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender("female")}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === "female" && styles.genderButtonTextSelected,
                    ]}
                  >
                    여자아이
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.gender ? (
                <Text style={styles.errorText}>{errors.gender}</Text>
              ) : null}
            </View>

            {/* 생년월일 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>생년월일</Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateInputGroup}>
                  <TextInput
                    style={[
                      styles.dateInput,
                      errors.birthDate ? styles.inputError : null,
                    ]}
                    value={year}
                    onChangeText={(text) =>
                      setYear(text.replace(/[^0-9]/g, "").slice(0, 4))
                    }
                    placeholder="년도(YYYY)"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="number-pad"
                    maxLength={4}
                    onFocus={() => handleInputFocus("birthDate")}
                  />
                </View>

                <View style={styles.dateInputGroup}>
                  <TextInput
                    style={[
                      styles.dateInput,
                      errors.birthDate ? styles.inputError : null,
                    ]}
                    value={month}
                    onChangeText={(text) => {
                      const newText = text.replace(/[^0-9]/g, "").slice(0, 2);
                      if (newText === "" || parseInt(newText, 10) <= 12) {
                        setMonth(newText);
                      }
                    }}
                    placeholder="월(MM)"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="number-pad"
                    maxLength={2}
                    onFocus={() => handleInputFocus("birthDate")}
                  />
                </View>

                <View style={styles.dateInputGroup}>
                  <TextInput
                    style={[
                      styles.dateInput,
                      errors.birthDate ? styles.inputError : null,
                    ]}
                    value={day}
                    onChangeText={(text) => {
                      const newText = text.replace(/[^0-9]/g, "").slice(0, 2);
                      if (newText === "" || parseInt(newText, 10) <= 31) {
                        setDay(newText);
                      }
                    }}
                    placeholder="일(DD)"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="number-pad"
                    maxLength={2}
                    onFocus={() => handleInputFocus("birthDate")}
                  />
                </View>
              </View>
              {errors.birthDate ? (
                <Text style={styles.errorText}>{errors.birthDate}</Text>
              ) : null}
            </View>

            {/* 등록 버튼 */}
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? "등록 중..." : "등록하기"}
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
              />
            </View>
          </ScrollView>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // 기존 스타일 유지
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  signupCard: {
    width: "80%",
    minWidth: 550,
    maxWidth: 900,
    height: "75%",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: theme.spacing.l,
    borderRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.s,
  },
  logoImage: {
    width: 250,
    height: 120,
  },
  titleText: {
    ...theme.typography.title,
    color: theme.colors.primary,
    fontSize: 28,
    marginBottom: theme.spacing.m,
    textAlign: "center",
  },
  formContainer: {
    width: "80%",
    flex: 1,
  },
  formContentContainer: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: theme.spacing.m,
    width: "100%",
  },
  label: {
    ...theme.typography.body,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    fontSize: 20,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
    backgroundColor: "#FFFFFF",
  },
  genderButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 20,
    color: theme.colors.text,
  },
  genderButtonTextSelected: {
    color: "#FFFFFF",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInputGroup: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  dateInput: {
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    fontSize: 20,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: theme.spacing.l,
    marginBottom:
      Platform.OS === "android" ? theme.spacing.xxl : theme.spacing.l,
    alignItems: "center",
    width: "100%",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    width: "60%",
    minWidth: 200,
  },
});

export default SignupScreen;
