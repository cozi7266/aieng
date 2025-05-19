// components/songs/FairytaleCarousel.tsx
import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface FairytalePage {
  id: string;
  imageUrl: any;
  text: string;
}

interface FairytaleCarouselProps {
  pages: FairytalePage[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  scaleFactor: number;
}

const FairytaleCarousel: React.FC<FairytaleCarouselProps> = ({
  pages,
  currentIndex,
  onPrevious,
  onNext,
  scaleFactor = 1,
}) => {
  const currentPage = pages[currentIndex];
  const { height } = Dimensions.get("window");

  // Dynamic styles based on screen size
  const dynamicStyles = {
    navigationButton: {
      width: 60 * scaleFactor,
      height: 60 * scaleFactor,
      borderRadius: 30 * scaleFactor,
    },
    navigationButtonIcon: {
      fontSize: 24 * scaleFactor,
    },
    imageContainer: {
      height: height * 0.55,
      marginBottom: theme.spacing.l * scaleFactor,
    },
    fairytaleImage: {
      width: "100%",
      height: "100%",
      borderRadius: theme.borderRadius.large * scaleFactor,
    },
    textContainer: {
      paddingVertical: theme.spacing.m * scaleFactor,
      paddingHorizontal: theme.spacing.l * scaleFactor,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: theme.borderRadius.large * scaleFactor,
      marginBottom: theme.spacing.l * scaleFactor,
      minHeight: height * 0.15,
    },
    fairytaleText: {
      fontSize: theme.typography.body.fontSize * Math.max(1, scaleFactor),
      lineHeight:
        theme.typography.body.fontSize * Math.max(1, scaleFactor) * 1.5,
    },
  };

  return (
    <View style={styles.container}>
      {/* Previous Button */}
      <TouchableOpacity
        style={[
          styles.navButton,
          styles.prevButton,
          dynamicStyles.navigationButton,
        ]}
        onPress={onPrevious}
        disabled={currentIndex === 0}
      >
        <FontAwesome5
          name="chevron-left"
          size={dynamicStyles.navigationButtonIcon.fontSize}
          color={
            currentIndex === 0 ? theme.colors.accent : theme.colors.primary
          }
        />
      </TouchableOpacity>

      {/* Fairy Tale Content */}
      <View style={styles.fairytaleContainer}>
        {/* Image */}
        <View style={[styles.imageContainer, dynamicStyles.imageContainer]}>
          <Image
            source={currentPage.imageUrl}
            style={[
              styles.fairytaleImage,
              { borderRadius: theme.borderRadius.large * scaleFactor },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Text 부분 완전히 제거 */}
        {/* <View style={[styles.textContainer, dynamicStyles.textContainer]}>
          <ScrollView>
            <Text style={[styles.fairytaleText, dynamicStyles.fairytaleText]}>
              {currentPage.text}
            </Text>
          </ScrollView>
        </View> */}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.navButton,
          styles.nextButton,
          dynamicStyles.navigationButton,
        ]}
        onPress={onNext}
        disabled={currentIndex === pages.length - 1}
      >
        <FontAwesome5
          name="chevron-right"
          size={dynamicStyles.navigationButtonIcon.fontSize}
          color={
            currentIndex === pages.length - 1
              ? theme.colors.accent
              : theme.colors.primary
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fairytaleContainer: {
    flex: 1,
    padding: theme.spacing.m,
  },
  imageContainer: {
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
    backgroundColor: "white",
    ...theme.shadows.default,
  },
  navButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    ...theme.shadows.default,
  },
  prevButton: {
    marginRight: theme.spacing.m,
  },
  nextButton: {
    marginLeft: theme.spacing.m,
  },
  textContainer: {
    backgroundColor: "white",
    ...theme.shadows.default,
  },
  fairytaleText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
  },
  fairytaleImage: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.large,
  },
});

export default FairytaleCarousel;
