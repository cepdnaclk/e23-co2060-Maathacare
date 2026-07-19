import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { API_BASE_URL } from "../constants/apiConfig";

export default function App() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        // REMOVED: await AsyncStorage.clear(); (This was wiping your login data!)
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking vault:", error);
      }
    };

    checkUserLogin();
  }, []);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        phoneNumber: phoneNumber,
        password: password,
      });

      const { token, role } = response.data;

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userRole", role);
      const claims = jwtDecode<{ sub?: string; userId?: string }>(token);
      await AsyncStorage.setItem("userId", claims.userId || claims.sub || phoneNumber.trim());

      router.replace("/(tabs)");
    } catch (error) {
      const err = error as any;
      Alert.alert(
        "Login Failed",
        err.response?.data || "Check your connection.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <LanguageSwitcher color="#FF69B4" />

      <Text style={styles.title}>MaathaCare</Text>
      <Text style={styles.subtitle}>Pregnancy Support System</Text>

      <Text style={styles.label}>{t("phoneNumber")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderPhone")}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />

      <Text style={styles.label}>{t("password")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("placeholderPassword")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("login")}</Text>
      </TouchableOpacity>

      {/* FIXED: All text must be inside <Text> to prevent crashes */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          {t("alreadyHaveAccount")}
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            {" "}
            {t("signUp")}
          </Text>
        </Text>
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
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 5,
    marginLeft: 2,
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
  registerContainer: { marginTop: 20 },
  registerText: { color: "#6c757d", fontSize: 15 },
  registerLink: { color: "#FF69B4", fontSize: 15, fontWeight: "bold" },
});
