// components/song/VoiceItem.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";
import NavigationWarningAlert from "../../components/navigation/NavigationWarningAlert";

interface VoiceItemProps {
  id: string;
  name: string;
  gender: "male" | "female" | "custom";
  isSelected: boolean;
  isAddButton?: boolean;
  onPress: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  style?: any;
  scaleFactor?: number;
}

const VoiceItem: React.FC<VoiceItemProps> = ({
  id,
  name,
  gender,
  isSelected,
  isAddButton = false,
  onPress,
  onDelete,
  disabled = false,
  style,
  scaleFactor = 1,
}) => {
  // 성별에 따른 색상 및 레이블 설정
  const getVoiceStyle = () => {
    switch (gender) {
      case "male":
        return {
          label: "남자",
          color: theme.colors.secondary,
          bgColor: isSelected ? "#E8E7FF" : "white",
        };
      case "female":
        return {
          label: "여자",
          color: theme.colors.accent,
          bgColor: isSelected ? "#F0F0FF" : "white",
        };
      case "custom":
        return {
          label: "내 목소리",
          color: theme.colors.tertiary,
          bgColor: isSelected ? "#ECF0FF" : "white",
        };
      default:
        return {
          label: "",
          color: theme.colors.primary,
          bgColor: isSelected ? "#F5F5FF" : "white",
        };
    }
  };

  const voiceStyle = getVoiceStyle();

  // 애니메이션 값 정의
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // 터치 애니메이션
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (gender === "custom" && !isAddButton && onDelete) {
      NavigationWarningAlert.show({
        title: "내 목소리 삭제",
        message: "내 목소리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        confirmText: "삭제하기",
        cancelText: "취소",
        onConfirm: () => {
          onDelete();
        },
      });
    }
  };

  return (
    <Animated.View
      style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[
          styles.voiceItem,
          { backgroundColor: voiceStyle.bgColor },
          isSelected && [
            styles.selectedItem,
            { borderColor: voiceStyle.color },
          ],
          isAddButton && styles.addItem,
        ]}
        onPress={onPress}
        onLongPress={handleDelete}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* 목소리 종류 표시 헤더 */}
        {!isAddButton && (
          <View
            style={[
              styles.voiceTypeHeader,
              { backgroundColor: voiceStyle.color },
            ]}
          >
            <Text style={styles.voiceTypeText}>{voiceStyle.label}</Text>
          </View>
        )}

        {/* 추가 버튼일 경우 플러스 기호 표시 */}
        {isAddButton && (
          <View
            style={[
              styles.voiceTypeHeader,
              { backgroundColor: theme.colors.tertiary },
            ]}
          >
            <Text style={styles.voiceTypeText}>내 목소리</Text>
          </View>
        )}

        {/* 목소리 이름 또는 추가 아이콘 */}
        {isAddButton ? (
          <View style={styles.addIconContainer}>
            <View style={styles.addIconCircle}>
              <FontAwesome5
                name="plus"
                size={24}
                color={theme.colors.tertiary}
                style={styles.addIcon}
              />
            </View>
          </View>
        ) : (
          <Text
            style={[
              styles.voiceName,
              { fontSize: theme.typography.body.fontSize * scaleFactor * 0.8 },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        )}

        {/* 재생 버튼 */}
        {!isAddButton && (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: voiceStyle.color }]}
          >
            <FontAwesome5
              name="play"
              size={12}
              color="white"
              style={styles.playButtonIcon}
            />
          </TouchableOpacity>
        )}

        {/* 선택 표시 */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: "white" }]}>
            <FontAwesome5
              name="check"
              size={14}
              color={voiceStyle.color}
              style={styles.checkmarkIcon}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.m,
    width: 150,
    height: 180,
  },
  voiceItem: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: theme.borderRadius.large,
    padding: 0,
    overflow: "hidden",
    justifyContent: "flex-start",
    ...theme.shadows.default,
    position: "relative",
  },
  voiceTypeHeader: {
    width: "100%",
    paddingVertical: theme.spacing.s,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  voiceTypeText: {
    ...theme.typography.bodyMedium,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  voiceName: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
    paddingHorizontal: theme.spacing.s,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.l,
  },
  selectedItem: {
    borderWidth: 4,
  },
  selectedBadge: {
    position: "absolute",
    top: theme.spacing.s,
    right: theme.spacing.s,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  checkmarkIcon: {
    marginLeft: 1,
    marginTop: 1,
  },
  addItem: {
    borderWidth: 2,
    borderColor: theme.colors.tertiary,
    borderStyle: "dashed",
    backgroundColor: "white",
  },
  addIconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    // marginTop: theme.spacing.s,
  },
  playButton: {
    position: "absolute",
    bottom: theme.spacing.s,
    right: theme.spacing.s,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonIcon: {
    marginLeft: 2,
  },
});

export default VoiceItem;
