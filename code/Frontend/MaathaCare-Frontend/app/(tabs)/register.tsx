import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Register() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    // 1. Check if any fields are empty
    if (!phoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      console.log("Sending registration request to backend...");

      // 3. Send the data to your Spring Boot Register endpoint
      const response = await axios.post(
        "http://172.20.10.4:8080/api/users/register",
        {
          phoneNumber: phoneNumber,
          password: password,
          role: "MOTHER", // Sending a default role for the MaathaCare app!
        },
      );

      // 4. Handle Success
      console.log("Registration Success:", response.data);

      Alert.alert(
        "Account Created!",
        "Welcome to MaathaCare. Please log in with your new account.",
        [
          // This creates an "OK" button on the alert that automatically jumps back to the Login screen!
          { text: "OK", onPress: () => router.back() },
        ],
      );
    } catch (error) {
      // 5. If the server is off, or if the phone number already exists in the database
      console.error("Registration Error:", error);
      Alert.alert(
        "Registration Failed",
        "Could not create account. This phone number might already be registered.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join MaathaCare today</Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 0771234567"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Type password again"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 40 },
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF69B4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginContainer: { flexDirection: "row", marginTop: 20 },
  loginText: { color: "#6c757d", fontSize: 15 },
  loginLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});
