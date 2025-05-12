import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { theme } from "../../Theme";

interface SongLyricsProps {
  lyrics: string;
}

const SongLyrics: React.FC<SongLyricsProps> = ({ lyrics }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>가사</Text>
      <ScrollView style={styles.lyricsScrollView}>
        <Text style={styles.lyricsText}>{lyrics}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: theme.spacing.l,
  },
  heading: {
    ...theme.typography.subTitle,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  lyricsScrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
  },
  lyricsText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 36,
  },
});

export default SongLyrics;
