// screens/SongScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../Theme';

const SongScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>동요 듣기 화면 (구현 예정)</Text>
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

export default SongScreen;
