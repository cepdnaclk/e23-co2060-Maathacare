import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminLoginScreen() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffId || !password) {
      Alert.alert("Error", "Please enter your Admin ID and password.");
      return;
    }

    setLoading(true);
    try {
      // 🚀 Ensure this IP matches your laptop
      const response = await fetch(
        "http://192.168.1.9:8080/api/users/staff/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId, password }),
        },
      );

      if (response.ok) {
        const data = await response.json();

        // 🔒 The Ultimate Security Check: Are they actually an Admin?
        if (data.role === "ADMIN") {
          // Success! Route to the Admin Hub
          router.replace("/admin/admin_hub"); // Or '/admin/admin_hub' depending on your filename
        } else {
          Alert.alert(
            "Access Denied",
            "This portal is restricted to System Administrators only.",
          );
        }
      } else {
        const errorMsg = await response.text();
        Alert.alert("Login Failed", errorMsg);
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>MaathaCare</Text>
        <Text style={styles.subtitle}>System Administrator Portal</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Admin ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ADMIN-MASTER"
          autoCapitalize="characters"
          value={staffId}
          onChangeText={setStaffId}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="********"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Secure Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    padding: 20,
  },
  headerBox: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  subtitle: {
    fontSize: 16,
    color: "#0f3460",
    backgroundColor: "#e94560",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    overflow: "hidden",
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: "#16213e",
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#e94560" },
  input: {
    borderWidth: 1,
    borderColor: "#0f3460",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#0f3460",
    color: "#fff",
  },
  loginBtn: {
    backgroundColor: "#e94560",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
