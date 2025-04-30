// screens/HomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { RootStackParamList } from '../App';
import BGMToggleButton from '../components/common/BGMToggleButton';
import ProfileButton from '../components/common/ProfileButton';
import ProfileBottomSheet from '../components/common/ProfileBottomSheet';
import MenuCard from '../components/common/home/MenuCard';
import { ProfileProvider, useProfile } from '../contexts/ProfileContext';
import { theme } from '../Theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreenContent: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const { isProfileModalOpen, setProfileModalOpen } = useProfile(); // setProfileModalOpen 추가
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;

  // 프로필 모달 상태에 따른 애니메이션
  useEffect(() => {
    if (isProfileModalOpen) {
      // 스케일 애니메이션 (네이티브 드라이버)
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 테두리 라운드 애니메이션 (JS 드라이버)
      Animated.timing(borderRadiusAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // 스케일 애니메이션 (네이티브 드라이버)
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 테두리 라운드 애니메이션 (JS 드라이버)
      Animated.timing(borderRadiusAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isProfileModalOpen]);

  // 화면 크기 변화 감지
  useEffect(() => {
    // 가로 모드 고정 (태블릿용)
    lockOrientation();

    // 화면 크기 변경 시 dimensions 업데이트
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
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

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  // 화면 크기에 따른 로고 크기 계산
  const logoHeight = dimensions.height * 0.08;
  const logoWidth = logoHeight * 4;

  return (
    <View style={styles.outerContainer}>
      {/* 스케일 애니메이션을 위한 외부 뷰 */}
      <Animated.View
        style={[
          styles.scaleContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* 테두리 애니메이션을 위한 내부 뷰 */}
        <Animated.View
          style={[
            styles.container,
            {
              borderRadius: borderRadiusAnim,
            },
          ]}>
          <View style={styles.gradientOverlay} />

          <View style={styles.header}>
            <Image
              source={require('../assets/images/brandlogo-slogun.png')}
              style={[styles.logo, { height: logoHeight, width: logoWidth }]}
              resizeMode="contain"
            />
            <View style={styles.headerButtons}>
              <BGMToggleButton style={styles.headerButton} />
              <ProfileButton style={styles.headerButton} />
            </View>
          </View>

          <View style={styles.content}>
            <Text
              style={[
                styles.welcomeText,
                { fontSize: dimensions.height * 0.05 },
              ]}>
              안녕하세요! 오늘은 어떤 활동을 해볼까요?
            </Text>
            <View style={styles.menuContainer}>
              <MenuCard
                title="단어 학습"
                icon="book"
                onPress={() => navigateToScreen('LearningScreen')}
              />
              <MenuCard
                title="동요 듣기"
                icon="music"
                onPress={() => navigateToScreen('SongScreen')}
              />
              <MenuCard
                title="단어 도감"
                icon="book-open"
                onPress={() => navigateToScreen('WordcardScreen')}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      {isProfileModalOpen && (
        <ProfileBottomSheet
          visible={isProfileModalOpen}
          onClose={() => {
            // delay를 추가하여 안정성 향상
            setTimeout(() => {
              setProfileModalOpen(false);
            }, 100);
          }}
        />
      )}
    </View>
  );
};

// HomeScreen에 ProfileProvider 감싸기
const HomeScreen: React.FC = () => {
  return (
    <ProfileProvider>
      <HomeScreenContent />
    </ProfileProvider>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scaleContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden', // 라운드 모서리를 위해 필요
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    ...theme.shadows.default,
  },
  logo: {
    // 동적으로 설정
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: theme.spacing.m,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  welcomeText: {
    ...theme.typography.largeTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
});

export default HomeScreen;
