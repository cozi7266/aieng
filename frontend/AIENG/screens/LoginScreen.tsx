// screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import KakaoLoginButton from '../components/common/auth/KaKaoLoginButton';
import { theme } from '../Theme';
import { RootStackParamList } from '../App';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

// 네비게이션 타입 정의
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const DividerWithText = ({ text }) => (
  <View style={styles.dividerContainer}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>{text}</Text>
    <View style={styles.dividerLine} />
  </View>
);

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도');
    // 카카오 로그인 SDK 연동 로직 구현
    // 로그인 성공 시 회원가입 화면으로 이동
    navigation.navigate('Signup');
  };

  // 임시 홈스크린 이동 함수 추가
  const handleTempHomeNavigation = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />

      <Card style={styles.loginCard}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/brandlogo-slogun.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subText} includeFontPadding={false}>
          즐거운 영어 동요로 학습을 시작해볼까요?
        </Text>

        <View style={styles.loginButtonContainer}>
          <DividerWithText text="SNS 로그인" />
          <KakaoLoginButton onPress={handleKakaoLogin} />

          {/* 임시 홈화면 이동 버튼 추가 */}
          <View style={styles.tempButtonSpacer} />
          <Button
            title="메인 페이지로"
            onPress={handleTempHomeNavigation}
            variant="secondary"
            style={styles.tempHomeButton}
            textStyle={{ fontSize: 18 }}
            height={55} // 원하는 높이 직접 지정
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // 기존 스타일 유지
  textContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.accent,
    opacity: 0.1,
  },
  loginCard: {
    width: '40%',
    minWidth: 500,
    maxWidth: 600,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 65,
    borderRadius: 30,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 355,
    height: 200,
  },
  subText: {
    ...theme.typography.body,
    color: theme.colors.subText,
    fontSize: 20,
    marginBottom: 60,
    textAlign: 'center',
    lineHeight: 24,
    height: 24,
  },
  loginButtonContainer: {
    width: '50%',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.accent,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.6,
  },
  // 임시 버튼을 위한 스타일 추가
  tempButtonSpacer: {
    height: theme.spacing.xs, // 카카오 버튼과의 간격
  },
  tempHomeButton: {
    backgroundColor: theme.colors.secondary,
    minWidth: 370,
  },
});

export default LoginScreen;
