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
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  isActive,
  isPlaying,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.activeCard]}
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
            <View style={styles.playIconContainer}>
              <FontAwesome5
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="white"
                style={isPlaying ? styles.playIcon : styles.pauseIcon}
              />
            </View>
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
    width: 220,
    height: 250,
    margin: theme.spacing.m,
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
  playIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.default,
  },
  playIcon: {
    marginLeft: 4,
  },
  pauseIcon: {
    marginLeft: 0,
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
});

export default SongCard;
