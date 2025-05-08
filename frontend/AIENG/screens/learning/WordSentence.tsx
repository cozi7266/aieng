// screens/learning/WordSentence.tsx
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
type WordSentenceParams = {
  wordId: string;
  themeId: string;
  theme: string;
};

type WordSentenceScreenRouteProp = RouteProp<
  { WordSentence: WordSentenceParams },
  "WordSentence"
>;

// 단어 및 문장 데이터 타입 정의
interface SentenceData {
  id: string;
  english: string;
  korean: string;
  sentence: string;
  sentenceKorean: string;
  imageUrl: any;
  audioUrl: string;
}

const WordSentenceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WordSentenceScreenRouteProp>();
  const { wordId, themeId, theme: themeName } = route.params;
  const { stopBgm } = useAudio();

  const [sentence, setSentence] = useState<SentenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // 진행 단계 (2/3 표시를 위한 변수)
  const currentStep = 2;
  const totalSteps = 3;

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const nextButtonAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const fillHeightAnim = useRef(new Animated.Value(0)).current;

  // 플로팅 애니메이션
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
    const fetchSentenceData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 목업 데이터
        const mockSentences = [
          {
            word: "cat",
            sentence: "The cat is sleeping.",
            sentenceKorean: "고양이가 자고 있어요.",
          },
          {
            word: "dog",
            sentence: "The dog is barking.",
            sentenceKorean: "개가 짖고 있어요.",
          },
          {
            word: "rabbit",
            sentence: "The rabbit is jumping.",
            sentenceKorean: "토끼가 뛰고 있어요.",
          },
          {
            word: "bird",
            sentence: "The bird is flying.",
            sentenceKorean: "새가 날고 있어요.",
          },
          {
            word: "fish",
            sentence: "The fish is swimming.",
            sentenceKorean: "물고기가 수영하고 있어요.",
          },
          {
            word: "lion",
            sentence: "The lion is roaring.",
            sentenceKorean: "사자가 으르렁거려요.",
          },
        ];

        const mockWord =
          ["cat", "dog", "rabbit", "bird", "fish", "lion"][
            parseInt(wordId) - 1
          ] || "cat";
        const mockKorean =
          ["고양이", "강아지", "토끼", "새", "물고기", "사자"][
            parseInt(wordId) - 1
          ] || "고양이";
        const mockSentence =
          mockSentences.find((item) => item.word === mockWord) ||
          mockSentences[0];

        setSentence({
          id: wordId,
          english: mockWord,
          korean: mockKorean,
          sentence: mockSentence.sentence,
          sentenceKorean: mockSentence.sentenceKorean,
          imageUrl: require("../../assets/images/main_mascot.png"),
          audioUrl: require("../../assets/sounds/background-music.mp3"),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("API 요청 실패:", error);
        setError("문장 데이터를 불러오는데 실패했습니다");
        setIsLoading(false);
      }
    };

    fetchSentenceData();

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

      // 색상이 아래에서 위로 차오름
      Animated.timing(fillHeightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      fillHeightAnim.setValue(0);
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
        setHasListened(true);
        return;
      }

      setIsPlaying(true);

      if (sound.current) {
        await sound.current.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          sentence.audioUrl,
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

  // 로딩 화면 표시
  if (isLoading || !sentence) {
    return <LoadingScreen message="문장을 불러오는 중..." />;
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
            <Text style={styles.themeName}>{themeName}</Text> - 문장 학습
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
                outputRange: ["0%", "30%"],
              }),
            },
          ]}
        />
      )}

      {/* 메인 콘텐츠 */}
      <View style={styles.mainContainer}>
        {/* 문장 카드 */}
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
                source={sentence.imageUrl}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.sentenceContainer}>
              <Text style={styles.englishWord}>{sentence.english}</Text>
              <Text style={styles.sentenceText}>{sentence.sentence}</Text>
              <Text style={styles.koreanSentence}>
                {sentence.sentenceKorean}
              </Text>
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
                  name={isPlaying ? "stop" : "volume-up"}
                  size={32}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>
                  {isPlaying ? "멈추기" : "문장 듣기"}
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
                  navigation.navigate("WordSelect", {
                    theme: themeName,
                    themeId: themeId,
                  })
                }
              >
                <FontAwesome5
                  name="arrow-circle-right"
                  size={28}
                  color={theme.colors.buttonText}
                />
                <Text style={styles.buttonText}>완료하기</Text>
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
                <Text style={styles.helpSectionTitle}>문장 학습 가이드</Text>
                <Text style={styles.helpText}>
                  단어가 포함된 문장을 듣고 발음해보세요! 단어가 문장 속에서
                  어떻게 사용되는지 이해하는 것이 중요해요.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>학습 팁</Text>
                <Text style={styles.helpText}>
                  문장을 들으면 다음 단계로 넘어갈 수 있어요! 여러 번 들어보고
                  문장을 따라해 보세요.
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
    width: "60%",
    aspectRatio: 1.8,
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
    width: "40%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  image: {
    width: "90%",
    height: "90%",
  },
  sentenceContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  englishWord: {
    ...theme.typography.largeTitle,
    color: theme.colors.primary,
    fontSize: 36,
    marginBottom: 6,
  },
  sentenceText: {
    ...theme.typography.title,
    color: theme.colors.secondary,
    fontSize: 30,
    marginBottom: 8,
    textAlign: "center",
  },
  koreanSentence: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontSize: 22,
    textAlign: "center",
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
    backgroundColor: "rgba(88, 204, 2, 0.2)",
    zIndex: -1,
  },
});

export default WordSentenceScreen;
