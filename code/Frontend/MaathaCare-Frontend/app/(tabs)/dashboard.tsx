import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MaathaCare!</Text>
      <Text style={styles.subtitle}>You are securely logged in.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF69B4", // MaathaCare Pink
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
  },
});
