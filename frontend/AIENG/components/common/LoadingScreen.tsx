// components/common/LoadingScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "불러오는 중...",
}) => {
  return (
    <View style={styles.container}>
      <FontAwesome5
        name="spinner"
        size={48}
        color={theme.colors.primary}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    fontSize: 18,
  },
});

export default LoadingScreen;
