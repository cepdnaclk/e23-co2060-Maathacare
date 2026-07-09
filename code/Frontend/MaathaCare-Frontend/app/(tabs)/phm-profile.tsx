import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
// import { supabase } from '../../constants/supabase'; // 🌟 UNCOMMENT WHEN SUPABASE IS READY

import {
  Bell,
  Briefcase,
  Camera,
  ChevronRight,
  Globe,
  Key,
  LogOut,
  Settings,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../constants/apiConfig";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#EFF6FF",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  textHeader: "#0F172A",
  textMuted: "#64748B",
  iconBg: "#F1F5F9",
  accent: "#E2E8F0",
  border: "#E2E8F0",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#EF4444",
};

const ExpandableListItem = ({
  icon: Icon,
  title,
  isExpanded,
  onPress,
  children,
}: any) => (
  <View style={styles.expandableWrapper}>
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.iconBox}>
          <Icon color={THEME.primary} size={18} />
        </View>
        <Text style={styles.listItemTitle}>{title}</Text>
      </View>
      <View style={styles.listItemRight}>
        <ChevronRight
          color={THEME.textMuted}
          size={18}
          style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }}
        />
      </View>
    </TouchableOpacity>
    {isExpanded && <View style={styles.expandedContentArea}>{children}</View>}
  </View>
);

