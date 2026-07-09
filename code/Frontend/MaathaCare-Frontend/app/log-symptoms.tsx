import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConfig'; 

const SYMPTOMS = [
  { label: "Nausea", emoji: "🤢" },
  { label: "Fatigue", emoji: "🥱" },
  { label: "Backache", emoji: "💥" },
  { label: "Headache", emoji: "🤕" },
  { label: "Heartburn", emoji: "🔥" },
  { label: "Swelling", emoji: "🦶" },
  { label: "Cravings", emoji: "🍩" },
  { label: "Dizziness", emoji: "💫" },
  { label: "Cramps", emoji: "⚡" },
  { label: "Insomnia", emoji: "🦉" },
  { label: "Mood Swings", emoji: "🎭" },
  { label: "Constipation", emoji: "🚽" },
  { label: "Frequent Urination", emoji: "💧" },
  { label: "Tender Breasts", emoji: "🌸" },
  { label: "Bloating", emoji: "🎈" },
  { label: "Smell Sensitivity", emoji: "👃" },
  { label: "Food Aversions", emoji: "🙅‍♀️" },
  { label: "Short Breath", emoji: "😮‍💨" },
  { label: "Congestion", emoji: "🤧" },
  { label: "Braxton Hicks", emoji: "🌊" }
];

export default function LogSymptomsScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // 🌟 New state to control the History pop-up
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsFetching(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken"); 
      
      if (!userId || !token) return;

      const response = await axios.get(`${API_BASE_URL}/api/mothers/symptoms`, {
        params: { userId: userId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const toggleSymptom = (symptomLabel: string) => {
    if (selected.includes(symptomLabel)) {
      setSelected(selected.filter(i => i !== symptomLabel));
    } else {
      setSelected([...selected, symptomLabel]);
    }
  };

  const handleSaveSymptoms = async () => {
    if (selected.length === 0) {
      Alert.alert("Wait", "Please select at least one symptom to save.");
      return;
    }

    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken"); 

      if (!userId || !token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        return;
      }

      const payload = {
        userId: userId,
        symptoms: selected,
        date: new Date().toISOString()
      };

      const response = await axios.post(`${API_BASE_URL}/api/mothers/symptoms`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setSelected([]); 
        fetchHistory();
        Alert.alert("Success! 🌸", "Your symptoms have been logged.");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      Alert.alert("Error", "Could not connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return "Unknown Date";
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Top Bar with Title and History Button */}
        <View style={styles.topBar}>
          <Text style={styles.title}>Symptoms ✨</Text>
          <TouchableOpacity 
            style={styles.historyBtn} 
            activeOpacity={0.7} 
            onPress={() => {
              fetchHistory(); // Refresh when opening
              setShowHistory(true);
            }}
          >
            <Text style={styles.historyBtnText}>🕒 History</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>Tap the symptoms you are experiencing today</Text>

        {/* Symptoms Grid */}
        <View style={styles.grid}>
          {SYMPTOMS.map((s) => {
            const isSelected = selected.includes(s.label);
            return (
              <TouchableOpacity 
                key={s.label} 
                activeOpacity={0.6}
                onPress={() => toggleSymptom(s.label)}
                style={[styles.chip, isSelected && styles.selectedChip]}
              >
                <Text style={styles.emojiText}>{s.emoji}</Text>
                <Text style={[styles.chipText, isSelected && styles.selectedText]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.submitBtn, selected.length === 0 && styles.submitBtnDisabled]} 
          onPress={handleSaveSymptoms}
          disabled={isLoading || selected.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Save Symptoms 🤍</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 🌟 The New Sliding History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your History</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowHistory(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isFetching ? (
              <ActivityIndicator color="#FF84A7" style={{ marginTop: 40 }} size="large" />
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                  <View style={styles.historyCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.dateBadge}>
                         <Text style={styles.dateText}>🕒 {formatDateTime(item.timestamp)}</Text>
                      </View>
                    </View>
                    <Text style={styles.symptomsText}>
                      {item.symptoms && item.symptoms.length > 0 
                        ? item.symptoms.join('  •  ') 
                        : "No symptoms"}
                    </Text>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No cute records found yet! 🎀</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF9FA' 
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 6
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#d3527f', 
  },
  historyBtn: {
    backgroundColor: '#FFE4EE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  historyBtnText: {
    color: '#D8437E',
    fontWeight: '800',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#A8929E', 
    marginBottom: 25,
    fontWeight: '600'
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  chip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderRadius: 30, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#FFE4EE',
    shadowColor: '#FFC4D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },
  selectedChip: { 
    backgroundColor: '#cb5476', 
    borderColor: '#cb5879',
    shadowColor: '#fc739a',
    shadowOpacity: 0.5,
  },
  emojiText: {
    fontSize: 18, 
    marginRight: 6
  },
  chipText: { 
    color: '#7A6374', 
    fontWeight: '700',
    fontSize: 15
  },
  selectedText: { 
    color: '#FFFFFF',
  },
  submitBtn: { 
    backgroundColor: '#c54673', 
    paddingVertical: 18, 
    borderRadius: 35, 
    marginTop: 35, 
    alignItems: 'center',
    shadowColor: '#ca4674',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  submitBtnDisabled: {
    backgroundColor: '#FFE4EE', 
    shadowOpacity: 0
  },
  submitText: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 18,
    letterSpacing: 0.5
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 182, 193, 0.3)', // Very soft pink transparent overlay
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF9FA',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 24,
    height: '75%', // Takes up 75% of the screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE4EE',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#db487c',
  },
  closeBtn: {
    backgroundColor: '#FFE4EE',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D8437E',
  },
  historyCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 22, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 2,
    borderColor: '#FFE4EE',
    shadowColor: '#FFC4D9', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    elevation: 2 
  },
  cardHeader: {
    marginBottom: 12,
    flexDirection: 'row'
  },
  dateBadge: {
    backgroundColor: '#FFF0F5', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  dateText: { 
    fontSize: 12, 
    color: '#D188A8', 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  symptomsText: { 
    fontSize: 16, 
    color: '#5C4B51', 
    fontWeight: '700',
    lineHeight: 24
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 60 
  },
  emptyText: { 
    color: '#D188A8', 
    fontSize: 16, 
    fontWeight: '600'
  }
});