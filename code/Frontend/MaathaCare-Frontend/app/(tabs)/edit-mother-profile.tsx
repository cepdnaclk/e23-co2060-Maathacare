import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../constants/apiConfig";

export default function EditMotherProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize state with the existing profile data passed from the dashboard
  const [formData, setFormData] = useState({
    fullName: params.fullName || "",
    emergencyContactName: params.emergencyContactName || "",               
    emergencyContactRelationship: params.emergencyContactRelationship || "",
    emergencyContactNumber: params.emergencyContactNumber || "",
    address: params.address || "",
    district: params.district || "",
    province: params.province || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.put(
        `${API_BASE_URL}/api/mothers/profile/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Your profile has been updated!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not update profile. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.subHeader}>Update your contact and location details.</Text>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.fullName as string} 
              onChangeText={(text) => setFormData({...formData, fullName: text})} 
            />

            <Text style={styles.inputLabel}>Emergency Contact Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.emergencyContactName as string} 
              onChangeText={(text) => setFormData({...formData, emergencyContactName: text})} 
              placeholder="e.g. Kamal Perera"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Relationship to Mother</Text>
            <TextInput 
              style={styles.input} 
              value={formData.emergencyContactRelationship as string} 
              onChangeText={(text) => setFormData({...formData, emergencyContactRelationship: text})} 
              placeholder="e.g. Husband, Mother, Sister"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Emergency Contact Number</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="phone-pad"
              maxLength={10} // Restricts to 10 digits
              value={formData.emergencyContactNumber as string} 
              onChangeText={(text) => {
                // Instantly removes letters/symbols
                const numericText = text.replace(/[^0-9]/g, ''); 
                setFormData({...formData, emergencyContactNumber: numericText});
              }} 
              placeholder="e.g. 0712345678"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Full Address</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              multiline
              value={formData.address as string} 
              onChangeText={(text) => setFormData({...formData, address: text})} 
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.district as string} 
                  onChangeText={(text) => setFormData({...formData, district: text})} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Province</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.province as string} 
                  onChangeText={(text) => setFormData({...formData, province: text})} 
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff5f8" },
  container: { flex: 1, paddingHorizontal: 25 },
  backBtn: { marginTop: 20, marginBottom: 15 },
  backBtnText: { color: "#db2777", fontWeight: "bold", fontSize: 16 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 5 },
  subHeader: { fontSize: 14, color: "#6b7280", marginBottom: 25 },
  formCard: { backgroundColor: "white", padding: 20, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 25 },
  inputLabel: { fontSize: 12, fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", marginBottom: 8 },
  input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 15, fontSize: 16, color: "#374151", marginBottom: 20 },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: "#db2777", height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#db2777", shadowOpacity: 0.3, shadowRadius: 10, marginBottom: 40 },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 17 }
});