import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Footprints, Save, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function KickCounterScreen() {
  const [count, setCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load the count from local storage when the screen opens
  useEffect(() => {
    const loadPersistedCount = async () => {
      try {
        const savedCount = await AsyncStorage.getItem('daily_kick_count');
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
      await AsyncStorage.setItem('daily_kick_count', newCount.toString());
    } catch (e) {
      console.error("Failed to save kicks to storage", e);
    }
  };

  const handleReset = async () => {
    setCount(0);
    await AsyncStorage.setItem('daily_kick_count', "0");
  };

  // 3. Save to your Spring Boot Backend
  const saveKicksToBackend = async () => {
    setIsSaving(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      const ip = "10.224.114.226"; // Ensure this matches your current IP

      const response = await axios.post(
        `http://${ip}:8080/api/mothers/kicks`, 
        { userId, kickCount: count, date: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", `Today's record of ${count} kicks has been saved to your profile.`);
      }
    } catch (error) {
      console.error("Backend Save Error:", error);
      Alert.alert("Error", "Could not sync with the server. It's saved locally for now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baby Kick Counter</Text>
      
      <TouchableOpacity style={styles.counterCircle} onPress={handleIncrement}>
        <Footprints size={80} color="white" />
        <Text style={styles.countNumber}>{count}</Text>
        <Text style={styles.tapText}>Tap for every kick</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <RotateCcw size={20} color="#6B7280" />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
          onPress={saveKicksToBackend}
          disabled={isSaving}
        >
          <Save size={20} color="white" />
          <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save Record"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ED70A1', marginBottom: 50 },
  counterCircle: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#065F46', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.3 },
  countNumber: { fontSize: 72, fontWeight: 'bold', color: 'white' },
  tapText: { color: 'white', fontSize: 14, marginTop: 10, opacity: 0.8 },
  buttonRow: { flexDirection: 'row', marginTop: 60, gap: 20 },
  saveBtn: { flexDirection: 'row', backgroundColor: '#ED70A1', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center', gap: 10 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resetBtn: { flexDirection: 'row', borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center', gap: 10 },
  resetText: { color: '#6B7280', fontWeight: 'bold' }
});