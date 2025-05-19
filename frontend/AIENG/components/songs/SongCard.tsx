import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
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

interface SongCardProps {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onStoryPress?: () => void;
  style?: any;
  scaleFactor: number;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  isActive,
  isPlaying,
  onPress,
  onStoryPress,
  style,
  scaleFactor = 1,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.activeCard,
        style,
        {
          borderRadius: theme.borderRadius.medium * scaleFactor,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={song.imageUrl}
          style={styles.image}
          defaultSource={require("../../assets/icon.png")}
        />
        {isActive && (
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.storyButton} onPress={onStoryPress}>
              <FontAwesome5 name="book" size={36} color="white" />
              <Text style={styles.storyButtonText}>동화 보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
          {song.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: theme.spacing.s,
    marginBottom: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: "white",
    ...theme.shadows.default,
    overflow: "hidden",
  },
  activeCard: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: theme.borderRadius.medium - 2,
    borderTopRightRadius: theme.borderRadius.medium - 2,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    padding: theme.spacing.s,
    justifyContent: "center",
    flex: 1,
  },
  title: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  artist: {
    ...theme.typography.caption,
    color: theme.colors.subText,
  },
  storyButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.default,
  },
  storyButtonText: {
    ...theme.typography.caption,
    color: "white",
    marginTop: theme.spacing.xs,
  },
});

export default SongCard;
