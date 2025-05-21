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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

type SongSettingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SongSettingScreen"
>;

// 분위기 인터페이스
interface Mood {
  moodId: number;
  name: string;
  emoji: string;
  selected: boolean;
}

// 목소리 인터페이스
interface Voice {
  voiceId: number;
  childId: number | null;
  name: string;
  description: string;
  audioUrl: string;
  selected: boolean;
}

// TTS 목소리 인터페이스
interface TTSVoice {
  voiceId: number;
  childId: number | null;
  name: string;
  description: string;
  audioUrl: string;
  selected: boolean;
}

// API 응답 타입
interface SongSettingResponse {
  success: boolean;
  data: {
    moods: {
      moodId: number;
      name: string;
    }[];
    voices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
  };
  error: null | string;
}

// TTS API 응답 타입
interface TTSVoiceResponse {
  success: boolean;
  data: {
    defaultVoices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
    customVoices: {
      voiceId: number;
      childId: number | null;
      name: string;
      description: string;
      audioUrl: string;
    }[];
  };
  error: null | string;
}

// API 응답 타입 추가
interface SaveSettingsResponse {
  success: boolean;
  data: null;
  error: null | string;
}

// API 응답 타입 추가
interface DeleteVoiceResponse {
  success: boolean;
  data: null;
  error: null | string;
}

// 분위기별 이모지 매핑
const MOOD_EMOJIS: { [key: string]: string } = {
  happy: "😊",
  calm: "🧘",
  energetic: "💪",
  playful: "😜",
  love: "❤️",
  fun: "🎉",
  educational: "🎓",
  warm: "🌞",
};

