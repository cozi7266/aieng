// 아이잉 앱의 일관된 디자인 테마
export const theme = {
  colors: {
    primary: '#514BF2', // 메인 퍼플-블루
    secondary: '#6863F2', // 중간 톤 퍼플-블루
    tertiary: '#827EF2', // 밝은 퍼플-블루
    accent: '#9C99F2', // 가장 밝은 퍼플-블루
    background: '#F2F2F2', // 밝은 배경색
    card: '#FFFFFF',
    text: '#333333',
    subText: '#666666',
    inputBorder: '#9C99F2', // 입력 필드 테두리
    buttonText: '#FFFFFF',
    shadow: 'rgba(81, 75, 242, 0.2)', // 퍼플-블루 그림자
  },
  typography: {
    largeTitle: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 24,
    },
    button: {
      fontSize: 28,
      fontWeight: 'bold',
    },
  },
  spacing: {
    xs: 8,
    s: 16,
    m: 24,
    l: 32,
    xl: 48,
    xxl: 64,
  },
  borderRadius: {
    small: 12,
    medium: 20,
    large: 30,
    pill: 100,
  },
  shadows: {
    default: {
      shadowColor: '#514BF2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
