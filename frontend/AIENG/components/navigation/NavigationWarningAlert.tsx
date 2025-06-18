// components/navigation/NavigationWarningAlert.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { theme } from "../../Theme";

interface NavigationWarningAlertProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const CustomAlert = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}: NavigationWarningAlertProps & { visible: boolean; onClose: () => void }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onCancel || onClose} />

        <Animated.View
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <FontAwesome5
              name="exclamation-triangle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.titleText}>{title}</Text>
          </View>

          <Text style={styles.messageText}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                if (onCancel) onCancel();
                onClose(); // 항상 onClose 함수 호출하여 모달 닫기
              }}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// 싱글톤 인스턴스 관리
let alertInstance: {
  show: (props: NavigationWarningAlertProps) => void;
  hide: () => void;
} | null = null;

// 알림 컴포넌트 래퍼
const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<NavigationWarningAlertProps>({
    title: "학습 종료",
    message:
      "현재까지의 학습 내역은 저장되지 않습니다. 학습을 종료하시겠습니까?",
    confirmText: "종료",
    cancelText: "취소",
    onConfirm: () => {},
  });

  // 알림 인스턴스 초기화
  useEffect(() => {
    alertInstance = {
      show: (props: NavigationWarningAlertProps) => {
        setConfig(props);
        setVisible(true);
      },
      hide: () => {
        setVisible(false);
      },
    };

    return () => {
      alertInstance = null;
    };
  }, []);

  return (
    <>
      {children}
      <CustomAlert
        visible={visible}
        {...config}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

// 외부에서 사용할 API
const NavigationWarningAlert = {
  show: ({
    title = "학습 종료",
    message = "현재까지의 학습 내역은 저장되지 않습니다. 학습을 종료하시겠습니까?",
    confirmText = "종료",
    cancelText = "취소",
    onConfirm,
    onCancel = () => {},
  }: NavigationWarningAlertProps) => {
    if (alertInstance) {
      alertInstance.show({
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      });
    } else {
      console.warn(
        "NavigationWarningAlert는 App 컴포넌트에 AlertProvider가 필요합니다."
      );
    }
  },
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "40%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: theme.spacing.l,
    ...theme.shadows.strong,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: theme.spacing.m,
  },
  messageText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginLeft: theme.spacing.m,
    ...theme.shadows.default,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.secondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export { AlertProvider, NavigationWarningAlert };
export default NavigationWarningAlert;
