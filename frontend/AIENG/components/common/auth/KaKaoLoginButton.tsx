import React from 'react';
import { TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../../Theme';

interface KakaoLoginButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={require('../../../assets/images/kakao_login_large_wide.png')} 
        style={styles.buttonImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonImage: {
    height: 55, // Middle 크기
    width: 370, // Small 너비
  },
});

export default KakaoLoginButton;
