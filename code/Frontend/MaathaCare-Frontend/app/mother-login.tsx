import AsyncStorage from "@react-native-async-storage/async-storage"; // 🟢 MOVED TO TOP!
import axios from "axios";
import { useRouter } from "expo-router";
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

  // 🟢 FIXED: Auto-login now checks the correct AsyncStorage vault!
  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        // 🧹 ADD THIS LINE TEMPORARILY TO CLEAR GHOST DATA:
        await AsyncStorage.clear();
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          console.log("Found saved token! Auto-logging in...");
          router.replace("/profile"); // Assuming you want them to go to profile or dashboard
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
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    try {
      console.log("Sending request to backend...");

      const response = await axios.post(
        "http://192.168.131.223:8080/api/users/login",
        {
          phoneNumber: phoneNumber,
          password: password,
        },
      );

      const token = response.data.token;
      const role = response.data.role;

      console.log("Login Success! Role:", role);
      console.log("JWT Token:", token);

      // 🟢 FIXED: Saves token, role, and userId correctly
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userRole", role);
      await AsyncStorage.setItem("userId", phoneNumber);

      router.replace("/profile");
    } catch (error) {
      const err = error as any;
      console.error("Full Login Error:", err);

      if (err.response) {
        Alert.alert(
          "Server Rejected",
          `Code: ${err.response.status} | Message: ${err.response.data}`,
        );
      } else if (err.request) {
        Alert.alert(
          "Network Blocked",
          "Cannot reach server. Check Wi-Fi and IP.",
        );
      } else {
        Alert.alert("App Error", err.message);
      }
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
    alignSelf: "flex-start",
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
