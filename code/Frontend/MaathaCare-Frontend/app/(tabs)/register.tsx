import DateTimePicker from "@react-native-community/datetimepicker";
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
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

// --- NEW: The Province-to-District Map ---
const districtMap: Record<string, { label: string; value: string }[]> = {
  Central: [
    { label: "Kandy", value: "Kandy" },
    { label: "Matale", value: "Matale" },
    { label: "Nuwara Eliya", value: "Nuwara Eliya" },
  ],
  Eastern: [
    { label: "Ampara", value: "Ampara" },
    { label: "Batticaloa", value: "Batticaloa" },
    { label: "Trincomalee", value: "Trincomalee" },
  ],
  "North Central": [
    { label: "Anuradhapura", value: "Anuradhapura" },
    { label: "Polonnaruwa", value: "Polonnaruwa" },
  ],
  Northern: [
    { label: "Jaffna", value: "Jaffna" },
    { label: "Kilinochchi", value: "Kilinochchi" },
    { label: "Mannar", value: "Mannar" },
    { label: "Mullaitivu", value: "Mullaitivu" },
    { label: "Vavuniya", value: "Vavuniya" },
  ],
  "North Western": [
    { label: "Kurunegala", value: "Kurunegala" },
    { label: "Puttalam", value: "Puttalam" },
  ],
  Sabaragamuwa: [
    { label: "Kegalle", value: "Kegalle" },
    { label: "Ratnapura", value: "Ratnapura" },
  ],
  Southern: [
    { label: "Galle", value: "Galle" },
    { label: "Hambantota", value: "Hambantota" },
    { label: "Matara", value: "Matara" },
  ],
  Uva: [
    { label: "Badulla", value: "Badulla" },
    { label: "Monaragala", value: "Monaragala" },
  ],
  Western: [
    { label: "Colombo", value: "Colombo" },
    { label: "Gampaha", value: "Gampaha" },
    { label: "Kalutara", value: "Kalutara" },
  ],
};