const SongSettingScreen: React.FC = () => {
  const navigation = useNavigation<SongSettingScreenNavigationProp>();
  const { width, height } = useWindowDimensions();

  // 반응형 스케일링
  const scaleFactor = Math.min(width / 2000, height / 1200);

  // 동적 스타일 생성
  const dynamicStyles = {
    tabButton: {
      paddingVertical: theme.spacing.s * scaleFactor,
      paddingHorizontal: theme.spacing.l * scaleFactor,
    },
    tabText: {
      fontSize: theme.typography.button.fontSize * scaleFactor,
    },
    savedRecordingsContainer: {
      width: "100%",
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.m,
    },
    savedRecordingsList: {
      maxHeight: 200,
      marginTop: theme.spacing.m,
    },
    savedRecordingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.m,
      backgroundColor: "white",
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.s,
      ...theme.shadows.default,
    },
    savedRecordingTime: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    savedRecordingControls: {
      flexDirection: "row",
      gap: theme.spacing.m,
    },
    savedRecordingButton: {
      padding: theme.spacing.s,
    },
  };

  // 상태 관리
  const [activeTab, setActiveTab] = useState<"song" | "tts">("song");
  const [moods, setMoods] = useState<Mood[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [ttsVoices, setTTSVoices] = useState<TTSVoice[]>([]);
  const [isTTSRecording, setIsTTSRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 녹음 관련 상태 추가
  const [recordingStatus, setRecordingStatus] = useState<
    "notStarted" | "recording" | "finished"
  >("notStarted");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxRecordingDuration] = useState(15); // 15초 최대
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [savedRecordings, setSavedRecordings] = useState<
    { id: string; uri: string; timestamp: number }[]
  >([]);

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

  // 동요 설정 조회
  const fetchSongSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/song-settings");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      const response = await axios.get<SongSettingResponse>(
        "https://www.aieng.co.kr/api/voice/song-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const { moods: apiMoods, voices: apiVoices } = response.data.data;

        // 분위기에 이모지 추가
        const moodsWithEmoji = apiMoods.map((mood) => ({
          ...mood,
          emoji: MOOD_EMOJIS[mood.name] || "😊", // 기본 이모지 설정
          selected: false,
        }));

        // 목소리 상태 업데이트
        const voicesWithSelected = apiVoices.map((voice) => ({
          ...voice,
          selected: false,
        }));

        setMoods(moodsWithEmoji);
        setVoices(voicesWithSelected);
      } else {
        throw new Error(
          response.data.error || "동요 설정을 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        setError(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", error.config);
        setError(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 동요 설정 조회
  useEffect(() => {
    fetchSongSettings();
  }, []);

  // 분위기 선택 처리
  const handleMoodSelect = (moodId: number) => {
    setMoods((prevMoods) =>
      prevMoods.map((mood) => ({
        ...mood,
        selected: mood.moodId === moodId,
      }))
    );
  };

  // 목소리 선택 처리
  const handleVoiceSelect = (voiceId: number) => {
    setVoices((prevVoices) =>
      prevVoices.map((voice) => ({
        ...voice,
        selected: voice.voiceId === voiceId,
      }))
    );
  };

  // TTS 목소리 설정 조회
  const fetchTTSVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/tts-settings");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });

      const response = await axios.get<TTSVoiceResponse>(
        "https://www.aieng.co.kr/api/voice/tts-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const { defaultVoices, customVoices } = response.data.data;

        // 기본 목소리와 커스텀 목소리를 합쳐서 상태 업데이트
        const allVoices = [
          ...defaultVoices.map((voice) => ({ ...voice, selected: false })),
          ...customVoices.map((voice) => ({ ...voice, selected: false })),
        ];

        setTTSVoices(allVoices);
      } else {
        throw new Error(
          response.data.error || "목소리 설정을 불러오는데 실패했습니다."
        );
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        setError(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", error.config);
        setError(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 TTS 목소리 설정 조회
  useEffect(() => {
    fetchTTSVoices();
  }, []);

  // TTS 목소리 선택 처리
  const handleTTSVoiceSelect = (voiceId: number) => {
    setTTSVoices((prevVoices) =>
      prevVoices.map((voice) => ({
        ...voice,
        selected: voice.voiceId === voiceId,
      }))
    );
  };

  // 저장된 녹음 불러오기
  useEffect(() => {
    loadSavedRecordings();
  }, []);

  const loadSavedRecordings = async () => {
    try {
      const savedData = await AsyncStorage.getItem("savedRecordings");
      if (savedData) {
        setSavedRecordings(JSON.parse(savedData));
      }
    } catch (err) {
      console.error("저장된 녹음 불러오기 실패:", err);
    }
  };

  // 파일을 Blob으로 변환하는 함수
  const prepareAudioFile = async (recordedUri: string): Promise<Blob> => {
    try {
      console.log("[파일 변환 시작]");
      console.log("Recorded URI:", recordedUri);

      const response = await fetch(recordedUri);
      if (!response.ok) {
        throw new Error(`파일 변환 실패: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("[파일 변환 성공]");
      console.log("Blob size:", blob.size);
      console.log("Blob type:", blob.type);

      return blob;
    } catch (error) {
      console.error("[파일 변환 실패]");
      console.log("Error:", error);
      throw error;
    }
  };

  // Presigned URL 요청
  const getPresignedUrl = async (contentType = "audio/m4a", expires = 300) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token || !selectedChildId) {
        throw new Error("인증 정보가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[Presigned URL 요청]");
      console.log(
        "URL:",
        `https://www.aieng.co.kr/api/voice/presigned-url?contentType=${contentType}&expires=${expires}`
      );
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
      });

      // Presigned URL 요청
      const response = await axios.get(
        `https://www.aieng.co.kr/api/voice/presigned-url?contentType=${contentType}&expires=${expires}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[Presigned URL 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (
        response.data.success &&
        response.data.data?.presignedUrl &&
        response.data.data?.fileUrl
      ) {
        return response.data.data;
      } else {
        console.error("Presigned URL 응답 형식 오류:", response.data);
        throw new Error(
          response.data.error || "Presigned URL 획득에 실패했습니다."
        );
      }
    } catch (error: any) {
      console.error("[Presigned URL 요청 실패]");
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        throw new Error(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        throw new Error(
          "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
        );
      } else {
        console.log("Error:", error.message);
        throw error;
      }
    }
  };

  // S3 업로드
  const uploadToS3 = async (
    presignedUrl: string,
    recordedUri: string,
    contentType = "audio/m4a"
  ) => {
    try {
      console.log("[S3 업로드 시작]");
      console.log("Presigned URL:", presignedUrl);
      console.log("Recorded URI:", recordedUri);
      console.log("Content Type:", contentType);

      // 방법 1: Blob으로 변환 후 업로드
      try {
        const fileBlob = await prepareAudioFile(recordedUri);
        console.log("[S3 업로드 요청 - Blob 방식]");

        const response = await axios.put(presignedUrl, fileBlob, {
          headers: {
            "Content-Type": contentType,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        console.log("[S3 업로드 응답 - Blob 방식]");
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);

        if (response.status === 200) {
          console.log("[S3 업로드 성공 - Blob 방식]");
          return true;
        }
      } catch (blobError) {
        console.error("[Blob 방식 업로드 실패]", blobError);
        console.log("FormData 방식으로 재시도합니다.");
      }

      // 방법 2: FormData로 직접 전송
      console.log("[S3 업로드 요청 - FormData 방식]");
      const formData = new FormData();
      const file = {
        uri: recordedUri,
        type: contentType,
        name: recordedUri.split("/").pop() || "recording.m4a",
      } as any; // React Native의 FormData 타입 문제로 인한 임시 해결책

      formData.append("file", file);

      const response = await axios.put(presignedUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      console.log("[S3 업로드 응답 - FormData 방식]");
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);

      if (response.status === 200) {
        console.log("[S3 업로드 성공 - FormData 방식]");
        return true;
      } else {
        throw new Error(`S3 업로드 실패: ${response.status}`);
      }
    } catch (error: any) {
      console.error("[S3 업로드 실패]");
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
        throw new Error(
          `S3 업로드 실패: ${error.response.status} - ${
            error.response.data || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        throw new Error(
          "S3 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
        );
      } else {
        console.log("Error:", error.message);
        throw error;
      }
    }
  };

  // 음성 URL 등록
  const registerVoiceUrl = async (fileUrl: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token || !selectedChildId) {
        throw new Error("인증 정보가 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[음성 URL 등록 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/voice-url");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
      });
      console.log("Body:", { audioUrl: fileUrl });

      const response = await axios.post(
        "https://www.aieng.co.kr/api/voice/voice-url",
        { audioUrl: fileUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[음성 URL 등록 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        return true;
      } else {
        throw new Error(
          response.data.message || "음성 URL 등록에 실패했습니다."
        );
      }
    } catch (error: any) {
      console.error("[음성 URL 등록 실패]");
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        throw new Error(
          `서버 오류: ${error.response.status} - ${
            error.response.data.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        throw new Error(
          "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
        );
      } else {
        console.log("Error:", error.message);
        throw error;
      }
    }
  };

  // 녹음 저장 함수 수정
  const saveRecordingToLocal = async () => {
    if (!recordedUri) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. Presigned URL 요청
      const { presignedUrl, fileUrl } = await getPresignedUrl();

      // 2. S3에 파일 업로드
      await uploadToS3(presignedUrl, recordedUri);

      // 3. 음성 URL 등록
      await registerVoiceUrl(fileUrl);

      // 4. 로컬 저장소에 저장
      const newRecording = {
        id: Date.now().toString(),
        uri: recordedUri,
        timestamp: Date.now(),
      };

      const updatedRecordings = [...savedRecordings, newRecording];
      await AsyncStorage.setItem(
        "savedRecordings",
        JSON.stringify(updatedRecordings)
      );
      setSavedRecordings(updatedRecordings);
      setError(null);

      // 5. TTS 목소리 목록 새로고침
      await fetchTTSVoices();

      // 6. 녹음 상태 초기화
      resetRecording();
    } catch (err: any) {
      console.error("녹음 저장 실패:", err);
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", JSON.stringify(err.response.data, null, 2));
        setError(
          `서버 오류: ${err.response.status} - ${
            err.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (err.request) {
        console.log("Request:", err.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", err.config);
        setError(err.message || "녹음을 저장할 수 없습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 녹음 삭제
  const deleteRecording = async (id: string) => {
    try {
      const updatedRecordings = savedRecordings.filter((rec) => rec.id !== id);
      await AsyncStorage.setItem(
        "savedRecordings",
        JSON.stringify(updatedRecordings)
      );
      setSavedRecordings(updatedRecordings);
      setError(null);
    } catch (err) {
      console.error("녹음 삭제 실패:", err);
      setError("녹음을 삭제할 수 없습니다.");
    }
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      setError(null);

      // 권한 요청
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setError("마이크 권한이 필요합니다.");
        return;
      }

      // 녹음 준비
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 이전 녹음 정리
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (err) {
          console.log("이전 녹음 정리 중 오류:", err);
        }
      }

      // 녹음 시작
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setRecordingStatus("recording");

      // 타이머 시작
      setRecordingDuration(0);
      const timer = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= maxRecordingDuration - 1) {
            clearInterval(timer);
            stopRecording();
            return maxRecordingDuration;
          }
          return prev + 1;
        });
      }, 1000);

      setRecordingTimer(timer);

      // 최대 녹음 시간 후 자동 중지
      setTimeout(() => {
        if (newRecording) {
          stopRecording();
        }
      }, maxRecordingDuration * 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("녹음을 시작할 수 없습니다. 다시 시도해주세요.");
      setRecordingStatus("notStarted");
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    if (!recording) return;

    try {
      // 타이머 중지
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecordingStatus("finished");
      setRecording(null);

      // 오디오 모드 재설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("녹음을 중지할 수 없습니다. 다시 시도해주세요.");
    }
  };

  // 녹음 리셋
  const resetRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (err) {
        console.log("녹음 정리 중 오류:", err);
      }
    }
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (err) {
        console.log("소리 정리 중 오류:", err);
      }
    }
    setRecordingStatus("notStarted");
    setRecordedUri(null);
    setRecordingDuration(0);
    setSound(null);
    setIsPlaying(false);
    setError(null);
  };

  // 녹음된 소리 재생
  const playRecording = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to play recording", err);
      setError("녹음을 재생할 수 없습니다.");
      setIsPlaying(false);
    }
  };

  // TTS 목소리 추가 처리 업데이트
  const handleAddTTSVoice = () => {
    resetRecording(); // 녹음 상태 초기화하고 준비
    setActiveTab("tts"); // TTS 탭으로 전환
  };

  // TTS 목소리 삭제 처리
  const handleDeleteTTSVoice = async (voiceId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", `https://www.aieng.co.kr/api/voice/${voiceId}`);
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const response = await axios.delete<DeleteVoiceResponse>(
        `https://www.aieng.co.kr/api/voice/${voiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        // 목소리 목록 새로고침
        await fetchTTSVoices();
      } else {
        throw new Error(response.data.error || "목소리 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("목소리 삭제 실패:", err);
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Data:", JSON.stringify(err.response.data, null, 2));
        setError(
          `서버 오류: ${err.response.status} - ${
            err.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (err.request) {
        console.log("Request:", err.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", err.config);
        setError(
          err.message || "목소리를 삭제할 수 없습니다. 다시 시도해주세요."
        );
      }
    }
  };

  // 설정 저장 및 다음 단계로 진행
  const handleSaveSettings = async () => {
    try {
      const selectedTTSVoice = ttsVoices.find((voice) => voice.selected);
      const selectedVoice = voices.find((voice) => voice.selected);
      const selectedMood = moods.find((mood) => mood.selected);

      // 선택된 설정이 하나도 없는 경우
      if (!selectedTTSVoice && !selectedVoice && !selectedMood) {
        console.log("최소 하나 이상의 설정을 선택해주세요.");
        return;
      }

      const token = await AsyncStorage.getItem("accessToken");
      const selectedChildId = await AsyncStorage.getItem("selectedChildId");

      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      if (!selectedChildId) {
        throw new Error("선택된 자녀 ID가 없습니다.");
      }

      // 선택된 설정만 포함하는 요청 본문 생성
      const requestBody: {
        ttsVoiceId?: number;
        songVoiceId?: number;
        moodId?: number;
      } = {};

      if (selectedTTSVoice) {
        requestBody.ttsVoiceId = selectedTTSVoice.voiceId;
      }
      if (selectedVoice) {
        requestBody.songVoiceId = selectedVoice.voiceId;
      }
      if (selectedMood) {
        requestBody.moodId = selectedMood.moodId;
      }

      // API 요청 정보 로깅
      console.log("[API 요청]");
      console.log("URL:", "https://www.aieng.co.kr/api/voice/settings");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "X-Child-Id": selectedChildId,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      });
      console.log("Body:", requestBody);

      const response = await axios.patch<SaveSettingsResponse>(
        "https://www.aieng.co.kr/api/voice/settings",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Child-Id": selectedChildId,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      // API 응답 정보 로깅
      console.log("[API 응답]");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        // Home 화면으로 이동
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      } else {
        throw new Error(response.data.error || "설정 저장에 실패했습니다.");
      }
    } catch (error: any) {
      // 에러 정보 로깅
      console.log("[API 에러]");
      console.log("Message:", error.message);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", JSON.stringify(error.response.data, null, 2));
        setError(
          `서버 오류: ${error.response.status} - ${
            error.response.data.error?.message || "알 수 없는 오류"
          }`
        );
      } else if (error.request) {
        console.log("Request:", error.request);
        setError("서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
      } else {
        console.log("Config:", error.config);
        setError(error.message || "요청 처리 중 오류가 발생했습니다.");
      }
    }
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
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        {/* 탭 선택기 */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "song" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("song")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "song" && styles.activeTabText,
              ]}
            >
              동요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              dynamicStyles.tabButton,
              activeTab === "tts" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("tts")}
          >
            <Text
              style={[
                styles.tabText,
                dynamicStyles.tabText,
                activeTab === "tts" && styles.activeTabText,
              ]}
            >
              TTS 설정
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.contentContainer}>
        {activeTab === "song" ? (
          <>
            {/* 좌측 - 목소리 설정 */}
            <View style={styles.leftContainer}>
              <Text style={styles.sectionTitle}>동요 목소리 설정</Text>
              <Text style={styles.sectionSubtitle}>
                동요를 부를 텍스트를 목소리를 선택해주세요{"\n"}(가수의 성별을
                선택 가능)
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <ScrollView contentContainerStyle={styles.voiceGrid}>
                  {voices.map((voice) => (
                    <VoiceItem
                      key={voice.voiceId}
                      id={voice.voiceId.toString()}
                      name={voice.name}
                      gender={voice.voiceId === 1 ? "male" : "female"}
                      isSelected={voice.selected}
                      onPress={() => handleVoiceSelect(voice.voiceId)}
                      style={styles.voiceItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 우측 - 분위기 설정 */}
            <View style={styles.rightContainer}>
              <Text style={styles.sectionTitle}>동요 분위기 설정</Text>
              <Text style={styles.sectionSubtitle}>
                생성될 동요의 분위기를 선택해주세요
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <View style={styles.moodGrid}>
                  {moods.map((mood) => (
                    <MoodItem
                      key={mood.moodId}
                      id={mood.moodId.toString()}
                      name={mood.name}
                      emoji={mood.emoji}
                      isSelected={mood.selected}
                      onPress={() => handleMoodSelect(mood.moodId)}
                      style={styles.moodItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* 좌측 - TTS 목소리 설정 */}
            <View style={styles.leftContainer}>
              <Text style={styles.sectionTitle}>TTS 목소리 설정</Text>
              <Text style={styles.sectionSubtitle}>
                학습에서 텍스트를 읽어줄 TTS 목소리를 선택해주세요{"\n"}(1초
                이상 눌러 내 목소리 변경)
              </Text>

              {isLoading ? (
                <Text>로딩 중...</Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <ScrollView contentContainerStyle={styles.voiceGrid}>
                  {ttsVoices.map((voice) => (
                    <VoiceItem
                      key={voice.voiceId}
                      id={voice.voiceId.toString()}
                      name={voice.name}
                      gender={
                        voice.voiceId <= 2
                          ? voice.voiceId === 1
                            ? "male"
                            : "female"
                          : "custom"
                      }
                      isSelected={voice.selected}
                      onPress={() => handleTTSVoiceSelect(voice.voiceId)}
                      onDelete={
                        voice.voiceId > 2
                          ? () => handleDeleteTTSVoice(voice.voiceId)
                          : undefined
                      }
                      style={styles.voiceItem}
                      scaleFactor={scaleFactor}
                    />
                  ))}

                  {/* TTS 목소리 추가 버튼 */}
                  <VoiceItem
                    id="add-tts-voice"
                    name={isTTSRecording ? "녹음 중..." : "내 목소리 추가"}
                    gender="custom"
                    isSelected={false}
                    isAddButton={true}
                    onPress={handleAddTTSVoice}
                    disabled={isTTSRecording}
                    style={styles.voiceItem}
                    scaleFactor={scaleFactor}
                  />

                  {/* 저장된 녹음 목록 */}
                  {savedRecordings.length > 0 && (
                    <View style={styles.savedRecordingsContainer}>
                      <View
                        style={[
                          styles.sectionHeader,
                          { marginBottom: theme.spacing.xs },
                        ]}
                      >
                        <Text style={styles.sectionTitle}>저장된 녹음</Text>
                        <Text style={styles.sectionSubtitle}>
                          저장된 녹음 목록입니다.{"\n"}
                          재생하여 확인하거나 삭제할 수 있습니다.
                        </Text>
                      </View>
                      <ScrollView style={styles.savedRecordingsList}>
                        {savedRecordings.map((rec) => (
                          <View key={rec.id} style={styles.savedRecordingItem}>
                            <Text style={styles.savedRecordingTime}>
                              {new Date(rec.timestamp).toLocaleString()}
                            </Text>
                            <View style={styles.savedRecordingControls}>
                              <TouchableOpacity
                                style={styles.savedRecordingButton}
                                onPress={() => playRecording(rec.uri)}
                              >
                                <FontAwesome5
                                  name="play"
                                  size={20}
                                  color={theme.colors.primary}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.savedRecordingButton}
                                onPress={() => deleteRecording(rec.id)}
                              >
                                <FontAwesome5
                                  name="trash"
                                  size={20}
                                  color="#FF3B30"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>

            {/* 우측 - 녹음 UI */}
            <View style={styles.rightContainer}>
              {recordingStatus === "notStarted" ? (
                // 녹음 전 상태
                <View style={styles.recordingContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>목소리 녹음하기</Text>
                    <Text style={styles.sectionSubtitle}>
                      아래 버튼을 눌러 10~15초 동안 문장을{"\n"}또박또박
                      읽어주세요.
                    </Text>
                  </View>

                  <View style={styles.recordingContent}>
                    <View style={styles.timerContainer}>
                      <Text style={styles.timerText}>
                        00:{maxRecordingDuration.toString().padStart(2, "0")}
                      </Text>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarEmpty]} />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.recordButton]}
                      onPress={startRecording}
                    >
                      <FontAwesome5 name="microphone" size={24} color="white" />
                      <Text style={styles.recordButtonText}>녹음 시작</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : recordingStatus === "recording" ? (
                // 녹음 중 상태
                <View style={styles.recordingContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>녹음 중...</Text>
                    <Text style={styles.sectionSubtitle}>
                      녹음 중입니다. 또박또박 문장을 읽어주세요.{"\n"}
                      녹음은 최대 {maxRecordingDuration}초까지 가능합니다.
                    </Text>
                  </View>

                  <View style={styles.recordingContent}>
                    <View style={styles.timerContainer}>
                      <Text style={styles.timerText}>
                        00:
                        {(maxRecordingDuration - recordingDuration)
                          .toString()
                          .padStart(2, "0")}
                      </Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${
                                (recordingDuration / maxRecordingDuration) * 100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.recordButton, styles.stopButton]}
                      onPress={stopRecording}
                    >
                      <FontAwesome5 name="stop" size={24} color="white" />
                      <Text style={styles.recordButtonText}>녹음 중지</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // 녹음 완료 상태
                <View style={styles.recordingContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>녹음 완료!</Text>
                    <Text style={styles.sectionSubtitle}>
                      녹음이 완료되었습니다!{"\n"}
                      녹음한 목소리를 확인하고 저장할 수 있습니다.
                    </Text>
                  </View>

                  <View style={styles.recordingContent}>
                    <View style={styles.playbackControls}>
                      <TouchableOpacity
                        style={[styles.controlButton]}
                        onPress={() =>
                          recordedUri && playRecording(recordedUri)
                        }
                        disabled={isPlaying}
                      >
                        <FontAwesome5
                          name={isPlaying ? "pause" : "play"}
                          size={24}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.controlButtonText}>
                          {isPlaying ? "일시정지" : "재생"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.controlButton]}
                        onPress={resetRecording}
                      >
                        <FontAwesome5
                          name="redo"
                          size={24}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.controlButtonText}>다시 녹음</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.controlButton, styles.saveButton]}
                        onPress={saveRecordingToLocal}
                        disabled={isLoading}
                      >
                        <FontAwesome5 name="save" size={24} color="white" />
                        <Text
                          style={[
                            styles.controlButtonText,
                            styles.saveButtonText,
                          ]}
                        >
                          {isLoading ? "저장 중..." : "저장"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.recordButton]}
          onPress={handleSaveSettings}
        >
          <FontAwesome5 name="save" size={24} color="white" />
          <Text style={styles.recordButtonText}>저장하기</Text>
        </TouchableOpacity>
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
    width: 100,
  },
  headerRight: {
    width: 100,
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
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -65 }], // 탭 선택기의 절반 너비만큼 왼쪽으로 이동
  },
  tab: {
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
  ttsContainer: {
    flex: 1,
    padding: theme.spacing.l,
  },
  sectionHeader: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  sectionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.subText,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.s,
    paddingTop: theme.spacing.xl,
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
  errorText: {
    color: "#FF3B30", // 직접 에러 색상 지정
    ...theme.typography.body,
    textAlign: "center",
    marginTop: theme.spacing.l,
  },
  // 녹음 관련 스타일
  recordingContainer: {
    flex: 1,
    width: "100%",
  },
  recordingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: theme.spacing.xs,
    gap: theme.spacing.s,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    minWidth: 200,
    ...theme.shadows.default,
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  recordButtonText: {
    ...theme.typography.button,
    color: "white",
    marginLeft: theme.spacing.s,
  },
  timerContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  timerText: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
  },
  progressBarContainer: {
    width: "100%",
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: theme.borderRadius.pill,
    overflow: "hidden",
  },
  progressBarEmpty: {
    height: "100%",
    width: "0%",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.pill,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: theme.spacing.l,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    width: 150,
    marginHorizontal: theme.spacing.s,
  },
  controlButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
    fontSize: 22,
    marginTop: theme.spacing.xs,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  saveButtonText: {
    color: "white",
  },
  disabledButton: {
    borderColor: "gray",
    opacity: 0.7,
  },
  disabledButtonText: {
    color: "gray",
  },
  savedRecordingsContainer: {
    width: "100%",
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  savedRecordingsList: {
    maxHeight: 200,
    marginTop: theme.spacing.m,
  },
  savedRecordingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
    backgroundColor: "white",
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.s,
    ...theme.shadows.default,
  },
  savedRecordingTime: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  savedRecordingControls: {
    flexDirection: "row",
    gap: theme.spacing.m,
  },
  savedRecordingButton: {
    padding: theme.spacing.s,
  },
});

export default SongSettingScreen;
