import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
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
  scaleFactor: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  song,
  isPlaying,
  isRepeat,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeat,
  scaleFactor = 1,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);

  // 노래가 변경될 때 상태 초기화
  useEffect(() => {
    setCurrentTime(0);
    setSliderValue([0]);
  }, [song.id]);

  // 노래 재생 시뮬레이션
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= song.duration) {
            if (isRepeat) {
              // 반복 재생 시 처음부터 다시 시작
              return 0;
            } else {
              // 반복 재생이 아닐 경우 정지
              setTimeout(() => onPlayPause(), 0);
              return prev;
            }
          }
          const newTime = prev + 1;
          // 슬라이더 값도 함께 업데이트 (배열 형태로)
          setSliderValue([newTime / song.duration]);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, song, isRepeat, onPlayPause]);

  // 슬라이더 값 변경 핸들러
  const handleSliderValueChange = (values: number[]) => {
    // values는 배열이므로 첫 번째 요소 사용
    const value = values[0];
    setSliderValue(values);

    // 음악 위치도 업데이트
    const newTime = value * song.duration;
    setCurrentTime(newTime);
  };

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
          containerStyle={{ width: "70%", paddingHorizontal: 10 }}
          value={sliderValue} // 배열 값 사용
          onValueChange={handleSliderValueChange}
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
            size={32 * Math.min(1, scaleFactor)}
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
    marginBottom: theme.spacing.l,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    width: "100%",
    // paddingHorizontal: 0,
  },
  progressBar: {
    flex: 1,
    height: 40,
    width: "100%",
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.subText,
    minWidth: 30,
    marginHorizontal: 10,
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
