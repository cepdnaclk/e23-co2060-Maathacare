import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// TypeScript interface to resolve the 'any' indexing error
interface VisitData {
  week: string; weight: string; bp: string; sfh: string; hb: string;
  fhs: string; fm: string; protein: string; sugar: string;
  iron: boolean; calcium: boolean; folicAcid: boolean;
}

export default function RecordVisitScreen() {
  const { motherId, motherName } = useLocalSearchParams();
  const router = useRouter();
  
  const [data, setData] = useState<VisitData>({
    week: '', weight: '', bp: '', sfh: '', hb: '',
    fhs: 'Present', fm: 'Normal', protein: 'Negative', sugar: 'Negative',
    iron: false, calcium: false, folicAcid: false
  });

  // Type-safe dynamic toggle button
  const ToggleButton = ({ label, value, stateKey }: { label: string, value: string, stateKey: keyof VisitData }) => (
    <TouchableOpacity 
      style={[styles.chip, data[stateKey] === value && styles.chipActive]}
      onPress={() => setData({...data, [stateKey]: value as never})}
    >
      <Text style={data[stateKey] === value ? styles.chipTextActive : styles.chipText}>{value}</Text>
    </TouchableOpacity>
  );

  const handleSave = () => {
    // API logic will go here. For now, we simulate success.
    Alert.alert("Success", "Clinical visit recorded successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Record Visit</Text>
        <Text style={styles.subHeader}>Patient: {motherName}</Text>

        {/* 1. Vitals */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Mother's Vitals</Text>
          <Text style={styles.label}>Gestational Week</Text>
          <TextInput style={styles.input} placeholder="e.g. 24" keyboardType="numeric" onChangeText={(v) => setData({...data, week: v})} />
          
          <View style={styles.rowInputs}>
            <View style={{flex: 1, paddingRight: 5}}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} placeholder="e.g. 62.5" keyboardType="numeric" onChangeText={(v) => setData({...data, weight: v})} />
            </View>
            <View style={{flex: 1, paddingLeft: 5}}>
              <Text style={styles.label}>Blood Pressure</Text>
              <TextInput style={styles.input} placeholder="e.g. 120/80" onChangeText={(v) => setData({...data, bp: v})} />
            </View>
          </View>
        </View>

        {/* 2. Fetal Assessment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Fetal Assessment</Text>
          <Text style={styles.label}>Symphysio-Fundal Height (cm)</Text>
          <TextInput style={styles.input} placeholder="e.g. 22" keyboardType="numeric" onChangeText={(v) => setData({...data, sfh: v})} />
          
          <Text style={styles.label}>Fetal Heart Sounds</Text>
          <View style={styles.row}>
            <ToggleButton label="FHS" value="Present" stateKey="fhs" />
            <ToggleButton label="FHS" value="Absent" stateKey="fhs" />
          </View>

          <Text style={styles.label}>Fetal Movements</Text>
          <View style={styles.row}>
            <ToggleButton label="FM" value="Normal" stateKey="fm" />
            <ToggleButton label="FM" value="Reduced" stateKey="fm" />
          </View>
        </View>

        {/* 3. Laboratory Tests */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Laboratory Tests</Text>
          <Text style={styles.label}>Haemoglobin (Hb) level</Text>
          <TextInput style={styles.input} placeholder="e.g. 11.5" keyboardType="numeric" onChangeText={(v) => setData({...data, hb: v})} />
          
          <Text style={styles.label}>Urine Protein</Text>
          <View style={styles.row}>
            <ToggleButton label="Protein" value="Negative" stateKey="protein" />
            <ToggleButton label="Protein" value="Trace" stateKey="protein" />
            <ToggleButton label="Protein" value="Positive" stateKey="protein" />
          </View>

          <Text style={styles.label}>Urine Sugar</Text>
          <View style={styles.row}>
            <ToggleButton label="Sugar" value="Negative" stateKey="sugar" />
            <ToggleButton label="Sugar" value="Positive" stateKey="sugar" />
          </View>
        </View>

        {/* 4. Interventions & Supplements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Interventions & Supplements</Text>
          
          <TouchableOpacity style={styles.checkbox} onPress={() => setData({...data, iron: !data.iron})}>
            <Text style={styles.checkboxText}>{data.iron ? "☑" : "☐"} Iron Tablets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.checkbox} onPress={() => setData({...data, folicAcid: !data.folicAcid})}>
            <Text style={styles.checkboxText}>{data.folicAcid ? "☑" : "☐"} Folic Acid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkbox} onPress={() => setData({...data, calcium: !data.calcium})}>
            <Text style={styles.checkboxText}>{data.calcium ? "☑" : "☐"} Calcium</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Clinical Record</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  backBtn: { marginBottom: 15, marginTop: 40 },
  backBtnText: { color: '#0056b3', fontSize: 16, fontWeight: 'bold' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subHeader: { fontSize: 16, color: '#64748B', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#0056b3' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { backgroundColor: '#F1F5F9', padding: 14, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#F1F5F9', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  chipText: { color: '#64748B', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  checkbox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  checkboxText: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  saveBtn: { backgroundColor: '#0056b3', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});