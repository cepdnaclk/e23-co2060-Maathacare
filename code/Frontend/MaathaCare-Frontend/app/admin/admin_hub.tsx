import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminHub() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>MaathaCare System Management</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* 🚀 Button 1: Routes to the Registration Form */}
        <TouchableOpacity
          style={[styles.card, styles.registerCard]}
          onPress={() => router.push("/admin/register_staff")}
        >
          <Text style={styles.icon}>➕👩‍⚕️</Text>
          <Text style={styles.cardTitle}>Register PHM</Text>
          <Text style={styles.cardDesc}>Add a new officer to the system</Text>
        </TouchableOpacity>

        {/* 🚀 Button 2: Routes to the Staff List */}
        <TouchableOpacity
          style={[styles.card, styles.manageCard]}
          onPress={() => router.push("/admin/manage_staff")}
        >
          <Text style={styles.icon}>📋⚙️</Text>
          <Text style={styles.cardTitle}>Manage Staff</Text>
          <Text style={styles.cardDesc}>
            View and manage registered officers
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    padding: 20,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#0056b3" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 5 },
  buttonContainer: { gap: 20 },
  card: {
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  registerCard: {
    backgroundColor: "#e6f2ff",
    borderLeftWidth: 5,
    borderLeftColor: "#0056b3",
  },
  manageCard: {
    backgroundColor: "#e6ffe6",
    borderLeftWidth: 5,
    borderLeftColor: "#28a745",
  },
  icon: { fontSize: 40, marginBottom: 10 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDesc: { fontSize: 14, color: "#555", textAlign: "center" },
});
