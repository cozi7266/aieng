import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../Theme";

interface LearningThemeCardProps {
  title: string;
  imageSource: ImageSourcePropType;
  completed: number;
  total: number;
  onPress: () => void;
}

const LearningThemeCard: React.FC<LearningThemeCardProps> = ({
  title,
  imageSource,
  completed,
  total,
  onPress,
}) => {
  // 진행률 계산
  const progressPercentage = (completed / total) * 100;

  // 화면 크기에 기반한 카드 크기 계산
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = screenWidth * 0.3; // 화면 폭의 약 30%에서 30%로 조정
  const cardHeight = cardWidth * 1.05; // 1.05 비율
  const imageHeight = cardWidth * 0.7; // 카드 폭의 70%

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
    >
      <View style={styles.card}>
        <View style={styles.innerContainer}>
          <View style={[styles.imageContainer, { height: imageHeight }]}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={styles.gradient}
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {completed}/{total}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: theme.spacing.s,
    maxWidth: "33%", // FlatList에서 3개 열을 사용할 때 필요
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
    position: "relative",
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
    height: 12,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
  },
  progressText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: "bold",
  },
});

export default LearningThemeCard;
