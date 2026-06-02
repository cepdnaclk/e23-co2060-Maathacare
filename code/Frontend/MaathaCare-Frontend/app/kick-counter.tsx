import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Footprints, RotateCcw, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KickCounterScreen() {
  const [count, setCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load the count from local storage when the screen opens
  useEffect(() => {
    const loadPersistedCount = async () => {
      try {
        const savedCount = await AsyncStorage.getItem("daily_kick_count");
        if (savedCount !== null) {
          setCount(parseInt(savedCount));
        }
      } catch (e) {
        console.error("Failed to load kicks from storage", e);
      }
    };
    loadPersistedCount();
  }, []);

  // 2. Save to AsyncStorage every time the count changes
  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    try {
      await AsyncStorage.setItem("daily_kick_count", newCount.toString());
    } catch (e) {
      console.error("Failed to save kicks to storage", e);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await AsyncStorage.setItem("daily_kick_count", "0");
  };

  // 3. Save to your Spring Boot Backend
  const saveKicksToBackend = async () => {
    setIsSaving(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      const ip = "192.168.131.223"; // Ensure this matches your current IP

      const response = await axios.post(
        `http://${ip}:8080/api/mothers/kicks`,
        { userId, kickCount: count, date: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success",
          `Today's record of ${count} kicks has been saved to your profile.`,
        );
      }
    } catch (error) {
      console.error("Backend Save Error:", error);
      Alert.alert(
        "Error",
        "Could not sync with the server. It's saved locally for now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Baby Kicks</Text>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={handleIncrement}
          activeOpacity={0.85}
        >
          <View style={styles.iconWrapper}>
            <Footprints size={46} color="#C97C8A" />
          </View>

          <Text style={styles.count}>{count}</Text>
          <Text style={styles.tapText}>Tap</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <RotateCcw size={18} color="#9A7B82" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.disabledBtn]}
            onPress={saveKicksToBackend}
            disabled={isSaving}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.saveText}>{isSaving ? "Saving" : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4F1",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#FFFBFA",
    borderRadius: 36,
    padding: 24,
    alignItems: "center",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#7A4E57",
    marginBottom: 32,
  },

  counterButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#F8D7DA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#FDECEF",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 7,
  },

  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF8F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  count: {
    fontSize: 72,
    fontWeight: "900",
    color: "#7A4E57",
    lineHeight: 82,
  },

  tapText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#9A7B82",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 36,
    width: "100%",
  },

  resetBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F7E8E6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 10,
  },

  resetText: {
    color: "#9A7B82",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },

  saveBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#C97C8A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },

  disabledBtn: {
    opacity: 0.6,
  },
});
