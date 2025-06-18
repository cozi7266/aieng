// components/common/learning/LearningThemeCard.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../Theme";

interface LearningThemeCardProps {
  title: string;
  imageSource: ImageSourcePropType;
  completed: number;
  total: number;
  isCompleted?: boolean;
  onPress: () => void;
}

const LearningThemeCard: React.FC<LearningThemeCardProps> = ({
  title,
  imageSource,
  completed,
  total,
  isCompleted = false,
  onPress,
}) => {
  // 하나의 통합된 애니메이션 드라이버
  const animDriver = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCompleted) {
      // 더 부드럽고 통합된 단일 애니메이션 생성
      Animated.loop(
        Animated.sequence([
          Animated.timing(animDriver, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false, // 그림자 같은 일부 속성은 네이티브 드라이버 사용 불가
          }),
          Animated.timing(animDriver, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // 애니메이션 중지 및 초기화
      animDriver.stopAnimation();
      animDriver.setValue(0);
    }

    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      animDriver.stopAnimation();
    };
  }, [isCompleted]);

  // 진행률 계산
  const progressPercentage = (completed / total) * 100;

  // 모든 애니메이션 속성을 동일한 드라이버에서 파생하여 동기화
  const glowOpacity = animDriver.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  const cardScale = animDriver.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const glowRadius = animDriver.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 15],
  });

  const borderWidth = animDriver.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 3.5],
  });

  const glowColor = animDriver.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.primary, "#3d37e0"], // 색상 변화 추가
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      {/* 카드와 동기화된 글로우 효과 */}
      {isCompleted && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: cardScale }],
              shadowRadius: glowRadius,
              shadowColor: glowColor,
              backgroundColor: glowColor,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.card,
          isCompleted && {
            borderColor: glowColor, // 애니메이션되는 색상
            borderWidth: borderWidth, // 애니메이션되는 테두리 두께
            transform: [{ scale: cardScale }], // 글로우와 같은 스케일 사용
          },
        ]}
      >
        <View style={styles.innerContainer}>
          <View style={styles.imageContainer}>
            {/* 이미지와 테두리 사이 흰색 공간 해결 */}
            <View style={styles.imageWrapper}>
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={styles.gradient}
            />

            {/* 애니메이션되는 완료 뱃지 */}
            {isCompleted && (
              <Animated.View
                style={[
                  styles.completedBadge,
                  {
                    transform: [
                      {
                        scale: animDriver.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                    backgroundColor: glowColor,
                  },
                ]}
              >
                <Text style={styles.completedText}>완료!</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Animated.Text
              style={[styles.title, isCompleted && { color: glowColor }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Animated.Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    { width: `${progressPercentage}%` },
                    isCompleted && [
                      styles.completedProgressBar,
                      { backgroundColor: glowColor },
                    ],
                  ]}
                />
              </View>
              <Animated.Text
                style={[
                  styles.progressText,
                  isCompleted && { color: glowColor },
                ]}
              >
                {completed}/{total}
              </Animated.Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: theme.spacing.s,
    position: "relative",
  },
  glowEffect: {
    position: "absolute",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large + 4,
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    zIndex: -1,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
    ...theme.shadows.default,
  },
  innerContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: theme.borderRadius.large,
  },
  imageContainer: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.5,
    position: "relative",
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    overflow: "hidden", // 모서리 흰색 간격 방지
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  contentContainer: {
    padding: theme.spacing.m,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.s,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.pill,
  },
  completedProgressBar: {
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs / 2,
    zIndex: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completedText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LearningThemeCard;
