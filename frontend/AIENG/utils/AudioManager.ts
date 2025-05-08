// utils/AudioManager.ts
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

class AudioManager {
  private static instance: AudioManager;
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private soundLoaded: boolean = false;
  private statusListener: ((isPlaying: boolean) => void) | null = null;

  // 싱글톤 패턴 구현
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  setStatusListener(listener: (isPlaying: boolean) => void) {
    this.statusListener = listener;
    // 현재 상태 즉시 알림
    if (this.statusListener) {
      this.statusListener(this.isPlaying);
    }
  }

  async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("오디오 모드 설정 완료");
    } catch (error) {
      console.error("오디오 모드 설정 실패:", error);
    }
  }

  async loadSound() {
    try {
      // 이미 로드된 사운드가 있으면 언로드
      if (this.sound) {
        console.log("기존 사운드 언로드 중...");
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const soundSource = require("../assets/sounds/background-music.mp3");
      const { sound: newSound } = await Audio.Sound.createAsync(
        soundSource,
        { isLooping: true, volume: 1.0 },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = newSound;
      this.soundLoaded = true;
      console.log("사운드 로드 완료");
    } catch (error) {
      console.error("사운드 로드 실패:", error);
      this.soundLoaded = false;
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      const wasPlaying = this.isPlaying;
      this.isPlaying = status.isPlaying;

      // 상태가 변경됐을 때만 알림
      if (wasPlaying !== this.isPlaying && this.statusListener) {
        this.statusListener(this.isPlaying);
      }
    } else if (status.error) {
      console.error(`재생 오류: ${status.error}`);
    }
  }

  async toggleSound() {
    if (!this.sound || !this.soundLoaded) {
      console.log("사운드가 로드되지 않음, 재로드 시도...");
      await this.loadSound();
      if (this.sound) {
        await this.sound.playAsync();
      }
      return;
    }

    try {
      console.log("BGM 토글, 현재 상태:", this.isPlaying);

      if (this.isPlaying) {
        console.log("사운드 일시정지...");
        await this.sound.pauseAsync();
      } else {
        console.log("사운드 재생...");
        const status = await this.sound.getStatusAsync();

        if (status.isLoaded) {
          await this.sound.playAsync();
        } else {
          // 사운드가 언로드된 경우 다시 로드
          await this.loadSound();
          if (this.sound) {
            await this.sound.playAsync();
          }
        }
      }
    } catch (error) {
      console.error("BGM 토글 오류:", error);
      await this.loadSound();
    }
  }

  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup() {
    try {
      if (this.sound) {
        if (this.isPlaying) {
          await this.sound.pauseAsync();
        }
        await this.sound.unloadAsync();
        this.sound = null;
        this.soundLoaded = false;
      }
    } catch (error) {
      console.error("오디오 정리 오류:", error);
    }
  }

  async stopSound() {
    try {
      if (this.sound && this.soundLoaded) {
        console.log("배경 음악 정지...");

        if (this.isPlaying) {
          await this.sound.pauseAsync();
          this.isPlaying = false;

          // 상태 변경 시 리스너에게 알림
          if (this.statusListener) {
            this.statusListener(false);
          }
        }
      }
    } catch (error) {
      console.error("배경 음악 정지 실패:", error);
    }
  }
}

export default AudioManager.getInstance();
