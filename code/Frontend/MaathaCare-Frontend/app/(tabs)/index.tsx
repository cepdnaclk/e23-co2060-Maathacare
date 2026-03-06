import { Link, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GatewayScreen() {
  const router = useRouter();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
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