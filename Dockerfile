# Backend (Spring Boot) production image.
# Build: docker build -t retarget-erp-backend .
# Run:   docker run -p 8080:8080 --env-file .env retarget-erp-backend

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY mvnw ./
COPY .mvn/ .mvn/
COPY pom.xml ./
RUN ./mvnw -B -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/data/uploads && chown -R app:app /app
USER app

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
