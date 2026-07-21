import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Camera,
  Check,
  CreditCard,
  Droplets,
  Edit2,
  Globe,
  Heart,
  Home,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../constants/apiConfig";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "si", label: "සිංහල" },
  { code: "ta", label: "தமிழ்" },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "en",
  );
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    loadLanguagePreference();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/mothers/profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setProfile(response.data);

      // Fetch saved profile picture URL from the database
      if (response.data.profilePictureUrl) {
        setProfileImage(`${response.data.profilePictureUrl}?v=${Date.now()}`);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert("Security Error", "Your session has expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLanguagePreference = async () => {
    try {
      const storedLang = await AsyncStorage.getItem("appLanguage");
      if (storedLang) {
        setSelectedLanguage(storedLang);
        i18n.changeLanguage(storedLang);
      }
    } catch (error) {
      console.error("Failed to load language preference:", error);
    }
  };

  const handleLanguageChange = async (code: string) => {
    try {
      setSelectedLanguage(code);
      await AsyncStorage.setItem("appLanguage", code);
      i18n.changeLanguage(code);
      setTimeout(() => setShowLanguages(false), 300);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  // 🌟 BACKEND API IMAGE UPLOAD LOGIC
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to update your photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Show the selected image while the upload is in progress.
        setProfileImage(imageUri);

        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");

        if (!userId || !token) return;

        // Package the image for your Spring Boot backend
        const formData = new FormData();
        formData.append("file", {
          uri:
            Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
          name: `profile_${userId}_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);

        // Send to your backend API
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/mothers/upload-profile-picture/${userId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Use the saved Supabase URL (with a cache buster for a replacement upload).
        setProfileImage(`${uploadResponse.data.profilePictureUrl}?v=${Date.now()}`);

        Alert.alert("Success", "Profile photo updated successfully!");
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      Alert.alert(
        "Upload Failed",
        "Could not save the profile picture to the server.",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      router.replace("/mother-login");
    } catch (error) {
      Alert.alert("Logout Failed", "Please restart the app.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#db2777" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={styles.settingsIconButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Settings size={22} color="#db2777" />
      </TouchableOpacity>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{ fontSize: 40, color: "white", fontWeight: "bold" }}
                >
                  {profile?.fullName?.charAt(0) || "M"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Camera size={18} color="#db2777" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {profile?.fullName || "Mother Name"}
          </Text>
          <Text style={styles.profileRole}>{t("soonToBeMommy")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("personalDetails")}</Text>
          <DetailRow
            icon={<CreditCard size={20} color="#db2777" />}
            label={t("nicNumber")}
            value={profile?.nic}
          />
          <DetailRow
            icon={<Droplets size={20} color="#db2777" />}
            label={t("bloodGroup")}
            value={profile?.bloodGroup}
          />
          <DetailRow
            icon={<Phone size={20} color="#db2777" />}
            label={t("emergencyContact")}
            value={profile?.emergencyContactNumber}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("locationInfo")}</Text>
          <DetailRow
            icon={<MapPin size={20} color="#db2777" />}
            label={t("districtAndProvince")}
            value={`${profile?.district}, ${profile?.province}`}
          />
          <DetailRow
            icon={<MapPin size={20} color="#db2777" />}
            label={t("mohArea")}
            value={profile?.mohArea}
          />
          <DetailRow
            icon={<MapPin size={20} color="#db2777" />}
            label={t("gnDivision")}
            value={profile?.gnDivision}
          />
          <DetailRow
            icon={<Home size={20} color="#db2777" />}
            label={t("fullAddress")}
            value={profile?.address}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("emergencyContactInfo")}</Text>
          <DetailRow
            icon={<Users size={20} color="#db2777" />}
            label={t("contactPerson")}
            value={profile?.emergencyContactName}
          />
          <DetailRow
            icon={<Heart size={20} color="#db2777" />}
            label={t("relationshipToMother")}
            value={profile?.emergencyContactRelationship}
          />
          <DetailRow
            icon={<Phone size={20} color="#db2777" />}
            label={t("phoneNumber")}
            value={profile?.emergencyContactNumber}
          />
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/edit-mother-profile",
              params: {
                fullName: profile?.fullName,
                emergencyContactName: profile?.emergencyContactName,
                emergencyContactRelationship:
                  profile?.emergencyContactRelationship,
                emergencyContactNumber: profile?.emergencyContactNumber,
                address: profile?.address,
                district: profile?.district,
                province: profile?.province,
                mohArea: profile?.mohArea,
                gnDivision: profile?.gnDivision,
              },
            })
          }
        >
          <Edit2 size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.editText}>{t("editProfile")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>{t("signOut")}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("settings")}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSettingsVisible(false);
                  setShowLanguages(false);
                }}
              >
                <X size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>{t("preferences")}</Text>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowLanguages(!showLanguages)}
            >
              <View style={styles.settingsRowLeft}>
                <Globe size={18} color="#db2777" />
                <Text style={styles.settingsRowText}>{t("language")}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.currentLangText}>
                  {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}
                </Text>
                <Text style={styles.chevron}>{showLanguages ? "˅" : "›"}</Text>
              </View>
            </TouchableOpacity>

            {showLanguages && (
              <View style={styles.expandedLanguageContainer}>
                {LANGUAGES.map((lang) => {
                  const active = selectedLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langListItem,
                        active && styles.langListItemActive,
                      ]}
                      onPress={() => handleLanguageChange(lang.code)}
                    >
                      <Text
                        style={[
                          styles.langListText,
                          active && styles.langListTextActive,
                        ]}
                      >
                        {lang.label}
                      </Text>
                      {active && <Check size={16} color="#db2777" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => {
                setSettingsVisible(false);
                setShowLanguages(false);
                router.push("/change-mother-password");
              }}
            >
              <View style={styles.settingsRowLeft}>
                <Lock size={18} color="#db2777" />
                <Text style={styles.settingsRowText}>
                  {t("changePassword")}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.rowContainer}>
    <View style={styles.iconCircle}>{icon}</View>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "Not provided"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff5f8" },
  container: { flex: 1, paddingHorizontal: 25 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff5f8",
  },
  settingsIconButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    right: 20,
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerSection: { alignItems: "center", marginTop: 55, marginBottom: 30 },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#db2777",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#db2777",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "white",
  },
  avatar: { width: "100%", height: "100%" },
  cameraBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "white",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 15,
  },
  profileRole: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
    marginTop: 2,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#db2777",
    marginBottom: 18,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 42,
    height: 42,
    backgroundColor: "#fff1f2",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  rowValue: { fontSize: 16, color: "#374151", fontWeight: "600", marginTop: 2 },
  logoutButton: {
    backgroundColor: "#f43f5e",
    flexDirection: "row",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#f43f5e",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 17 },
  editButton: {
    backgroundColor: "#db2777",
    flexDirection: "row",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#db2777",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  editText: { color: "white", fontWeight: "bold", fontSize: 17 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#db2777",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  settingsRowLeft: { flexDirection: "row", alignItems: "center" },
  settingsRowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 12,
  },
  chevron: { fontSize: 22, color: "#d1d5db" },
  currentLangText: {
    fontSize: 14,
    color: "#9ca3af",
    marginRight: 8,
    fontWeight: "600",
  },
  expandedLanguageContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  langListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  langListItemActive: {
    backgroundColor: "#fff1f2",
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  langListText: { fontSize: 15, color: "#4b5563", fontWeight: "500" },
  langListTextActive: { color: "#db2777", fontWeight: "700" },
});
