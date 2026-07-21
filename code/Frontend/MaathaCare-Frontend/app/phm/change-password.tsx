import { API_BASE_URL } from "@/constants/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff, Key, Lock, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// --- Consistent Premium Palette ---
const COLORS = {
  primary: "#0062FF",
  bg: "#F5F8FE",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
};

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdatePassword = async () => {
  if (newPassword !== confirmPassword) {
    Alert.alert("Error", "New passwords do not match.");
    return;
  }

  setIsLoading(true);
  try {
    // 1. Retrieve stored credentials
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId"); 
    
    if (!token || !userId) {
      Alert.alert("Error", "Session expired. Please log in again.");
      return;
    }

    // 2. Call the backend with Authorization Header
    await axios.put(`${API_BASE_URL}/api/phm/change-password/${userId}`, {
      oldPassword: oldPassword,
      newPassword: newPassword,
    }, {
      headers: { Authorization: `Bearer ${token}` } // Critical for 403 resolution
    });

    Alert.alert("Success", "Password updated successfully.");
    router.back();
    
  } catch (error: any) {
    // 3. Robust Logging (Avoids cyclical structure error)
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data));
      Alert.alert("Error " + error.response.status, 
        typeof error.response.data === 'string' ? error.response.data : "Request failed.");
    } else {
      Alert.alert("Update Failed", "Check your internet connection.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Sleek Custom Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Icon Header */}
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <ShieldCheck color={COLORS.primary} size={32} />
          </View>
          <Text style={styles.headerTitle}>Update Password</Text>
          <Text style={styles.subText}>
            Secure your account with a strong, new credential.
          </Text>
        </View>

        {/* Card Input Area */}
        <View style={styles.formCard}>
          <InputField
            label="Current Password"
            icon={Lock}
            value={oldPassword}
            onChange={setOldPassword}
            isPassword={true}
            show={showOld}
            setShow={setShowOld}
          />
          <View style={styles.divider} />
          <InputField
            label="New Password"
            icon={Key}
            value={newPassword}
            onChange={setNewPassword}
            isPassword={true}
            show={showNew}
            setShow={setShowNew}
          />
          <InputField
            label="Confirm New Password"
            icon={Key}
            value={confirmPassword}
            onChange={setConfirmPassword}
            isPassword={true}
            show={showConfirm}
            setShow={setShowConfirm}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Update Credentials</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusable Input Component to keep code clean
const InputField = ({ label, icon: Icon, isPassword, show, setShow, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Icon color={COLORS.textMuted} size={20} style={{ marginRight: 12 }} />
      <TextInput
        style={styles.input}
        placeholder={`Enter ${label.toLowerCase()}`}
        secureTextEntry={isPassword && !show}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShow(!show)}>
          {show ? (
            <EyeOff color={COLORS.textMuted} size={20} />
          ) : (
            <Eye color={COLORS.textMuted} size={20} />
          )}
        </TouchableOpacity>
      )}
    </View>
  </View>
);



const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: COLORS.surface,
  },
  navBack: { width: 40, height: 40, justifyContent: "center" },
  navTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 24 },
  iconHeader: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
