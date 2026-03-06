import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaffLogin() {
  const router = useRouter();

  // State to hold user input and screen status
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    console.log("LOGIN BUTTON CLICKED!");

    // 1. Basic Validation
    if (!staffId || !password) {
      setErrorMessage("Please enter both your Staff ID and Password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const backendUrl = "http://10.163.129.223:8080/api/auth/staff/login";
      const backendUrl = "http://192.168.8.180:8080/api/auth/staff/login";

      // 2. Send the data to Spring Boot
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staffId,
          password: password,
        }),
      });

      // 3. Handle Errors
      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setIsLoading(false);
        return;
      }

      // 4. Handle Success! (Backend sends JSON containing the Token and Role)
      const data = await response.json();

      Alert.alert("Login Successful!", `Welcome back! Role: ${data.role}`);

      //SAVE THE TOKEN TO THE PHONE'S BACKPACK
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userRole", data.role);

      console.log("Token successfully saved to device!");

      // 5. Navigate to the Midwife Dashboard
      router.replace("/phm_dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Could not connect to the server. Is Spring Boot running?",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back to Gateway</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Staff Portal</Text>
          <Text style={styles.subtitle}>
            Secure access for Medical Personnel
          </Text>
        </View>

        {/* Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Staff ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PHM-2026"
            value={staffId}
            onChangeText={setStaffId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry // Hides the password!
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login to Dashboard</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  innerContainer: { flex: 1, padding: 25, justifyContent: "center" },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backText: { color: "#0056b3", fontSize: 16, fontWeight: "600" },
  header: { marginBottom: 40, marginTop: 40 },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#6c757d" },
  errorBox: {
    backgroundColor: "#FFD2D2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: "#D8000C", textAlign: "center", fontWeight: "bold" },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#0056b3",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0056b3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
});
