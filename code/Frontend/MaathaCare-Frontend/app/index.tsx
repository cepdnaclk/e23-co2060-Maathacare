<<<<<<< HEAD:code/Frontend/MaathaCare-Frontend/app/(tabs)/index.tsx
import { Link, useRouter } from "expo-router";
import React from "react";
import {
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
>>>>>>> origin/main:code/Frontend/MaathaCare-Frontend/app/index.tsx
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GatewayScreen() {
  const router = useRouter();

  // 1. State to show the loading spinner while checking the backpack
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 🎒 2. Peek into the phone's memory
        const userToken = await AsyncStorage.getItem("userToken");
        const userRole = await AsyncStorage.getItem("userRole");

        // 3. If they have a token, bypass the login screen!
        if (userToken && userRole) {
          if (userRole === "PHM") {
            router.replace("/phm_dashboard");
            return; // Stop the code so the buttons don't flash
          }
          // TODO: Uncomment when we build the Mother Dashboard!
          // if (userRole === "MOTHER") {
          //   router.replace("/mother-dashboard");
          //   return;
          // }
        }
      } catch (error) {
        console.error("Error checking backpack:", error);
      } finally {
        // 4. If memory is empty (or after checking), turn off the spinner
        setIsCheckingUser(false);
      }
    };

    checkLoginStatus();
  }, []);

  // --- THE LOADING SCREEN ---
  if (isCheckingUser) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        {/* Using your MaathaCare Pink for the spinner! */}
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading MaathaCare...</Text>
      </View>
    );
  }

  // --- THE MAIN GATEWAY UI (Your exact design!) ---
  return (
    <SafeAreaView style={styles.container}>
      {/* App Logo & Welcome */}
      <View style={styles.header}>
        <Text style={styles.title}>MaathaCare</Text>
        <Text style={styles.subtitle}>Smart Digital Pregnancy Support</Text>
      </View>

      {/* The Two Main Portals */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.motherButton]}
          onPress={() => router.push("/mother-login")}
        >
          <Text style={styles.buttonTitle}>I am a Mother</Text>
          <Text style={styles.buttonSub}>Login or register for care</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.staffButton]}
          onPress={() => router.push("/staff-login")}
        >
          <Text style={styles.buttonTitle}>Healthcare Staff</Text>
          <Text style={styles.buttonSub}>Secure PHM & Admin Portal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
  },
  loadingCenter: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#FF69B4", // Matches the theme
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FF69B4", // The MaathaCare Pink
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 20, // Adds space between the buttons
  },
  
  button: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  motherButton: {
    backgroundColor: "#FF69B4", // Pink for Mothers
  },
  staffButton: {
    backgroundColor: "#0056b3", // Professional Blue for Staff
  },
  buttonTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonSub: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.9,
  },
});

{/* The Two Main Portals */}
<View style={styles.buttonContainer}>

  {/* ... (Keep the Mother and Staff buttons exactly as they are) ... */}

  <Link href="/phm-profile" style={{ marginTop: 30, color: '#0056b3', textAlign: 'center', fontSize: 16, textDecorationLine: 'underline' }}>
     🛠️ DEV: Go to PHM Profile Screen
  </Link>
</View>