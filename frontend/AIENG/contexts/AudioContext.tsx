// context/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AudioManager from "../utils/AudioManager";

type AudioContextType = {
  isBgmPlaying: boolean;
  toggleBgm: () => Promise<void>;
  stopBgm: () => Promise<void>;
};

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 오디오 설정
    const setupAudio = async () => {
      await AudioManager.setupAudio();
      await AudioManager.loadSound();

      // 현재 재생 상태 가져오기
      setIsBgmPlaying(AudioManager.isAudioPlaying());
    };

    setupAudio();

    // 오디오 상태 리스너 설정
    AudioManager.setStatusListener(setIsBgmPlaying);

    // 앱 종료 시 정리
    return () => {
      AudioManager.cleanup();
    };
  }, []);

  const toggleBgm = async () => {
    await AudioManager.toggleSound();
  };

  // 배경음악 정지 함수
  const stopBgm = async () => {
    if (isBgmPlaying) {
      await AudioManager.stopSound(); // AudioManager에 추가 필요한 메소드
      setIsBgmPlaying(false);
    }
  };

  return (
    <AudioContext.Provider value={{ isBgmPlaying, toggleBgm, stopBgm }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio는 AudioProvider 내에서 사용해야 합니다");
  }
  return context;
};
