import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

export default function RegisterStaff() {
  const [form, setForm] = useState({
    nic: "",
    staffId: "",
    password: "",
    fullName: "",
    mohArea: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://172.20.10.2:8080/api/users/staff/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (response.ok) {
        Alert.alert("Success", "PHM Officer registered in the system!");
        router.back();
      } else {
        const errorMsg = await response.text();
        Alert.alert("Registration Failed", errorMsg);
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register PHM Officer</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Nilanthi Perera"
        onChangeText={(text) => setForm({ ...form, fullName: text })}
      />

      <Text style={styles.label}>NIC Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 199012345678V"
        onChangeText={(text) => setForm({ ...form, nic: text })}
      />

      <Text style={styles.label}>Assign Staff ID</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. PHM-COL-01"
        onChangeText={(text) => setForm({ ...form, staffId: text })}
      />

      <Text style={styles.label}>MOH Area</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Colombo-05"
        onChangeText={(text) => setForm({ ...form, mohArea: text })}
      />

      <Text style={styles.label}>Default Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="********"
        onChangeText={(text) => setForm({ ...form, password: text })}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Saving..." : "Register Officer"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
