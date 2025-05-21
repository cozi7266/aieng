// components/songs/MusicPlayer.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { FontAwesome5 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { theme } from "../../Theme";

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: any;
  audioUrl: any;
  duration: number;
  favorite?: boolean;
}

interface MusicPlayerProps {
  song: Song;
  isPlaying: boolean;
  isRepeat: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onToggleFavorite: () => void;
  scaleFactor: number;
  variant?: "song" | "fairytale";
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  song,
  isPlaying,
  isRepeat,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeat,
  onToggleFavorite,
  scaleFactor = 1,
  variant = "song",
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(song.duration);
  const [isLoaded, setIsLoaded] = useState(false); // 사운드 로드 상태 추적을 위한 상태 추가
  const isMountedRef = useRef(true); // 컴포넌트 마운트 상태 추적

  // 사운드 객체가 로드되었는지 확인하는 도우미 함수
  const isSoundLoaded = async () => {
    if (!soundRef.current) return false;

    try {
      const status = await soundRef.current.getStatusAsync();
      return status.isLoaded;
    } catch (error) {
      console.log("사운드 상태 확인 실패:", error);
      return false;
    }
  };

  // 안전하게 사운드 객체 정리
  const cleanupSound = async () => {
    if (!soundRef.current) return;

    try {
      const loaded = await isSoundLoaded();
      if (loaded) {
        // 재생 중이면 정지
        await soundRef.current.stopAsync().catch(() => {});
        // 언로드
        await soundRef.current.unloadAsync().catch(() => {});
      }
    } catch (error) {
      // 오류 발생해도 계속 진행
      console.log("사운드 정리 중 오류 발생, 무시하고 계속:", error);
    } finally {
      soundRef.current = null;
    }
  };

  // 노래 로드 함수
  const loadAudio = async () => {
    if (!isMountedRef.current) return;

    try {
      // 기존 사운드 정리
      await cleanupSound();

      // 컴포넌트가 마운트 상태일 때만 새 사운드 로드
      if (!isMountedRef.current) return;

      console.log("새 오디오 파일 로드 중...", song.title);

      // 새 사운드 로드
      const { sound, status } = await Audio.Sound.createAsync(
        song.audioUrl,
        { isLooping: isRepeat },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      // 로드 상태 업데이트
      setIsLoaded(true);

      // 실제 음원 길이 설정 (있는 경우)
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      } else {
        setDuration(song.duration); // 기본값 사용
      }

      // 재생 상태에 따라 바로 재생
      if (isPlaying && isMountedRef.current) {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("오디오 로드 실패:", error);
      setIsLoaded(false);
    }
  };

  // 재생 상태 업데이트 콜백
  const onPlaybackStatusUpdate = (status: any) => {
    if (!isMountedRef.current) return;

    if (status.isLoaded) {
      // 밀리초 -> 초 변환
      const newPositionSec = status.positionMillis / 1000;
      setCurrentTime(newPositionSec);

      // 슬라이더 값 업데이트 (0-1 사이 값)
      const sliderPosition = status.durationMillis
        ? status.positionMillis / status.durationMillis
        : 0;
      setSliderValue([sliderPosition]);

      // 재생이 끝나면 다음 곡으로 이동하거나 반복 설정에 따라 처리
      if (status.didJustFinish && !status.isLooping) {
        onNext();
      }
    }
  };

  // 노래가 변경될 때 새 오디오 로드
  useEffect(() => {
    // 새로운 노래로 변경될 때 마다 상태 초기화
    setCurrentTime(0);
    setSliderValue([0]);
    setIsLoaded(false);

    // 노래 로드 작업 수행
    loadAudio();

    // 컴포넌트 언마운트 시 사운드 정리
    return () => {
      cleanupSound();
    };
  }, [song.id]);

  // 컴포넌트 마운트/언마운트 감지
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanupSound();
    };
  }, []);

  // 재생 상태가 변경될 때 처리
  useEffect(() => {
    const updatePlaybackState = async () => {
      try {
        // 사운드가 로드되지 않았으면 작업 건너뜀
        if (!soundRef.current || !(await isSoundLoaded())) {
          if (isPlaying) {
            // 재생 요청이 있었지만 사운드가 준비되지 않은 경우 다시 로드
            loadAudio();
          }
          return;
        }

        if (isPlaying) {
          await soundRef.current.playAsync();
        } else {
          await soundRef.current.pauseAsync();
        }
      } catch (error) {
        console.log("재생 상태 변경 실패, 사운드 다시 로드:", error);
        // 오류 발생 시 사운드 다시 로드 시도
        loadAudio();
      }
    };

    updatePlaybackState();
  }, [isPlaying]);

  // 반복 설정이 변경될 때 처리
  useEffect(() => {
    const updateRepeatSetting = async () => {
      try {
        // 사운드가 로드되지 않았으면 작업 건너뜀
        if (!soundRef.current || !(await isSoundLoaded())) return;

        await soundRef.current.setIsLoopingAsync(isRepeat);
      } catch (error) {
        console.log("반복 설정 변경 실패:", error);
      }
    };

    updateRepeatSetting();
  }, [isRepeat]);

  // 슬라이더 값 변경 핸들러
  const handleSliderValueChange = async (values: number[]) => {
    const value = values[0];
    setSliderValue(values);

    // 음악 위치도 업데이트
    const newTime = value * duration;
    setCurrentTime(newTime);

    // 실제 오디오 위치 변경
    try {
      if (soundRef.current && (await isSoundLoaded())) {
        await soundRef.current.setPositionAsync(newTime * 1000); // 밀리초로 변환
      }
    } catch (error) {
      console.log("오디오 위치 변경 실패:", error);
    }
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
          containerStyle={{
            width: variant === "fairytale" ? "85%" : "70%",
            paddingHorizontal: 10,
          }}
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.accent}
          thumbTintColor={theme.colors.primary}
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
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

        <TouchableOpacity
          style={styles.controlButton}
          onPress={onToggleFavorite}
        >
          <FontAwesome5
            name={song.favorite ? "star" : "star"}
            size={24}
            color={song.favorite ? "gold" : theme.colors.primary}
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
