import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();

  // State variables to hold what the user types into the form
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");

  const submitProfile = async () => {
    // 1. Basic validation
    if (!fullName || !nic || !emergencyPhone || !address) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    try {
      // 2. Get the VIP pass
      const token = await SecureStore.getItemAsync("userToken");

      if (!token) {
        Alert.alert("Error", "No token found! Please log in again.");
        return;
      }

      const decodedToken = jwtDecode<{ userId: string }>(token);
      const realUserId = decodedToken.userId;

      console.log("Extracted Real User ID:", realUserId);

      // 3. Send the POST request with the real typed data!
      const response = await axios.post(
        "http://172.20.10.2:8080/api/mothers/profile",
        {
          userId: realUserId,
          fullName: fullName,
          nic: nic,
          emergencyContactNumber: emergencyPhone,
          address: address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Success!", response.data);
      Alert.alert("Success!", response.data);

      // Clear the form after success
      setFullName("");
      setNic("");
      setEmergencyPhone("");
      setAddress("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data;
        const fallbackMessage = error.message;
        const finalErrorMessage =
          typeof backendMessage === "string"
            ? backendMessage
            : JSON.stringify(backendMessage) || fallbackMessage;

        console.error("Error from Backend:", finalErrorMessage);
        Alert.alert("Backend Error", finalErrorMessage);
      } else {
        console.error("Unexpected Error:", error);
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userRole");
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to MaathaCare!</Text>
      <Text style={styles.subtitle}>Complete your Mother Profile below.</Text>

      {/* THE FORM UI */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="NIC Number"
          placeholderTextColor="#888"
          value={nic}
          onChangeText={setNic}
          keyboardType="default"
        />
        <TextInput
          style={styles.input}
          placeholder="Emergency Contact Number"
          placeholderTextColor="#888"
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Home Address"
          placeholderTextColor="#888"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity style={styles.fetchButton} onPress={submitProfile}>
        <Text style={styles.fetchButtonText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ced4da",
    fontSize: 16,
    color: "#000",
  },
  fetchButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  fetchButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  logoutButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#dc3545",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
