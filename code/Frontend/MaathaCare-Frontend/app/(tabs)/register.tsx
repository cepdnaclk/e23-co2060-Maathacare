import AsyncStorage from "@react-native-async-storage/async-storage"; // 🟢 Standardized storage
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

// 🌍 Use your current active IP
const API_BASE_URL = "http://10.163.129.223:8080";

const districtMap: Record<string, { label: string; value: string }[]> = {
  Central: [{ label: "Kandy", value: "Kandy" }, { label: "Matale", value: "Matale" }, { label: "Nuwara Eliya", value: "Nuwara Eliya" }],
  Southern: [{ label: "Galle", value: "Galle" }, { label: "Hambantota", value: "Hambantota" }, { label: "Matara", value: "Matara" }],
  Western: [{ label: "Colombo", value: "Colombo" }, { label: "Gampaha", value: "Gampaha" }, { label: "Kalutara", value: "Kalutara" }],
  // ... (Keep your other districts here)
};

export default function Register() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [dob, setDob] = useState(new Date());
  const [lmp, setLmp] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown States
  const [bloodGroupOpen, setBloodGroupOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [province, setProvince] = useState<string | null>(null);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [district, setDistrict] = useState<string | null>(null);

  const handleRegister = async () => {
    // 1. Check for missing fields
    if (!phoneNumber || !password || !fullName || !nic || !bloodGroup || !district) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    // 2. Password Match check
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        phoneNumber,
        password,
        role: "MOTHER",
        fullName,
        nic,
        address,
        emergencyContactNumber,
        bloodGroup,
        district,
        province,
        dateOfBirth: dob.toISOString().split("T")[0], // 🟢 Format: YYYY-MM-DD
        lastMenstrualPeriod: lmp.toISOString().split("T")[0],
      };

      const response = await axios.post(`${API_BASE_URL}/api/users/register`, payload);

      // 3. 🚀 CRITICAL: Save the phone number as userId so the Profile can find it!
      await AsyncStorage.setItem("userId", phoneNumber); 

      Alert.alert("Success", "Account Created! Please log in.", [
        { text: "OK", onPress: () => router.replace("/mother-login") }
      ]);
    } catch (error: any) {
      console.error("Reg Error:", error.response?.data || error.message);
      Alert.alert("Registration Failed", error.response?.data || "Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="NIC Number (12 characters)" value={nic} onChangeText={setNic} maxLength={12} />
      
      <Text style={styles.label}>Blood Group</Text>
      <DropDownPicker
        open={bloodGroupOpen} value={bloodGroup} setOpen={setBloodGroupOpen} setValue={setBloodGroup}
        items={[{label: 'A+', value: 'A+'}, {label: 'O+', value: 'O+'}, {label: 'B+', value: 'B+'}, {label: 'AB+', value: 'AB+'}]}
        listMode="SCROLLVIEW" style={styles.dropdown}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor: "#F8F9FA" },
  title: { fontSize: 32, fontWeight: "bold", color: "#FF69B4", marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: "600", color: "#495057", marginBottom: 5 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#dee2e6" },
  dropdown: { backgroundColor: "#fff", borderRadius: 8, marginBottom: 15, borderColor: "#dee2e6" },
  button: { backgroundColor: "#FF69B4", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});