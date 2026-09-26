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
  const paramValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] || "" : value || "";
  const [formData, setFormData] = useState({
    fullName: paramValue(params.fullName),
    emergencyContactName: paramValue(params.emergencyContactName),
    emergencyContactRelationship: paramValue(params.emergencyContactRelationship),
    emergencyContactNumber: paramValue(params.emergencyContactNumber),
    address: paramValue(params.address),
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200 || response.status === 204) {
        Alert.alert("Success", "Your profile has been updated!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) =>
    setFormData({ ...formData, [field]: value });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.subHeader}>Update your contact and address details.</Text>
          <View style={styles.formCard}>
            <Field label="Full Name" value={formData.fullName} onChangeText={(value) => updateField("fullName", value)} />
            <Field label="Emergency Contact Name" value={formData.emergencyContactName} onChangeText={(value) => updateField("emergencyContactName", value)} />
            <Field label="Relationship to Mother" value={formData.emergencyContactRelationship} onChangeText={(value) => updateField("emergencyContactRelationship", value)} />
            <Field label="Emergency Contact Number" value={formData.emergencyContactNumber} keyboardType="phone-pad" maxLength={10} onChangeText={(value) => updateField("emergencyContactNumber", value.replace(/[^0-9]/g, ""))} />
            <Field label="Full Address" value={formData.address} multiline onChangeText={(value) => updateField("address", value)} />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, multiline, ...props }: { label: string; multiline?: boolean; value: string; onChangeText: (value: string) => void; keyboardType?: "default" | "phone-pad"; maxLength?: number }) {
  return <View><Text style={styles.inputLabel}>{label}</Text><TextInput style={[styles.input, multiline && styles.multiline]} multiline={multiline} {...props} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff5f8" }, container: { flex: 1, paddingHorizontal: 25 }, backBtn: { marginTop: 20, marginBottom: 15 }, backBtnText: { color: "#db2777", fontWeight: "bold", fontSize: 16 }, headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 5 }, subHeader: { fontSize: 14, color: "#6b7280", marginBottom: 25 }, formCard: { backgroundColor: "white", padding: 20, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 25 }, inputLabel: { fontSize: 12, fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", marginBottom: 8 }, input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 15, fontSize: 16, color: "#374151", marginBottom: 20 }, multiline: { height: 80, textAlignVertical: "top" }, saveButton: { backgroundColor: "#db2777", height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#db2777", shadowOpacity: 0.3, shadowRadius: 10, marginBottom: 40 }, saveButtonText: { color: "white", fontWeight: "bold", fontSize: 17 },
});
