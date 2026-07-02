import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import {
  CreditCard,
  Droplets,
  Home,
  LogOut,
  MapPin,
  Phone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://10.230.231.226:8080";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProfile(response.data);
    } catch (error: any) {
      console.error("Profile Fetch Error:", error);
      if (error.response?.status === 403) {
        Alert.alert("Security Error", "Your session has expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logout sequence started...");

      // 🌟 FIX: Remove keys individually to bypass the iOS folder deletion bug!
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");

      // If you are saving a role during login, remove it here too:
      // await AsyncStorage.removeItem('userRole');

      console.log("Storage cleared successfully.");

      // Go back to login
      router.replace("/mother-login");
    } catch (error) {
      console.error("Logout error details:", error);
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* --- CUSTOM IMAGE AVATAR SECTION --- */}
        <View style={styles.headerSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Image
                source={require("../../assets/images/image_d73a98.jpeg")}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </View>
          <Text style={styles.profileName}>
            {profile?.fullName || "Mother Name"}
          </Text>
          <Text style={styles.profileRole}>Soon-to-be Mommy ✨</Text>
        </View>

        {/* --- INFORMATION CARDS --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>

          <DetailRow
            icon={<CreditCard size={20} color="#db2777" />}
            label="NIC Number"
            value={profile?.nic}
          />
          <DetailRow
            icon={<Droplets size={20} color="#db2777" />}
            label="Blood Group"
            value={profile?.bloodGroup}
          />
          <DetailRow
            icon={<Phone size={20} color="#db2777" />}
            label="Emergency Contact"
            value={profile?.emergencyContactNumber}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Information</Text>
          <DetailRow
            icon={<MapPin size={20} color="#db2777" />}
            label="District & Province"
            value={`${profile?.district}, ${profile?.province}`}
          />
          <DetailRow
            icon={<Home size={20} color="#db2777" />}
            label="Full Address"
            value={profile?.address}
          />
        </View>

        {/* --- SIGN OUT --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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

  headerSection: { alignItems: "center", marginTop: 40, marginBottom: 30 },
  avatarWrapper: {
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
});
