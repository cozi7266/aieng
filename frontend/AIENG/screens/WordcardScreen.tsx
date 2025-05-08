// screens/WordcardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../Theme';

const WordcardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>단어 도감 화면 (구현 예정)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
});

export default WordcardScreen;
