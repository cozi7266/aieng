// screens/song/SongSettingScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../../App";
import BackButton from "../../components/navigation/BackButton";
import Button from "../../components/common/Button";
import MoodItem from "../../components/songs/MoodItem";
import VoiceItem from "../../components/songs/VoiceItem";
import { theme } from "../../Theme";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";
import { CommonActions } from "@react-navigation/native";

type SongSettingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SongSettingScreen"
>;

// 분위기 인터페이스
interface Mood {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
}

// 목소리 인터페이스
interface Voice {
  id: string;
  name: string;
  gender: "male" | "female" | "custom";
  selected: boolean;
}

const SongSettingScreen: React.FC = () => {
  const navigation = useNavigation<SongSettingScreenNavigationProp>();
  const { width, height } = useWindowDimensions();

  // 반응형 스케일링
  const scaleFactor = Math.min(width / 2000, height / 1200);

  // 상태 관리
  const [moods, setMoods] = useState<Mood[]>([
    { id: "1", name: "행복", emoji: "😊", selected: false },
    { id: "2", name: "슬픔", emoji: "😢", selected: false },
    { id: "3", name: "신남", emoji: "🎉", selected: false },
    { id: "4", name: "화남", emoji: "😡", selected: false },
    { id: "5", name: "사랑", emoji: "❤️", selected: false },
    { id: "6", name: "놀람", emoji: "😲", selected: false },
    { id: "7", name: "평온", emoji: "😌", selected: false },
    { id: "8", name: "설렘", emoji: "🥰", selected: false },
  ]);

  const [voices, setVoices] = useState<Voice[]>([
    {
      id: "1",
      name: "남자 목소리",
      gender: "male",
      selected: false,
    },
    {
      id: "2",
      name: "여자 목소리",
      gender: "female",
      selected: false,
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);

  // 화면 가로 모드 고정
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // 분위기 선택 처리
  const handleMoodSelect = (moodId: string) => {
    setMoods((prevMoods) =>
      prevMoods.map((mood) => ({
        ...mood,
        selected: mood.id === moodId,
      }))
    );
  };

  // 목소리 선택 처리
  const handleVoiceSelect = (voiceId: string) => {
    setVoices((prevVoices) =>
      prevVoices.map((voice) => ({
        ...voice,
        selected: voice.id === voiceId,
      }))
    );
  };

  // 목소리 추가 처리
  const handleAddVoice = () => {
    setIsRecording(true);

    // 녹음 과정 시뮬레이션 (실제 녹음 기능으로 대체 필요)
    setTimeout(() => {
      setIsRecording(false);

      // 새 목소리 추가
      const newVoice: Voice = {
        id: `custom-${Date.now()}`,
        name: "내 목소리",
        gender: "custom",
        selected: false,
      };

      setVoices((prev) => [...prev, newVoice]);
    }, 2000);
  };

  // 목소리 삭제 처리
  const handleDeleteVoice = (voiceId: string) => {
    setVoices((prev) => prev.filter((voice) => voice.id !== voiceId));
  };

  // 설정 저장 및 다음 단계로 진행
  const handleSaveSettings = () => {
    const selectedMood = moods.find((mood) => mood.selected);
    const selectedVoice = voices.find((voice) => voice.selected);

    // 선택 검증
    if (!selectedMood || !selectedVoice) {
      console.log("분위기와 목소리를 모두 선택해 주세요.");
      return;
    }

    console.log("Selected mood:", selectedMood);
    console.log("Selected voice:", selectedVoice);

    // Home 화면으로 이동
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>
            동요 분위기 및 학습 목소리 설정
          </Text>
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.contentContainer}>
        {/* 좌측 - 분위기 설정 */}
        <View style={styles.leftContainer}>
          <Text style={styles.sectionTitle}>동요 분위기 설정</Text>
          <Text style={styles.sectionSubtitle}>
            생성될 동요의 분위기를 선택해주세요
          </Text>

          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <MoodItem
                key={mood.id}
                id={mood.id}
                name={mood.name}
                emoji={mood.emoji}
                isSelected={mood.selected}
                onPress={() => handleMoodSelect(mood.id)}
                style={styles.moodItem}
                scaleFactor={scaleFactor}
              />
            ))}
          </View>
        </View>

        {/* 우측 - 목소리 설정 */}
        <View style={styles.rightContainer}>
          <Text style={styles.sectionTitle}>학습 목소리 설정</Text>
          <Text style={styles.sectionSubtitle}>
            학습에서 텍스트를 읽어줄 목소리를 선택해주세요{"\n"}(1초 이상 눌러
            내 목소리 변경)
          </Text>

          <ScrollView contentContainerStyle={styles.voiceGrid}>
            {voices.map((voice) => (
              <VoiceItem
                key={voice.id}
                id={voice.id}
                name={voice.name}
                gender={voice.gender}
                isSelected={voice.selected}
                onPress={() => handleVoiceSelect(voice.id)}
                onDelete={
                  voice.gender === "custom"
                    ? () => handleDeleteVoice(voice.id)
                    : undefined
                }
                style={styles.voiceItem}
                scaleFactor={scaleFactor}
              />
            ))}

            {/* 목소리 추가 버튼 */}
            <VoiceItem
              id="add-voice"
              name={isRecording ? "녹음 중..." : "내 목소리 추가"}
              gender="custom"
              isSelected={false}
              isAddButton={true}
              onPress={handleAddVoice}
              disabled={isRecording}
              style={styles.voiceItem}
              scaleFactor={scaleFactor}
            />
          </ScrollView>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          title="저장하기"
          onPress={handleSaveSettings}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    ...theme.shadows.default,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing.m,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: theme.colors.accent,
    padding: theme.spacing.l,
  },
  rightContainer: {
    flex: 1,
    padding: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.subText,
    marginBottom: theme.spacing.l,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.s,
  },
  moodItem: {
    width: "22%",
    aspectRatio: 1,
    marginBottom: theme.spacing.m,
  },
  voiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  voiceItem: {
    width: 150,
    height: 180,
    margin: theme.spacing.m,
  },
  buttonContainer: {
    alignItems: "center",
    paddingBottom: theme.spacing.l,
    marginTop: theme.spacing.xl,
  },
});

export default SongSettingScreen;
