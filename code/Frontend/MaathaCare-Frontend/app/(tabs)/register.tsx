import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView, // Added to allow scrolling through the new fields
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

export default function Register() {
  const router = useRouter();
  
  // Existing States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // NEW States for MotherProfile
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  
  // Date Picker States
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Dropdown States
  const [bloodGroup, setBloodGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");

  const handleRegister = async () => {
    // 1. Basic Validation
    if (!phoneNumber || !password || !fullName || !nic || !address || !emergencyContactNumber || !bloodGroup || !district || !province) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (nic.length !== 12) {
      Alert.alert("Error", "NIC must be exactly 12 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Sending registration request to backend...");

      // 2. The Payload matching your MotherProfile structure
      const payload = {
        phoneNumber: phoneNumber,
        password: password,
        role: "MOTHER",
        fullName: fullName,
        nic: nic,
        address: address,
        emergencyContactNumber: emergencyContactNumber,
        bloodGroup: bloodGroup,
        district: district,
        province: province,
        dateOfBirth: dob.toISOString().split('T')[0] // Format: YYYY-MM-DD
      };

      const response = await axios.post(
        "http://10.168.251.226:8080/api/users/register",
        payload
      );

      console.log("Registration Success:", response.data);

      Alert.alert(
        "Account Created!",
        "Welcome to MaathaCare. Please log in with your new account.",
        [{ text: "OK", onPress: () => router.replace("/mother-login") }]
      );
    } catch (error) {
      const err = error as any;
      console.error("Full Error Details:", err);
      setIsLoading(false);

      if (err.response) {
        Alert.alert("Server Rejected", `Error Code: ${err.response.status}`);
      } else if (err.request) {
        Alert.alert("Network Blocked", "Cannot reach server. Check Wi-Fi and IP.");
      } else {
        Alert.alert("App Error", err.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join MaathaCare today</Text>

      {/* Account Details */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} placeholder="e.g. 0771234567" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" editable={!isLoading} />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry={true} editable={!isLoading} />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput style={styles.input} placeholder="Type password again" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} editable={!isLoading} />

      {/* Profile Details */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} placeholder="Jane Doe" value={fullName} onChangeText={setFullName} editable={!isLoading} />

      <Text style={styles.label}>NIC Number (12 Characters)</Text>
      <TextInput style={styles.input} placeholder="199012345678" value={nic} onChangeText={setNic} maxLength={12} editable={!isLoading} />

      <Text style={styles.label}>Emergency Contact</Text>
      <TextInput style={styles.input} placeholder="e.g. 0719876543" value={emergencyContactNumber} onChangeText={setEmergencyContactNumber} keyboardType="phone-pad" editable={!isLoading} />

      <Text style={styles.label}>Home Address</Text>
      <TextInput style={styles.input} placeholder="123 Main St..." value={address} onChangeText={setAddress} editable={!isLoading} />

      {/* Date of Birth Picker */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity 
        style={styles.dateInput} 
        onPress={() => !isLoading && setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{dob.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
        />
      )}

      {/* Dropdowns */}
      <Text style={styles.label}>Blood Group</Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
            onValueChange={setBloodGroup}
            items={[
                { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
                { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
                { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
            ]}
            placeholder={{ label: "Select Blood Group", value: null }}
            disabled={isLoading}
        />
      </View>

      <Text style={styles.label}>Province</Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
            onValueChange={setProvince}
            items={[
                { label: 'Western', value: 'Western' }, { label: 'Central', value: 'Central' },
                { label: 'Southern', value: 'Southern' }, { label: 'North Western', value: 'North Western' },
                // Add remaining provinces as needed
            ]}
            placeholder={{ label: "Select Province", value: null }}
            disabled={isLoading}
        />
      </View>

      <Text style={styles.label}>District</Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
            onValueChange={setDistrict}
            items={[
                { label: 'Colombo', value: 'Colombo' }, { label: 'Gampaha', value: 'Gampaha' },
                { label: 'Kalutara', value: 'Kalutara' }, { label: 'Kandy', value: 'Kandy' },
                // Add remaining districts as needed
            ]}
            placeholder={{ label: "Select District", value: null }}
            disabled={isLoading}
        />
      </View>

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Important for ScrollView to work properly
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    padding: 20,
    paddingTop: 50, // Added padding for the top
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#FF69B4", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 30 },
  label: { alignSelf: "flex-start", fontSize: 14, fontWeight: "600", color: "#495057", marginBottom: 5, marginLeft: 2 },
  input: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#dee2e6" },
  dateInput: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#dee2e6", justifyContent: 'center' },
  dateText: { color: "#495057", fontSize: 16 },
  pickerContainer: { width: "100%", backgroundColor: "#fff", borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#dee2e6", padding: 5 },
  button: { width: "100%", height: 50, backgroundColor: "#FF69B4", borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 20, flexDirection: "row" },
  buttonDisabled: { backgroundColor: "#ffb6c1" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginContainer: { flexDirection: "row", marginTop: 20, marginBottom: 40 },
  loginText: { color: "#6c757d", fontSize: 15 },
  loginLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});