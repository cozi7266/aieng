import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { theme } from "../../Theme";

interface SongLyricsProps {
  lyrics: string;
  scaleFactor: number;
  variant?: "song" | "fairytale";
}

const SongLyrics: React.FC<SongLyricsProps> = ({
  lyrics,
  scaleFactor = 1,
  variant = "song",
}) => {
  return (
    <View
      style={[
        styles.container,
        variant === "fairytale" && styles.fairytaleContainer,
      ]}
    >
      {/* <Text style={styles.heading}>가사</Text> */}
      <ScrollView
        style={[
          styles.lyricsScrollView,
          variant === "fairytale" && styles.fairytaleLyricsScrollView,
        ]}
        contentContainerStyle={{
          paddingBottom: theme.spacing.s,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={true}
      >
        <Text
          style={[
            styles.lyricsText,
            variant === "fairytale" && styles.fairytaleLyricsText,
          ]}
        >
          {lyrics}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: theme.spacing.l,
  },
  fairytaleContainer: {
    width: "84%",
    alignSelf: "center",
    height: "100%",
  },
  lyricsScrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
  },
  fairytaleLyricsScrollView: {
    width: "100%",
    height: "100%",
  },
  lyricsText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 36,
    textAlign: "center",
  },
  fairytaleLyricsText: {
    fontSize: theme.typography.body.fontSize * 1.1,
    lineHeight: 42,
    textAlign: "center",
  },
});

export default SongLyrics;
