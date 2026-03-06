import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore MaathaCare</Text>
      <Text style={styles.subtitle}>
        Health tips and resources coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF69B4",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
