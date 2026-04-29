import AsyncStorage from "@react-native-async-storage/async-storage";
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

// 🌍 Ensure this matches your computer's actual Wi-Fi IP address!
const API_BASE_URL = "http://192.168.131.223:8080";

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async () => {
    // 1. Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Your new passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const token = (await AsyncStorage.getItem("userToken")) || "";

      // 2. Fetch API Call
      const response = await fetch(
        `${API_BASE_URL}/api/phm/change-password`,
        {
          method: "PUT", // 🟢 Changed from POST to PUT to match Backend
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        },
      );

      if (response.ok) {
        Alert.alert("Success! 🔒", "Your password has been securely updated.");
        router.back(); 
      } else {
        const errorText = await response.text();
        Alert.alert("Failed", errorText || "Could not update password.");
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to the MaathaCare server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Update Password</Text>
      <Text style={styles.subText}>
        For your security, please change your default password.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Enter current password"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-type new password"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdatePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save New Password</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={{ marginTop: 20, alignItems: 'center' }}
      >
        <Text style={{ color: '#64748b', fontWeight: '500' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f4f7fb",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  subText: { fontSize: 14, color: "#64748b", marginBottom: 30, lineHeight: 20 },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    color: '#1e293b'
  },
  button: {
    backgroundColor: "#0056b3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});