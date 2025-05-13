# Sample Snack app

Open the `App.js` file to start writing some code. You can preview the changes directly on your phone or tablet by scanning the **QR code** or use the iOS or Android emulators. When you're done, click **Save** and share the link!

When you're ready to see everything that Expo provides (or if you want to use your own editor) you can **Download** your project and use it with [expo cli](https://docs.expo.dev/get-started/installation/#expo-cli)).

All projects created in Snack are publicly available, so you can easily share the link to this project via link, or embed it on a web page with the `<>` button.

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.dev/c/expo-dev-tools/61) or [Discord](https://chat.expo.dev/).

Snack is Open Source. You can find the code on the [GitHub repo](https://github.com/expo/snack).

# AIENG

## 개발 환경 설정

### 필수 버전 정보

- Kotlin: 1.8.10
- Gradle: 7.4.2
- Android Gradle Plugin: 7.4.2
- Kakao SDK: 2.11.2

### 버전 관리 가이드라인

#### 1. 버전 변경 시 주의사항

1. `app.config.ts`의 `extra.versions` 정보 업데이트
2. `android/build.gradle`의 `kotlinVersion` 업데이트
3. `android/gradle.properties`의 `android.kotlinVersion` 업데이트

#### 2. 버전 체크

```bash
npm run check-versions
```

#### 3. 빌드 전 필수 체크리스트

- [ ] 모든 버전이 일치하는지 확인 (`npm run check-versions`)
- [ ] 환경 변수가 올바르게 설정되어 있는지 확인
- [ ] Kakao SDK 관련 설정이 올바른지 확인

### 개발 환경 설정

1. 의존성 설치

```bash
npm install
```

2. 네이티브 프로젝트 생성

```bash
npx expo prebuild
```

3. 개발 서버 실행

```bash
npm start
```

4. Android 빌드

```bash
npm run android
```

### 문제 해결

버전 불일치 문제가 발생할 경우:

1. `node_modules`와 `android` 디렉토리 삭제
2. `npm install` 실행
3. `npx expo prebuild` 실행
4. `npm run android` 실행
