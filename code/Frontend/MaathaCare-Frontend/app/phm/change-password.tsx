import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ChevronLeft, Key, Lock, ShieldCheck } from "lucide-react-native";
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
  View,
} from "react-native";
import { API_BASE_URL } from "../../constants/apiConfig";

const Colors = {
  primary: "#0F766E",
  primaryLight: "#CCFBF1", // Add this line
  secondary: "#334155",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  textMuted: "#64748B",
};

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Your new passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Weak Password",
        "New password must be at least 6 characters.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const staffId = (await AsyncStorage.getItem("userId")) || "";
      const token = await AsyncStorage.getItem("userToken");
      const url = `${API_BASE_URL}/api/users/staff/${staffId}/change-password`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        Alert.alert(
          "Security Updated",
          "Your password has been changed successfully.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to change password. Please check your old password.",
        );
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <ChevronLeft color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <ShieldCheck color={Colors.primary} size={48} />
          </View>
          <Text style={styles.headerTitle}>Update Password</Text>
          <Text style={styles.subText}>
            Ensure your account remains secure by using a strong password.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <Lock
                color={Colors.textMuted}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Key
                color={Colors.textMuted}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Key
                color={Colors.textMuted}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Type new password again"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
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

const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navBack: { padding: 4 },
  navTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },

  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24, paddingTop: 30 },

  iconHeader: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  formCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, fontSize: 16, color: Colors.text },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },

  saveButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
