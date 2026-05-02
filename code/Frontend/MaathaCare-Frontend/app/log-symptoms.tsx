import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const SYMPTOMS = ["Nausea", "Fatigue", "Backache", "Swelling", "Headache", "Heartburn", "Cravings"];

export default function LogSymptomsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSymptom = (symptom: string) => {
    if (selected.includes(symptom)) {
      setSelected(selected.filter(i => i !== symptom));
    } else {
      setSelected([...selected, symptom]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <View style={styles.grid}>
        {SYMPTOMS.map((s) => (
          <TouchableOpacity 
            key={s} 
            onPress={() => toggleSymptom(s)}
            style={[styles.chip, selected.includes(s) && styles.selectedChip]}
          >
            <Text style={[styles.chipText, selected.includes(s) && styles.selectedText]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={() => Alert.alert("Logged", "Your symptoms have been recorded.")}
      >
        <Text style={styles.submitText}>Save Symptoms</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#FDF2F8', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ED70A1', marginVertical: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, backgroundColor: 'white', borderWidth: 1, borderColor: '#F9A8D4' },
  selectedChip: { backgroundColor: '#ED70A1', borderColor: '#ED70A1' },
  chipText: { color: '#ED70A1', fontWeight: '600' },
  selectedText: { color: 'white' },
  submitBtn: { backgroundColor: '#ED70A1', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});