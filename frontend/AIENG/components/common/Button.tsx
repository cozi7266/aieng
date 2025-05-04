// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { theme } from '../../Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  height?: number; // 높이 속성 추가
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  height, // 높이 값 받기
  disabled = false,
  variant = 'primary',
}) => {
  const buttonColorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    tertiary: theme.colors.tertiary,
  };

  const backgroundColor = buttonColorMap[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? '#CCCCCC' : backgroundColor },
        height ? { height, paddingVertical: 0 } : {}, // 높이가 지정되면 paddingVertical을 0으로 설정
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text 
        style={[styles.buttonText, textStyle]}
        textBreakStrategy="simple"
        allowFontScaling={false}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center', // 내용 중앙 정렬
    minWidth: 200,
    ...theme.shadows.default,
  },
  buttonText: {
    color: theme.colors.buttonText,
    ...theme.typography.button,
    textAlign: 'center',
    includeFontPadding: false,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : undefined,
    lineHeight: Platform.OS === 'android' ? 36 : undefined,
    flexShrink: 1,
    alignSelf: 'center',
  },
});

export default Button;
