import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  // This screen loads its own fresh data instead of relying on
  // navigation params, so it always has the correct user ID.
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    email: "N/A",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Error", "You are not logged in.");
          router.back();
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/phm/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setUserId(data?.user?.userId || null);
        setFormData({
          fullName: data?.fullName || "",
          contactNumber: data?.contactNumber || "",
          email: data?.email || "N/A",
        });
      } catch (error) {
        console.error("Edit Profile - failed to load current profile:", error);
        Alert.alert("Error", "Could not load your profile. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert(
        "Error",
        "Could not determine your user ID. Please close this screen and try again.",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const url = `${API_BASE_URL}/api/phm/profile/${userId}`;

      const payload = {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
      };

      const response = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        Alert.alert("Success", "Your profile has been updated!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Unknown error";

      console.error(
        "PHM Profile Update Error - status:",
        error?.response?.status,
      );
      console.error("PHM Profile Update Error - data:", error?.response?.data);
      console.error(
        "PHM Profile Update Error - url:",
        `${API_BASE_URL}/api/phm/profile/${userId}`,
      );

      Alert.alert("Error", `Could not update profile.\n\n${backendMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0056b3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>← Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.subHeader}>Update your personal details.</Text>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
            />

            <Text style={styles.inputLabel}>Contact Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.contactNumber}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                setFormData({ ...formData, contactNumber: numericText });
              }}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email}
              editable={false}
            />
            {formData.email === "N/A" && (
              <Text style={styles.helperText}>
                No email on record for this account.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
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
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, paddingHorizontal: 25 },
  backBtn: { marginTop: 20, marginBottom: 15 },
  backBtnText: { color: "#0056b3", fontWeight: "bold", fontSize: 16 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  subHeader: { fontSize: 14, color: "#64748B", marginBottom: 25 },
  formCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 20,
  },
  inputDisabled: {
    backgroundColor: "#E2E8F0",
    color: "#64748B",
  },
  helperText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: -14,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#0056b3",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#0056b3",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 40,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 17 },
});
