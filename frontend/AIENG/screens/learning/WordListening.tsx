// screens/learning/WordListening.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../../App";
import { theme } from "../../Theme";
import BackButton from "../../components/navigation/BackButton";
import BGMToggleButton from "../../components/common/BGMToggleButton";
import ProfileButton from "../../components/common/ProfileButton";
import HelpButton from "../../components/common/HelpButton";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useAudio } from "../../contexts/AudioContext";

// 라우트 파라미터 타입 정의
type WordListeningParams = {
  wordId: string;
  themeId: string;
  theme: string;
};

type WordListeningScreenRouteProp = RouteProp<
  { WordListening: WordListeningParams },
  "WordListening"
>;

// 단어 데이터 타입 정의
interface WordData {
  id: string;
  english: string;
  korean: string;
  imageUrl: any;
  audioUrl: string;
}

const WordListeningScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WordListeningScreenRouteProp>();
  const { wordId, themeId, theme: themeName } = route.params;
  const { stopBgm } = useAudio();

  const [word, setWord] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // 진행 단계 (1/3 표시를 위한 변수)
  const currentStep = 1;
  const totalSteps = 3;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const fillHeightAnim = useRef(new Animated.Value(0)).current;

  // 부드러운 플로팅 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 펄스 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 배경 음악 중지
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      stopBgm();
    });
    return unsubscribe;
  }, [navigation, stopBgm]);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchWordData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 목업 데이터
        const mockData = {
          id: wordId,
          english:
            ["cat", "dog", "rabbit", "bird", "fish", "lion"][
              parseInt(wordId) - 1
            ] || "cat",
          korean:
            ["고양이", "강아지", "토끼", "새", "물고기", "사자"][
              parseInt(wordId) - 1
            ] || "고양이",
          image_url: require("../../assets/images/main_mascot.png"),
          audio_url: require("../../assets/sounds/background-music.mp3"),
        };

        setWord({
          id: mockData.id,
          english: mockData.english,
          korean: mockData.korean,
          imageUrl: mockData.image_url,
          audioUrl: mockData.audio_url,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("API 요청 실패:", error);
        setError("단어 데이터를 불러오는데 실패했습니다");
        setIsLoading(false);
      }
    };

    fetchWordData();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [wordId, themeId]);

  // 재생 버튼 애니메이션
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  // 다음 버튼 애니메이션
  useEffect(() => {
    if (hasListened) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(nextButtonAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(nextButtonAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hasListened]);

  // 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();
  }, []);

  // 오디오 재생/정지 처리
  const handlePlayAudio = async () => {
    try {
      if (isPlaying && sound.current) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
        setHasListened(true); // 멈추기 버튼을 눌렀을 때 다음 단계로 이동 가능하게 설정
        return;
      }

      setIsPlaying(true);

      if (sound.current) {
        await sound.current.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          word.audioUrl,
          { shouldPlay: true }
        );

        sound.current = newSound;
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setHasListened(true);
          }
        });
      }
    } catch (error) {
      console.error("오디오 재생 실패:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (hasListened) {
      // 색상이 아래에서 위로 차오름
      Animated.timing(fillHeightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false, // 높이 애니메이션은 native driver 지원 안됨
      }).start();
    } else {
      fillHeightAnim.setValue(0);
    }
  }, [hasListened]);

  // 로딩 화면 표시
  if (isLoading || !word) {
    return <LoadingScreen message="단어를 불러오는 중..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.logoTitleContainer}>
          <Text style={styles.headerTitle}>
            <Text style={styles.themeName}>{themeName}</Text> - 단어 듣기
          </Text>
        </View>

        <View style={styles.headerButtons}>
          <HelpButton
            onPress={() => setHelpModalVisible(true)}
            style={styles.headerButton}
          />
          <BGMToggleButton style={styles.headerButton} />
          <ProfileButton style={styles.headerButton} />
        </View>
      </View>

      {/* 듀오링고 스타일 진행 바 */}
      <View style={styles.duoProgressContainer}>
        <View
          style={[
            styles.duoProgressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {/* 배경 애니메이션 레이어 */}
      {hasListened && (
        <Animated.View
          style={[
            styles.fillBackground,
            {
              height: fillHeightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "25%"],
              }),
            },
          ]}
        />
      )}

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContainer}>
        {/* 중앙 단어 카드 */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={word.imageUrl}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.wordInfo}>
              <Text style={styles.englishWord}>{word.english}</Text>
              <Text style={styles.koreanWord}>({word.korean})</Text>
            </View>
          </View>
        </Animated.View>

        {/* 컨트롤 버튼 영역 */}
        <View style={styles.controlsContainer}>
          {!hasListened ? (
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[styles.actionButton, isPlaying && styles.playingButton]}
                onPress={handlePlayAudio}
              >
                <FontAwesome5
                  name={isPlaying ? "check-circle" : "volume-up"}
                  size={32}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>
                  {isPlaying ? "완료" : "단어 듣기"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: nextButtonAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={() =>
                  navigation.navigate("WordSentence", {
                    wordId: word.id,
                    themeId: themeId,
                    theme: themeName,
                  })
                }
              >
                <FontAwesome5
                  name="arrow-circle-right"
                  size={28}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>계속하기</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* 도움말 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학습 도움말</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHelpModalVisible(false)}
              >
                <FontAwesome5
                  name="times"
                  size={32}
                  color={theme.colors.buttonText}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 가이드</Text>
                <Text style={styles.helpText}>
                  단어를 보고 소리를 들어보세요! 단어의 올바른 발음을 익히는
                  것이 중요해요.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 팁</Text>
                <Text style={styles.helpText}>
                  단어를 들으면 다음 단계로 넘어갈 수 있어요! 여러 번 들어보고
                  발음을 따라해 보세요.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // 헤더 스타일
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
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  logoTitleContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...theme.typography.accent,
    color: theme.colors.secondary,
    fontSize: 40,
    marginBottom: theme.spacing.s,
  },
  themeName: {
    color: theme.colors.primary,
  },
  headerButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerButton: {
    marginLeft: theme.spacing.m,
  },
  // 진행 바
  duoProgressContainer: {
    height: 12,
    backgroundColor: "#E5E5E5",
    width: "100%",
  },
  duoProgressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  // 메인 콘텐츠
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.l,
  },
  cardContainer: {
    width: "38%",
    aspectRatio: 1.2,
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 25,
    padding: theme.spacing.l,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  imageContainer: {
    width: "80%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  image: {
    width: "90%",
    height: "90%",
  },
  wordInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
  englishWord: {
    ...theme.typography.largeTitle,
    color: theme.colors.primary,
    fontSize: 40,
    marginBottom: 6,
  },
  koreanWord: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontSize: 24,
  },
  // 버튼 영역
  controlsContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  buttonContainer: {
    marginBottom: theme.spacing.l,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 220,
    ...theme.shadows.default,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  playingButton: {
    backgroundColor: theme.colors.secondary,
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "60%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    ...theme.shadows.default,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  modalTitle: {
    color: theme.colors.buttonText,
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: theme.spacing.l,
  },
  helpSection: {
    marginBottom: theme.spacing.l,
  },
  helpSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  helpText: {
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 26,
  },
  fillBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(81, 75, 242, 0.15)",
    zIndex: 0, // 기존 요소들보다 낮은 z-index
  },
});

export default WordListeningScreen;
