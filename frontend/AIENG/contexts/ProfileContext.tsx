// contexts/ProfileContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { InteractionManager } from 'react-native';

interface ProfileContextType {
  isProfileModalOpen: boolean;
  setProfileModalOpen: (isOpen: boolean) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  isProfileModalOpen: false,
  setProfileModalOpen: () => {},
});

export const ProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // 모달 상태 변경 함수 최적화
  const setProfileModalOpen = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      // 모달 닫을 때 인터랙션이 완료된 후 상태 업데이트
      InteractionManager.runAfterInteractions(() => {
        setIsProfileModalOpen(isOpen);
      });
    } else {
      // 모달 열 때는 즉시 상태 업데이트
      setIsProfileModalOpen(isOpen);
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ isProfileModalOpen, setProfileModalOpen }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
