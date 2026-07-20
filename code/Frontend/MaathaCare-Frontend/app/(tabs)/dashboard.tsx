import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import * as Device from 'expo-device'; 
import * as Notifications from 'expo-notifications';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 🌟 NEW: Tells the OS to show the notification banner even if the app is currently open!
// 🌟 NEW: Tells the OS to show the notification banner even if the app is currently open!
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Replaces shouldShowAlert
    shouldShowList: true,   // Keeps it in the notification tray
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function Dashboard() {
  const router = useRouter();

  // State variables for the form
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");

  const [milestone, setMilestone] = useState<any>(null);

  // 🌟 NEW: The Push Notification Registration Trigger
  useEffect(() => {
    registerAndSyncPushToken();
  }, []);

  // Fetch the Weekly Milestone data
  useEffect(() => {
    axios
      .get("http://10.83.10.226:8080/api/milestones/1")
      .then((response) => {
        setMilestone(response.data);
      })
      .catch((error) => {
        console.error("Error fetching milestone:", error);
      });
  }, []);

  // 🌟 NEW FUNCTION: Get Expo Token and send to Spring Boot
  const registerAndSyncPushToken = async () => {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return;
    }

    // 1. Request OS Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // 2. Generate Expo Device Token
    // 2. Generate Expo Device Token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: "4e306a80-b92e-40ef-a5f0-64280b190a03" // 🟢 Your new project ID
      });
      const token = tokenData.data;
      console.log("Generated Push Token:", token);

      // 3. Send Token to Backend
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      const decodedToken = jwtDecode<{ userId: string }>(userToken);
      const realUserId = decodedToken.userId;

      await axios.put(
          `http://10.83.10.226:8080/api/mothers/${realUserId}/push-token`,
          {
            pushToken: token // 🟢 Send the token safely in the body, not the URL
          },
          { headers: { Authorization: `Bearer ${userToken}` } }
      );
      console.log("Token synced successfully to backend!");

    } catch (error) {
      console.error("Error generating or syncing token:", error);
    }
  };

  const submitProfile = async () => {
    if (!fullName || !nic || !emergencyPhone || !address) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No token found! Please log in again.");
        return;
      }

      const decodedToken = jwtDecode<{ userId: string }>(token);
      const realUserId = decodedToken.userId;

      const response = await axios.post(
        "http://10.83.10.226:8080/api/mothers/profile",
        {
          userId: realUserId,
          fullName: fullName,
          nic: nic,
          emergencyContactNumber: emergencyPhone,
          address: address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success!", response.data);
      setFullName("");
      setNic("");
      setEmergencyPhone("");
      setAddress("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data;
        const fallbackMessage = error.message;
        const finalErrorMessage = typeof backendMessage === "string" ? backendMessage : JSON.stringify(backendMessage) || fallbackMessage;
        Alert.alert("Backend Error", finalErrorMessage);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to MaathaCare!</Text>
      <Text style={styles.subtitle}>Complete your Mother Profile below.</Text>

      {milestone && (
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneTitle}>
            Week {milestone.weekNumber} Progress
          </Text>
          <Text style={styles.milestoneText}>
            Your baby is the size of a {milestone.babySize} 🍋
          </Text>
          <Text style={styles.milestoneText}>
            Weight: {milestone.babyWeight}
          </Text>
          <Text style={styles.milestoneTip}>"{milestone.weeklyTip}"</Text>
        </View>
      )}

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
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF69B4", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 20 },
  milestoneCard: { backgroundColor: "#fce7f3", padding: 20, borderRadius: 15, width: "100%", marginBottom: 20, borderWidth: 1, borderColor: "#fbcfe8", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  milestoneTitle: { fontSize: 22, fontWeight: "bold", color: "#db2777", marginBottom: 8 },
  milestoneText: { fontSize: 16, color: "#374151", marginBottom: 4 },
  milestoneTip: { fontSize: 15, marginTop: 12, fontStyle: "italic", color: "#4b5563", lineHeight: 22 },
  formContainer: { width: "100%", marginBottom: 20 },
  input: { backgroundColor: "#fff", width: "100%", height: 50, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#ced4da", fontSize: 16, color: "#000" },
  fetchButton: { width: "100%", height: 50, backgroundColor: "#007BFF", borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 15 },
  fetchButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  logoutButton: { width: "100%", height: 50, backgroundColor: "#dc3545", borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logoutButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});