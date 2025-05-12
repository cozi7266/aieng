import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any;
  audioUrl: any;
  duration: number;
}

interface MusicPlayerProps {
  song: Song;
  isPlaying: boolean;
  isRepeat: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeat: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  song,
  isPlaying,
  isRepeat,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeat,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 노래 재생 시뮬레이션
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= song.duration) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, song]);

  // 진행 상태 업데이트
  useEffect(() => {
    setProgress(currentTime / song.duration);
  }, [currentTime, song.duration]);

  // 시간 포맷팅 (초 -> MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.progressBar}
          value={progress}
          onValueChange={(value) => setProgress(value)}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.accent}
          thumbTintColor={theme.colors.primary}
        />
        <Text style={styles.timeText}>{formatTime(song.duration)}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isRepeat && styles.activeButton]}
          onPress={onRepeat}
        >
          <FontAwesome5
            name="redo"
            size={24}
            color={isRepeat ? "white" : theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
          <FontAwesome5
            name="step-backward"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
          <FontAwesome5
            name={isPlaying ? "pause" : "play"}
            size={32}
            color="white"
            style={isPlaying ? {} : { marginLeft: 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={onNext}>
          <FontAwesome5
            name="step-forward"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <FontAwesome5
            name="volume-up"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.default,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
    width: "100%",
  },
  progressBar: {
    flex: 1,
    height: 40,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.subText,
    minWidth: 50,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButton: {
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.pill,
    marginHorizontal: theme.spacing.m,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.pill,
    marginHorizontal: theme.spacing.l,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.default,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default MusicPlayer;
