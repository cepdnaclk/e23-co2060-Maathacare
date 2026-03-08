import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://10.168.251.226:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [role, setRole] = useState("");

  // 1. New states for our secure data
  const [patients, setPatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Open the backpack and check who is logged in!
    const loadData = async () => {
      const savedRole = await AsyncStorage.getItem("userRole");
      if (savedRole) setRole(savedRole);
    };
    loadData();
  }, []);

  // --- 🔒 THE MAGIC SECURE FETCH FUNCTION ---
  const fetchSecureData = async () => {
    setLoading(true);
    try {
      // 🎒 Grab the VIP Token from the backpack
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No security token found. Please log in again.");
        return;
      }

      // 🛑 Make the request AND attach the token as a VIP badge!
      const response = await fetch(`${API_BASE_URL}/api/phm/patients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <--- THIS UNLOCKS THE VAULT!
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data); // Save the data to show on screen
      } else {
        Alert.alert(
          "Access Denied!",
          "The Spring Boot Bouncer rejected your token.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Network Error!",
        "Is Spring Boot running and your IP address correct?",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // 🗑️ Empty the backpack
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userRole");

    // Send them back to the main Gateway screen
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Midwife Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {role}!</Text>
      </View>

      {/* Button to test the Secure Connection */}
      <TouchableOpacity style={styles.fetchButton} onPress={fetchSecureData}>
        <Text style={styles.fetchText}>Fetch My Patients (Secure)</Text>
      </TouchableOpacity>

      {/* The Loading Spinner */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#0056b3"
          style={{ marginVertical: 20 }}
        />
      )}

      {/* The List of Data from Spring Boot */}
      <FlatList
        data={patients}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item}</Text>
          </View>
        )}
      />

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
    backgroundColor: "#F4F7FB",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#6c757d",
  },
  fetchButton: {
    backgroundColor: "#28a745", // A nice success green
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fetchText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
