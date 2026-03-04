import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StaffLogin() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Portal</Text>
      <Text style={styles.subtitle}>Secure PHM Login</Text>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#0056b3" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 20 },
  backButton: { color: "#007BFF", fontSize: 16, marginTop: 20 },
});
