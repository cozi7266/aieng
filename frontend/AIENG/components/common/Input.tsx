import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Text } from 'react-native';
import { theme } from '../../Theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style,
  label,
  error,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.m,
  },
  label: {
    ...theme.typography.body,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  inputContainer: {
    width: '100%',
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.card,
    ...theme.shadows.default,
  },
  inputError: {
    borderColor: '#FF6B6B', // 에러 상태 색상
  },
  input: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    height: 70,
    ...theme.typography.body,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: theme.spacing.xs,
    fontSize: 18,
  }
});

export default Input;
