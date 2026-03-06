import axios from "axios"; // Import our new network library
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const router = useRouter();
  // This runs automatically the exact second the app opens
  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("userToken");
        if (savedToken) {
          console.log("Found saved token! Auto-logging in...");
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Error checking vault:", error);
      }
    };

    checkUserLogin();
  }, []);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 1. Check if fields are empty
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    try {
      console.log("Sending request to backend...");

      // 2. Send the data to Spring Boot
      const response = await axios.post(
        "http://172.20.10.4:8080/api/users/login",
        {
          phoneNumber: phoneNumber,
          password: password,
        },
      );

      // 3. Catch the VIP Wristband (JWT)
      const token = response.data.token;
      const role = response.data.role;

      console.log("Login Success! Role:", role);
      console.log("JWT Token:", token);

      //Lock the token and role in the phone's encrypted vault!
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userRole", role);

      router.replace("/dashboard");
    } catch (error) {
      // 4. If Spring Boot says "Invalid Password" or the server is off
      console.error("Login Error:", error);
      Alert.alert(
        "Login Failed",
        "Incorrect phone number or password. Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MaathaCare</Text>
      <Text style={styles.subtitle}>Pregnancy Support System</Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* NEW: The Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}>Register</Text>
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
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  label: {
    alignSelf: "flex-start", // Pushes the text to the left side
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
    marginLeft: 2,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    color: "#6c757d",
    fontSize: 15,
  },
  registerLink: {
    color: "#FF69B4",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
