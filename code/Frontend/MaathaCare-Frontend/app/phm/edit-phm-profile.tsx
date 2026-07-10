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

export default function EditPHMProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize state with the existing profile data passed from the dashboard
  const [formData, setFormData] = useState({
    fullName: params.fullName || "",
    contactNumber: params.contactNumber || "",
    mohArea: params.mohArea || "",
    gnDivision: params.gnDivision || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      // 🟢 GET THE USER ID DIRECTLY FROM THE PARAMS INSTEAD OF ASYNC STORAGE
      const targetUserId = params.userId; 

      if (!targetUserId) {
         Alert.alert("Error", "User ID is missing. Please reload the dashboard.");
         setLoading(false);
         return;
      }

      // Use the new targetUserId in the URL
      const url = `${API_BASE_URL}/api/phm/profile/${targetUserId}`;

      const response = await axios.put(
        url,
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
      console.error("PHM Profile Update Error:", error);
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
          <Text style={styles.subHeader}>Update your contact and service area details.</Text>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={formData.fullName as string} 
              onChangeText={(text) => setFormData({...formData, fullName: text})} 
            />

            <Text style={styles.inputLabel}>Contact Number</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="phone-pad"
              maxLength={10} // 🟢 1. Stops them from typing more than 10 characters
              value={formData.contactNumber as string} 
              onChangeText={(text) => {
                // 🟢 2. Instantly removes any letters, spaces, or symbols they try to paste
                const numericText = text.replace(/[^0-9]/g, ''); 
                setFormData({...formData, contactNumber: numericText});
              }} 
            />

            <Text style={styles.inputLabel}>Assigned MOH Area</Text>
            <TextInput 
              style={styles.input} 
              value={formData.mohArea as string} 
              onChangeText={(text) => setFormData({...formData, mohArea: text})} 
            />

            <Text style={styles.inputLabel}>GN Division (Optional)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.gnDivision as string} 
              onChangeText={(text) => setFormData({...formData, gnDivision: text})} 
            />
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
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" }, // Using PHM background color
  container: { flex: 1, paddingHorizontal: 25 },
  backBtn: { marginTop: 20, marginBottom: 15 },
  backBtnText: { color: "#0056b3", fontWeight: "bold", fontSize: 16 }, // PHM Primary Blue
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1E293B", marginBottom: 5 },
  subHeader: { fontSize: 14, color: "#64748B", marginBottom: 25 },
  formCard: { backgroundColor: "white", padding: 20, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 25 },
  inputLabel: { fontSize: 12, fontWeight: "bold", color: "#94A3B8", textTransform: "uppercase", marginBottom: 8 },
  input: { backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 15, fontSize: 16, color: "#1E293B", marginBottom: 20 },
  saveButton: { backgroundColor: "#0056b3", height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#0056b3", shadowOpacity: 0.3, shadowRadius: 10, marginBottom: 40 },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 17 }
});