const fs = require("fs");
const path = require("path");

function checkVersions() {
  try {
    // 파일 읽기
    const buildGradle = fs.readFileSync(
      path.join(__dirname, "../android/build.gradle"),
      "utf8"
    );
    const gradleProps = fs.readFileSync(
      path.join(__dirname, "../android/gradle.properties"),
      "utf8"
    );
    const packageJson = require("../package.json");

    // 버전 정보 추출
    const kotlinVersion = "1.8.10";
    const gradleVersion = "7.4.2";
    const kakaoSdkVersion = "2.11.2";

    // 버전 일치 여부 확인
    const checks = [
      {
        name: "Kotlin",
        version: kotlinVersion,
        files: {
          "build.gradle": buildGradle.includes(kotlinVersion),
          "gradle.properties": gradleProps.includes(kotlinVersion),
        },
      },
      {
        name: "Gradle",
        version: gradleVersion,
        files: {
          "build.gradle": buildGradle.includes(gradleVersion),
        },
      },
      {
        name: "Kakao SDK",
        version: kakaoSdkVersion,
        files: {
          "build.gradle": buildGradle.includes(kakaoSdkVersion),
        },
      },
    ];

    // 결과 출력
    let hasError = false;
    checks.forEach((check) => {
      console.log(`\n${check.name} 버전 체크 (${check.version}):`);
      Object.entries(check.files).forEach(([file, matches]) => {
        const status = matches ? "✅ 일치" : "❌ 불일치";
        console.log(`  - ${file}: ${status}`);
        if (!matches) hasError = true;
      });
    });

    if (hasError) {
      console.error("\n❌ 버전 불일치가 발견되었습니다!");
      process.exit(1);
    } else {
      console.log("\n✅ 모든 버전이 일치합니다!");
    }
  } catch (error) {
    console.error("❌ 버전 체크 중 오류가 발생했습니다:", error);
    process.exit(1);
  }
}

checkVersions();
