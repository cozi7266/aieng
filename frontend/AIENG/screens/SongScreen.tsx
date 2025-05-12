// screens/SongScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../App";
import BackButton from "../components/navigation/BackButton";
import { theme } from "../Theme";
import { useAudio } from "../contexts/AudioContext";

// 노래 관련 컴포넌트 임포트
import SongCard from "../components/songs/SongCard";
import MusicPlayer from "../components/songs/MusicPlayer";
import SongLyrics from "../components/songs/SongLyrics";
import CreateSongButton from "../components/songs/CreateSongButton";

type SongScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SongScreen"
>;

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any; // 로컬 이미지와 URI 문자열 모두 수용
  audioUrl: any;
  duration: number;
  lyrics?: string;
}

const SongScreen: React.FC = () => {
  const navigation = useNavigation<SongScreenNavigationProp>();
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  // 오디오 컨텍스트
  const { toggleBgm, stopBgm } = useAudio();

  // 더미 데이터 - 로컬 이미지 유지
  const mockSongs: Song[] = [
    {
      id: "1",
      title: "Twinkle Twinkle Little Star",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 180,
      lyrics:
        "Twinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky\nTwinkle, twinkle, little star\nHow I wonder what you are",
    },
    {
      id: "2",
      title: "Old MacDonald Had a Farm",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 210,
      lyrics:
        "Old MacDonald had a farm, E-I-E-I-O\nAnd on his farm he had a cow, E-I-E-I-O\nWith a moo moo here and a moo moo there\nHere a moo, there a moo, everywhere a moo moo\nOld MacDonald had a farm, E-I-E-I-O",
    },
    {
      id: "3",
      title: "The Wheels on the Bus",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 195,
      lyrics:
        "The wheels on the bus go round and round\nRound and round, round and round\nThe wheels on the bus go round and round\nAll through the town",
    },
    {
      id: "4",
      title: "Itsy Bitsy Spider",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 165,
      lyrics:
        "The itsy bitsy spider went up the water spout\nDown came the rain and washed the spider out\nOut came the sun and dried up all the rain\nAnd the itsy bitsy spider went up the spout again",
    },
    {
      id: "5",
      title: "Baa Baa Black Sheep",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 150,
      lyrics:
        "Baa, baa, black sheep, have you any wool?\nYes sir, yes sir, three bags full\nOne for the master, one for the dame\nAnd one for the little boy who lives down the lane",
    },
    {
      id: "6",
      title: "Row Row Row Your Boat",
      artist: "Traditional",
      imageUrl: require("../assets/icon.png"),
      audioUrl: require("../assets/sounds/background-music.mp3"),
      duration: 140,
      lyrics:
        "Row, row, row your boat\nGently down the stream\nMerrily, merrily, merrily, merrily\nLife is but a dream",
    },
  ];

  useEffect(() => {
    // 화면 가로 모드 고정 (태블릿용)
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();
    setSongs(mockSongs);

    // 첫번째 노래를 기본 선택
    if (mockSongs.length > 0) {
      setCurrentSong(mockSongs[0]);
    }

    // 화면 크기 변화 감지
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
      ScreenOrientation.unlockAsync();
      stopBgm();
    };
  }, []);

  const handleSongPress = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const previousIndex =
        currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      setCurrentSong(songs[previousIndex]);
    }
  };

  const handleNext = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const nextIndex =
        currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
      setCurrentSong(songs[nextIndex]);
    }
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const handleCreateSong = () => {
    // 동요 생성 화면으로 이동
    console.log("Navigate to song creation");
  };

  const filteredSongs =
    activeTab === "all" ? songs : songs.filter((_, index) => index % 2 === 0); // 즐겨찾기 예시

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>나의 동요 모음</Text>
        </View>

        {/* 탭 선택기 */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              모든 동요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
            onPress={() => setActiveTab("favorites")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "favorites" && styles.activeTabText,
              ]}
            >
              즐겨찾기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <CreateSongButton onPress={handleCreateSong} />
        </View>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.contentContainer}>
        {/* 왼쪽 - 노래 그리드 */}
        <View style={styles.leftContainer}>
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <SongCard
                song={item}
                isActive={currentSong?.id === item.id}
                isPlaying={isPlaying && currentSong?.id === item.id}
                onPress={() => handleSongPress(item)}
              />
            )}
            contentContainerStyle={styles.songGrid}
          />
        </View>

        {/* 오른쪽 - 현재 노래 및 플레이어 */}
        <View style={styles.rightContainer}>
          {currentSong ? (
            <>
              {/* 현재 노래 정보 */}
              <View style={styles.currentSongContainer}>
                <Image
                  source={currentSong.imageUrl}
                  style={styles.currentSongImage}
                  defaultSource={require("../assets/icon.png")}
                />
                <View style={styles.currentSongInfo}>
                  <Text style={styles.currentSongTitle}>
                    {currentSong.title}
                  </Text>
                  <Text style={styles.currentSongArtist}>
                    {currentSong.artist}
                  </Text>
                </View>
              </View>

              {/* 가사 */}
              <SongLyrics lyrics={currentSong.lyrics || "가사가 없습니다"} />

              {/* 뮤직 플레이어 */}
              <MusicPlayer
                song={currentSong}
                isPlaying={isPlaying}
                isRepeat={isRepeat}
                onPlayPause={handlePlayPause}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onRepeat={handleRepeat}
              />
            </>
          ) : (
            <View style={styles.noSongContainer}>
              <Text style={styles.noSongText}>
                재생할 동요를 선택해 주세요.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
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
  tabSelector: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    padding: 4,
  },
  tab: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.pill,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  activeTabText: {
    color: "white",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    flex: 1.5,
    padding: theme.spacing.l,
  },
  rightContainer: {
    flex: 1,
    padding: theme.spacing.l,
    backgroundColor: "white",
    margin: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.default,
  },
  songGrid: {
    paddingVertical: theme.spacing.m,
  },
  currentSongContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.l,
  },
  currentSongImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.l,
  },
  currentSongInfo: {
    flex: 1,
  },
  currentSongTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  currentSongArtist: {
    ...theme.typography.body,
    color: theme.colors.subText,
  },
  noSongContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSongText: {
    ...theme.typography.subTitle,
    color: theme.colors.subText,
  },
});

export default SongScreen;