export default function Register() {
  const router = useRouter();

  // Basic States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Profile States
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  // Date Picker States
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [lmp, setLmp] = useState(new Date());
  const [showLmpPicker, setShowLmpPicker] = useState(false);

  // --- Dropdown States ---
  // Blood Group
  const [bloodGroupOpen, setBloodGroupOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [bloodGroupItems, setBloodGroupItems] = useState([
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
  ]);

  // Province
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [province, setProvince] = useState<string | null>(null);
  const [provinceItems, setProvinceItems] = useState(
    Object.keys(districtMap).map((prov) => ({ label: prov, value: prov })),
  );

  // District
  const [districtOpen, setDistrictOpen] = useState(false);
  const [district, setDistrict] = useState<string | null>(null);
  const [districtItems, setDistrictItems] = useState<
    { label: string; value: string }[]
  >([]);

  const handleRegister = async () => {
    if (
      !phoneNumber ||
      !password ||
      !fullName ||
      !nic ||
      !address ||
      !emergencyContactNumber ||
      !bloodGroup ||
      !district ||
      !province
    ) {
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
        dateOfBirth: dob.toISOString().split("T")[0],
        lastMenstrualPeriod: lmp.toISOString().split("T")[0],
      };

      const response = await axios.post(
        "http://10.30.6.212:8080/api/users/register",
        payload,
      );

      console.log("Registration Success:", response.data);

      Alert.alert(
        "Account Created!",
        "Welcome to MaathaCare. Please log in with your new account.",
        [{ text: "OK", onPress: () => router.replace("/mother-login") }],
      );
    } catch (error) {
      const err = error as any;
      console.error("Full Error Details:", err);
      setIsLoading(false);

      if (err.response) {
        Alert.alert("Server Rejected", `Error Code: ${err.response.status}`);
      } else if (err.request) {
        Alert.alert(
          "Network Blocked",
          "Cannot reach server. Check Wi-Fi and IP.",
        );
      } else {
        Alert.alert("App Error", err.message);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      nestedScrollEnabled={true}
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join MaathaCare today</Text>

      {/* Account Details */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 0771234567"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        editable={!isLoading}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Type password again"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        editable={!isLoading}
      />

      {/* Profile Details */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Jane Doe"
        value={fullName}
        onChangeText={setFullName}
        editable={!isLoading}
      />

      <Text style={styles.label}>NIC Number (12 Characters)</Text>
      <TextInput
        style={styles.input}
        placeholder="199012345678"
        value={nic}
        onChangeText={setNic}
        maxLength={12}
        editable={!isLoading}
      />

      <Text style={styles.label}>Emergency Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 0719876543"
        value={emergencyContactNumber}
        onChangeText={setEmergencyContactNumber}
        keyboardType="phone-pad"
        editable={!isLoading}
      />

      <Text style={styles.label}>Home Address</Text>
      <TextInput
        style={styles.input}
        placeholder="123 Main St..."
        value={address}
        onChangeText={setAddress}
        editable={!isLoading}
      />

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

      {/* 1. Blood Group */}
      <Text style={styles.label}>Blood Group</Text>
      <DropDownPicker
        open={bloodGroupOpen}
        value={bloodGroup}
        items={bloodGroupItems}
        setOpen={setBloodGroupOpen}
        setValue={setBloodGroup}
        setItems={setBloodGroupItems}
        placeholder="Select Blood Group"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading}
        zIndex={3000}
        zIndexInverse={1000}
        listMode="SCROLLVIEW"
      />

      {/* 🚀 NEW: Last Menstrual Period Picker */}
      <Text style={styles.label}>Last Menstrual Period (LMP) Date</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => !isLoading && setShowLmpPicker(true)}
      >
        <Text style={styles.dateText}>{lmp.toDateString()}</Text>
      </TouchableOpacity>
      {showLmpPicker && (
        <DateTimePicker
          value={lmp}
          mode="date"
          display="default"
          // Important: prevent selecting future dates for an LMP!
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowLmpPicker(false);
            if (selectedDate) setLmp(selectedDate);
          }}
        />
      )}

      {/* 2. Province */}
      <Text style={styles.label}>Province</Text>
      <DropDownPicker
        open={provinceOpen}
        value={province}
        items={provinceItems}
        setOpen={setProvinceOpen}
        setValue={setProvince}
        setItems={setProvinceItems}
        placeholder="Select Province"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading}
        zIndex={2000}
        zIndexInverse={2000}
        listMode="SCROLLVIEW"
        onChangeValue={(value) => {
          // --- NEW: Update District items when Province changes ---
          if (value) {
            setDistrictItems(districtMap[value] || []);
          } else {
            setDistrictItems([]);
          }
          setDistrict(null); // Reset the district selection
        }}
      />

      {/* 3. District */}
      <Text style={styles.label}>District</Text>
      <DropDownPicker
        open={districtOpen}
        value={district}
        items={districtItems}
        setOpen={setDistrictOpen}
        setValue={setDistrict}
        setItems={setDistrictItems}
        placeholder={province ? "Select District" : "Select a Province first"}
        style={[styles.dropdown, !province && { backgroundColor: "#f0f0f0" }]}
        dropDownContainerStyle={styles.dropdownContainer}
        disabled={isLoading || !province} // Disable until a province is chosen
        zIndex={1000}
        zIndexInverse={3000}
        listMode="SCROLLVIEW"
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
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
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 30 },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  dateInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    justifyContent: "center",
  },
  dateText: { color: "#495057", fontSize: 16 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    height: 50,
  },
  dropdownContainer: {
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    zIndex: 1,
  },
  buttonDisabled: { backgroundColor: "#ffb6c1" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 40,
    zIndex: 1,
  },
  loginText: { color: "#6c757d", fontSize: 15 },
  loginLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});