export default function PHMProfileScreen() {
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { t, i18n } = useTranslation();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const [selectedLang, setSelectedLang] = useState(
    i18n.language === "si"
      ? "සිංහල"
      : i18n.language === "ta"
        ? "தமிழ்"
        : "English",
  );

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/phm/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPhmInfo(data);
          if (data.profilePictureUrl) setProfileImage(data.profilePictureUrl);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant gallery permissions to change your picture.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);

      try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: "base64",
        });
        const ext = imageUri.substring(imageUri.lastIndexOf(".") + 1);
        const fileName = `phm_${phmInfo?.id || "profile"}_${Date.now()}.${ext}`;

        // 🌟 UNCOMMENT THIS BLOCK WHEN SUPABASE IS IMPORTED 🌟
        /*
        const { error } = await supabase.storage
          .from('avatars') 
          .upload(fileName, decode(base64), { contentType: `image/${ext}` });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const token = await AsyncStorage.getItem("userToken");
        await fetch(`${API_BASE_URL}/api/phm/update-profile-picture`, {
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ profilePictureUrl: publicUrl }),
        });
        */

        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert(
          "Upload Failed",
          "Could not save the profile picture to the server.",
        );
      }
    }
  };

  const SettingsModal = () => (
    <Modal
      visible={settingsModalVisible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("profileSettings")}</Text>
          <TouchableOpacity
            style={styles.settingsOptionBtn}
            onPress={() => {
              setSettingsModalVisible(false);
              router.push("/phm/change-password" as any);
            }}
          >
            <View style={styles.iconBox}>
              <Key color={THEME.primary} size={18} />
            </View>
            <Text style={styles.settingsOptionText}>Change Password</Text>
            <ChevronRight color={THEME.textMuted} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modalBtn,
              { backgroundColor: THEME.iconBg, marginTop: 16 },
            ]}
            onPress={() => setSettingsModalVisible(false)}
          >
            <Text
              style={{
                color: THEME.textHeader,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LanguageModal = () => {
    const languageOptions = [
      { label: "English", code: "en" },
      { label: "සිංහල", code: "si" },
      { label: "தமிழ்", code: "ta" },
    ];
    return (
      <Modal visible={langModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langOptionBtn}
                onPress={() => {
                  i18n.changeLanguage(lang.code);
                  setSelectedLang(lang.label);
                  setLangModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    selectedLang === lang.label && {
                      color: THEME.primary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {lang.label}
                </Text>
                {selectedLang === lang.label && (
                  <Text
                    style={{
                      color: THEME.primary,
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: THEME.iconBg, marginTop: 16 },
              ]}
              onPress={() => setLangModalVisible(false)}
            >
              <Text
                style={{
                  color: THEME.textHeader,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topHeaderRow}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>{t("profileOverview")}</Text>
          <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
            <Settings color={THEME.textHeader} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInner}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {phmInfo?.fullName?.charAt(0) || "S"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickImage}
            >
              <Camera color={THEME.textMuted} size={14} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{phmInfo?.fullName || "Sahana"}</Text>
          <Text style={styles.role}>Public Health Midwife</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>{t("editProfile")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t("myInformation")}</Text>
        <View style={styles.listCard}>
          <ExpandableListItem
            icon={User}
            title={t("personalDetails")}
            isExpanded={expandedSection === "personal"}
            onPress={() => toggleSection("personal")}
          >
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("fullName")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.fullName || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.phoneNumber || "Not Set"}
              </Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{t("emailAddress")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.email || "No Email"}
              </Text>
            </View>
          </ExpandableListItem>
          <View style={styles.listDivider} />
          <ExpandableListItem
            icon={Briefcase}
            title={t("professionalDetails")}
            isExpanded={expandedSection === "professional"}
            onPress={() => toggleSection("professional")}
          >
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("province")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.province || "Central Province"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("district")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.district || "Kandy"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("mohArea")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.mohArea || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("gnDivision")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.gnDivision || "N/A"}
              </Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>{t("phmId")}</Text>
              <Text style={styles.detailValue}>
                {phmInfo?.staffId || phmInfo?.registrationNumber || "Pending"}
              </Text>
            </View>
          </ExpandableListItem>
        </View>

        <Text style={styles.sectionTitle}>{t("systemPreferences")}</Text>
        <View style={styles.listCard}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.iconBox}>
                <Bell color={THEME.primary} size={18} />
              </View>
              <Text style={styles.listItemTitle}>{t("notifications")}</Text>
            </View>
            <View style={styles.listItemRight}>
              <ChevronRight color={THEME.textMuted} size={18} />
            </View>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setLangModalVisible(true)}
          >
            <View style={styles.listItemLeft}>
              <View style={styles.iconBox}>
                <Globe color={THEME.primary} size={18} />
              </View>
              <Text style={styles.listItemTitle}>{t("language")}</Text>
            </View>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemValue}>{selectedLang}</Text>
              <ChevronRight color={THEME.textMuted} size={18} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace("/");
          }}
        >
          <LogOut
            color={THEME.dangerText}
            size={18}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>{t("secureLogout")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <SettingsModal />
      <LanguageModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.bg,
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 30,
  },
  headerTitle: {
    color: THEME.textHeader,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileSection: { alignItems: "center", marginBottom: 24 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  profileImage: { width: "100%", height: "100%", borderRadius: 24 },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: THEME.primaryLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: THEME.primary },
  cameraBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 4,
  },
  role: { fontSize: 14, color: THEME.textMuted, fontWeight: "500" },
  editProfileBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileText: { color: "white", fontSize: 14, fontWeight: "700" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: 10,
  },
  listCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  expandableWrapper: { overflow: "hidden" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listItemLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  listItemTitle: { fontSize: 15, fontWeight: "600", color: THEME.textHeader },
  listItemRight: { flexDirection: "row", alignItems: "center" },
  listItemValue: {
    fontSize: 14,
    color: THEME.textMuted,
    marginRight: 8,
    fontWeight: "500",
  },
  listDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginLeft: 66,
    marginRight: 16,
  },
  expandedContentArea: {
    backgroundColor: THEME.bg,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  detailLabel: { fontSize: 13, color: THEME.textMuted, fontWeight: "500" },
  detailValue: { fontSize: 14, color: THEME.textHeader, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: THEME.dangerBorder,
    backgroundColor: THEME.dangerBg,
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  logoutText: { color: THEME.dangerText, fontWeight: "700", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 8,
  },
  modalSub: {
    color: THEME.textMuted,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  settingsOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.iconBg,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  settingsOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textHeader,
    marginLeft: 14,
  },
  langOptionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  langOptionText: { fontSize: 15, color: THEME.textHeader, fontWeight: "500" },
  modalBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
});
