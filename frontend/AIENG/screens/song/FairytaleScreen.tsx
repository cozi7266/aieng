// screens/song/FairytaleScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import { RootStackParamList } from "../../App";
import BackButton from "../../components/navigation/BackButton";
import { theme } from "../../Theme";
import { useAudio } from "../../contexts/AudioContext";
import MusicPlayer from "../../components/songs/MusicPlayer";
import FairytaleCarousel from "../../components/songs/FairytaleCarousel";

type FairytaleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FairytaleScreen"
>;

type FairytaleScreenRouteProp = RouteProp<
  RootStackParamList & { FairytaleScreen: { songId: string } },
  "FairytaleScreen"
>;

interface FairytalePage {
  id: string;
  imageUrl: any;
  text: string;
}

interface Fairytale {
  id: string;
  title: string;
  pages: FairytalePage[];
  songId: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any;
  audioUrl: any;
  duration: number;
  favorite?: boolean;
}

const FairytaleScreen: React.FC = () => {
  const navigation = useNavigation<FairytaleScreenNavigationProp>();
  const route = useRoute<FairytaleScreenRouteProp>();
  const { width, height } = useWindowDimensions();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fairytale, setFairytale] = useState<Fairytale | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // For responsive design
  const scaleFactor = Math.min(width / 2000, height / 1200);

  // Audio context from the app
  const { stopBgm } = useAudio();

  // Mock data for development
  const mockFairytale: Fairytale = {
    id: "1",
    title: "Twinkle Twinkle Little Star Story",
    songId: "1",
    pages: [
      {
        id: "page1",
        imageUrl: require("../../assets/icon.png"),
        text: "In a far away sky, there was a little star.",
      },
      {
        id: "page2",
        imageUrl: require("../../assets/icon.png"),
        text: "The little star was always twinkling brightly.",
      },
      {
        id: "page3",
        imageUrl: require("../../assets/icon.png"),
        text: "One night, a child looked up and wondered what the star was.",
      },
      {
        id: "page4",
        imageUrl: require("../../assets/icon.png"),
        text: "Up above the world so high, like a diamond in the sky.",
      },
      {
        id: "page5",
        imageUrl: require("../../assets/icon.png"),
        text: "The star twinkled back at the child, sharing its light across the universe.",
      },
    ],
  };

  const mockSong: Song = {
    id: "1",
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    imageUrl: require("../../assets/icon.png"),
    audioUrl: require("../../assets/sounds/sample.mp3"),
    duration: 228,
    favorite: false,
  };

  useEffect(() => {
    // Lock screen orientation to landscape for tablet
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };

    lockOrientation();

    // Load fairytale and song data
    setFairytale(mockFairytale);
    setSong(mockSong);

    return () => {
      // Cleanup
      ScreenOrientation.unlockAsync();
      stopBgm();
    };
  }, []);

  const handlePreviousPage = () => {
    if (fairytale && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (fairytale && currentPageIndex < fairytale.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // Handle previous song logic
    console.log("Previous song");
  };

  const handleNext = () => {
    // Handle next song logic
    console.log("Next song");
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const handleToggleFavorite = () => {
    if (!song) return;
    setSong((prevSong) =>
      prevSong ? { ...prevSong, favorite: !prevSong.favorite } : null
    );
  };

  // Dynamic styles based on screen size
  const dynamicStyles = {
    header: {
      paddingVertical: theme.spacing.m * scaleFactor,
      paddingHorizontal: theme.spacing.xl * scaleFactor,
    },
    headerTitle: {
      fontSize: theme.typography.title.fontSize * scaleFactor,
    },
    pageIndicator: {
      fontSize: theme.typography.caption.fontSize * scaleFactor,
    },
  };

  if (!fairytale || !song) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>동화책을 불러오고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <BackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
            {fairytale.title}
          </Text>
        </View>
        <View style={styles.pageIndicator}>
          <Text style={[styles.pageIndicatorText, dynamicStyles.pageIndicator]}>
            {currentPageIndex + 1} / {fairytale.pages.length}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Fairy Tale Carousel + 자막 오버레이 */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            alignSelf: "center",
            marginTop: theme.spacing.s,
          }}
        >
          <FairytaleCarousel
            pages={fairytale.pages}
            currentIndex={currentPageIndex}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            scaleFactor={scaleFactor}
          />
          {/* 영화 자막처럼 이미지 위에 자막 띄우기 */}
          <View style={styles.subtitleOverlay} pointerEvents="none">
            <Text style={styles.subtitleText}>
              {fairytale.pages[currentPageIndex].text}
            </Text>
          </View>
        </View>
        {/* Music Player */}
        <View style={styles.playerContainer}>
          {song && (
            <MusicPlayer
              song={song}
              isPlaying={isPlaying}
              isRepeat={isRepeat}
              onPlayPause={handlePlayPause}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRepeat={handleRepeat}
              onToggleFavorite={handleToggleFavorite}
              scaleFactor={scaleFactor}
            />
          )}
        </View>
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
  pageIndicator: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  pageIndicatorText: {
    ...theme.typography.caption,
    color: "white",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  subtitleOverlay: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  subtitleText: {
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    fontSize: theme.typography.body.fontSize * 0.9, // 기존 scaleFactor 유지, 필요시 더 줄일 수 있음
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    textAlign: "center",
    maxWidth: "90%",
  },
  playerContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    width: "85%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.subText,
  },
});

export default FairytaleScreen;
