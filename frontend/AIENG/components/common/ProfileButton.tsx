// ProfileButton.tsx 수정
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useProfile } from '../../contexts/ProfileContext';
import { theme } from '../../Theme';

interface ProfileButtonProps {
  style?: any;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ style }) => {
  const { setProfileModalOpen } = useProfile();

  const handleProfilePress = () => {
    setProfileModalOpen(true);
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleProfilePress}
    >
      <FontAwesome5 
        name="user-circle" 
        size={32} 
        color={theme.colors.primary} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.m,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.default,
  },
});

export default ProfileButton;
