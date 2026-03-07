import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, // Added for the loading spinner!
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NEW: A state to track if the app is currently talking to the server
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Check if any fields are empty
    if (!phoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      // Turn on the loading spinner!
      setIsLoading(true);
      console.log("Sending registration request to backend...");

      // 3. Send the data to your Spring Boot Register endpoint
      // ⚠️ IMPORTANT: Make sure this IP address is still your laptop's correct IPv4 address!
      const response = await axios.post(
        "http://172.20.10.4:8080/api/users/register",
        {
          phoneNumber: phoneNumber,
          password: password,
          role: "MOTHER", // Sending a default role for the MaathaCare app!
        },
      );

      // 4. Handle Success
      console.log("Registration Success:", response.data);

      Alert.alert(
        "Account Created!",
        "Welcome to MaathaCare. Please log in with your new account.",
        [{ text: "OK", onPress: () => router.replace("/mother-login") }],
      );
    } catch (error) {
      // Tell TypeScript to stop complaining!
      const err = error as any;

      console.error("Full Error Details:", err);

      // Turn off loading spinner
      setIsLoading(false);

      if (err.response) {
        // The server received it, but rejected it (e.g., 403 Forbidden or 500 Internal Error)
        Alert.alert("Server Rejected", `Error Code: ${err.response.status}`);
      } else if (err.request) {
        // The app couldn't even reach the server (Firewall, IP issue, or Apple blocking it)
        Alert.alert(
          "Network Blocked",
          `Cannot reach server. Check Wi-Fi and IP.`,
        );
      } else {
        // Something else broke
        Alert.alert("App Error", err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join MaathaCare today</Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 0771234567"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCapitalize="none"
        // Disable typing while loading
        editable={!isLoading}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Type password again"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      {/* NEW: Button changes based on loading state */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 40 },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "row", // Helps align spinner and text
  },
  buttonDisabled: {
    backgroundColor: "#ffb6c1", // Lighter pink when disabled
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginContainer: { flexDirection: "row", marginTop: 20 },
  loginText: { color: "#6c757d", fontSize: 15 },
  loginLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});
