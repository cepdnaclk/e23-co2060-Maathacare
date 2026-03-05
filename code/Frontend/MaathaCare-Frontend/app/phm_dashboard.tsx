import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PHMDashboard() {
  const router = useRouter();
  const [role, setRole] = useState("");

  useEffect(() => {
    //Open the backpack and check who is logged in!
    const loadData = async () => {
      const savedRole = await AsyncStorage.getItem("userRole");
      if (savedRole) setRole(savedRole);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    // 🗑️ Empty the backpack
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userRole");

    //Send them back to the main Gateway screen (and prevent going "back")
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Midwife Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {role}!</Text>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
  },
  subtitle: { fontSize: 18, color: "#6c757d", marginBottom: 40 },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  logoutText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
