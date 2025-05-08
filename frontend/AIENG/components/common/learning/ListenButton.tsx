// components/common/learning/ListenButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../../Theme";

interface ListenButtonProps {
  onPress: () => void;
  isPlaying: boolean;
  style?: any;
  iconSize?: number;
  textSize?: number;
}

const ListenButton: React.FC<ListenButtonProps> = ({
  onPress,
  isPlaying,
  style,
  iconSize = 40,
  textSize = 24,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, isPlaying && styles.playingButton]}
      onPress={onPress}
      // 재생 중에도 클릭 가능하도록 disabled 속성 제거
    >
      <FontAwesome5
        name={isPlaying ? "stop" : "volume-up"} // 재생 중일 때 아이콘 변경
        size={iconSize}
        color={theme.colors.primary}
      />
      <Text style={[styles.text, { fontSize: textSize }]}>
        {isPlaying ? "멈추기" : "단어 듣기"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.l,
    width: 250,
    justifyContent: "center",
    ...theme.shadows.default,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  playingButton: {
    backgroundColor: theme.colors.accent,
    opacity: 0.9,
  },
  text: {
    fontFamily: "Pretendard-Bold",
    color: theme.colors.primary,
    marginLeft: theme.spacing.m,
  },
});

export default ListenButton;
