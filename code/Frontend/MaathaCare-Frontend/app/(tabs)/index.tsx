import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GatewayScreen() {
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userRole = await AsyncStorage.getItem("userRole");

        if (userToken && userRole) {
          if (userRole === "PHM") {
            // 🟢 FIXED: Added 'as any' to bypass TypeScript path error
            router.replace("/phm/phm_dashboard" as any);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isCheckingUser) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading MaathaCare...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MaathaCare</Text>
        <Text style={styles.subtitle}>Smart Digital Pregnancy Support</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.motherButton]}
          onPress={() => router.push("/mother-login" as any)}
        >
          <Text style={styles.buttonTitle}>I am a Mother</Text>
          <Text style={styles.buttonSub}>Login or register for care</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.staffButton]}
          onPress={() => router.push("/staff-login" as any)}
        >
          <Text style={styles.buttonTitle}>Healthcare Staff</Text>
          <Text style={styles.buttonSub}>Secure PHM & Admin Portal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", justifyContent: "center", padding: 20 },
  loadingCenter: { alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16, color: "#FF69B4", fontWeight: "600" },
  header: { alignItems: "center", marginBottom: 60 },
  title: { fontSize: 40, fontWeight: "bold", color: "#FF69B4", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#6c757d", fontWeight: "500" },
  buttonContainer: { width: "100%", gap: 20 },
  button: { width: "100%", paddingVertical: 20, paddingHorizontal: 15, borderRadius: 15, elevation: 3 },
  motherButton: { backgroundColor: "#FF69B4" },
  staffButton: { backgroundColor: "#0056b3" },
  buttonTitle: { color: "#ffffff", fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  buttonSub: { color: "#ffffff", fontSize: 14, opacity: 0.9 },
});