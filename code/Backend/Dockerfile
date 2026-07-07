# STAGE 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies first (makes building faster)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy your actual code and build the .jar file
COPY src ./src
RUN mvn clean package -DskipTests

# STAGE 2: Run the application using a lightweight Java environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built .jar file from Stage 1
COPY --from=build /app/target/*.jar app.jar

# Expose the port Spring Boot uses
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]