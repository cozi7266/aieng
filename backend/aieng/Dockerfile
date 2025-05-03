# Build stage
FROM gradle:7.6.1-jdk17 AS Build 
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# Run stage
FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"] 