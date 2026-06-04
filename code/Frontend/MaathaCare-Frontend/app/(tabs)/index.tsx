import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Activity, Bell, Calendar, Footprints } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Device from 'expo-device'; 
import * as Notifications from 'expo-notifications';
import { jwtDecode } from "jwt-decode";

// 🌟 NEW: Tells the OS to show the notification banner even if the app is open!
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width } = Dimensions.get("window");

export default function HomeTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ weeks: 0, days: 0, totalDays: 0 });
  const [userName, setUserName] = useState("");
  const router = useRouter();

  // 🌟 Added state to hold the Midwife info
  const [phmInfo, setPhmInfo] = useState({ name: "Loading...", id: "" });

  // 🌟 PUSH NOTIFICATION TRIGGER 
  useFocusEffect(
    useCallback(() => {
      const registerAndSyncPushToken = async () => {
        if (!Device.isDevice) {
          console.log("Must use physical device for Push Notifications");
          return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }

        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({
              projectId: "a06d1659-753c-4fd0-a631-c20c42877558" 
          });
          const token = tokenData.data;
          console.log("🌟 Generated Push Token:", token);

          const userToken = await AsyncStorage.getItem("userToken");
          if (!userToken) return;

          const decodedToken = jwtDecode<{ userId: string }>(userToken);
          const realUserId = decodedToken.userId;
          const ip = "10.157.201.226"; // Ensure this matches your current IP!

          await axios.put(
              `http://${ip}:8080/api/mothers/${realUserId}/push-token`,
              { pushToken: token },
              { headers: { Authorization: `Bearer ${userToken}` } }
          );
          console.log("✅ Token synced successfully to backend!");

        } catch (error) {
          console.error("Error generating or syncing token:", error);
        }
      };

      registerAndSyncPushToken();
    }, [])
  );

  // 🌟 FETCH DASHBOARD DATA
  useFocusEffect(
    useCallback(() => {
      const fetchPregnancyData = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          const ip = "10.157.201.226"; // Ensure this matches your current IP!

          if (!token || !userId) {
            setLoading(false);
            return;
          }

          const response = await axios.get(
            `http://${ip}:8080/api/mothers/profile/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = response.data;
          setUserName(data.fullName ? data.fullName.split(" ")[0] : "Mother");

          // 🌟 Capture the PHM data sent from the backend
          setPhmInfo({
            name: data.phmName || "Pending",
            id: data.phmId && data.phmId !== "Pending" ? data.phmId : "",
          });

          if (data.lastMenstrualPeriod) {
            const lmp = new Date(data.lastMenstrualPeriod);
            const today = new Date();
            const diffInMs = today.getTime() - lmp.getTime();
            const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (totalDays >= 0) {
              setStats({
                weeks: Math.floor(totalDays / 7),
                days: totalDays % 7,
                totalDays: totalDays,
              });
            }
          }
        } catch (error) {
          console.error("Dashboard error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPregnancyData();
    }, [])
  );

  // Calculate progress percentage (Pregnancy is ~280 days)
  const progress = Math.min(stats.totalDays / 280, 1);

  if (loading)
    return <ActivityIndicator style={styles.center} color="#ED70A1" />;

  // Dynamic baby Size
  const getBabySizeInfo = (week: number) => {
    if (week <= 4) return { size: "a Poppy Seed", icon: "🌱" };
    if (week <= 7) return { size: "a Blueberry", icon: "🫐" };
    if (week <= 10) return { size: "a Strawberry", icon: "🍓" };
    if (week <= 13) return { size: "a Lemon", icon: "🍋" };
    if (week <= 17) return { size: "an Onion", icon: "🧅" };
    if (week <= 21) return { size: "a Carrot", icon: "🥕" };
    if (week <= 25) return { size: "an Eggplant", icon: "🍆" };
    if (week <= 30) return { size: "a Cucumber", icon: "🥒" };
    if (week <= 35) return { size: "a Pineapple", icon: "🍍" };
    return { size: "a Watermelon", icon: "🍉" };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi, {userName}</Text>
          <Text style={styles.subText}>Your gentle journey</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={["#FFE2F1", "#E3F1FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Bell size={20} color="#8A6FA8" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 🌟 ASSIGNED MIDWIFE BADGE */}
      <View style={styles.phmCard}>
        <View style={styles.phmIconWrapper}>
          <Text style={{ fontSize: 18 }}>👩‍⚕️</Text>
        </View>
        <View>
          <Text style={styles.phmLabel}>Assigned Midwife</Text>
          <Text style={styles.phmName}>
            {phmInfo.name === "Pending"
              ? "Assignment Pending"
              : `${phmInfo.name} (${phmInfo.id})`}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#FFE7F3", "#E8F3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>Today</Text>
        </View>

        <View style={styles.babyBadge}>
          <Text style={styles.babyIcon}>
            {getBabySizeInfo(stats.weeks).icon}
          </Text>
        </View>

        <Text style={styles.softLabel}>Baby size</Text>
        <Text style={styles.fruitText}>
          {getBabySizeInfo(stats.weeks).size}
        </Text>

        <View style={styles.weekRow}>
          <View style={styles.timeCard}>
            <Text style={styles.bigNumber}>{stats.weeks}</Text>
            <Text style={styles.unitText}>Weeks</Text>
          </View>

          <View style={styles.timeCard}>
            <Text style={styles.bigNumber}>{stats.days}</Text>
            <Text style={styles.unitText}>Days</Text>
          </View>
        </View>

        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={["#F59AC2", "#9ECDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <Text style={styles.progressLabel}>
          {Math.floor(progress * 100)}% complete
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        <ActionCard
          icon={<Activity color="#D962A0" size={23} />}
          label="Symptoms"
          colors={["#FFE6F2", "#FFF1F7"]}
          onPress={() => router.push("/log-symptoms")}
        />

        <ActionCard
          icon={<Calendar color="#5D9CE6" size={23} />}
          label="Clinic"
          colors={["#E4F0FF", "#F1F7FF"]}
          onPress={() => router.push("/upcoming-clinic")}
        />

        <ActionCard
          icon={<Footprints color="#8C7CF3" size={23} />}
          label="Kicks"
          colors={["#F3E7FF", "#E8F2FF"]}
          fullWidth
          onPress={() => router.push("/kick-counter")}
        />
      </View>
    </ScrollView>
  );
}

function ActionCard({
  icon,
  label,
  colors,
  fullWidth,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  colors: string[];
  fullWidth?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.actionWrapper, fullWidth && styles.fullWidth]}
    >
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionCard}
      >
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9FD",
  },
  content: {
    padding: 22,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 58,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#665A7A",
    letterSpacing: -0.4,
  },
  subText: {
    fontSize: 14,
    color: "#988FA8",
    marginTop: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D8B0D2",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  phmCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0E5F5",
  },
  phmIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  phmLabel: {
    fontSize: 12,
    color: "#988FA8",
    fontWeight: "600",
  },
  phmName: {
    fontSize: 15,
    color: "#665A7A",
    fontWeight: "800",
    marginTop: 2,
  },
  statsCard: {
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    shadowColor: "#CDB6E5",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  topBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  topBadgeText: {
    fontSize: 12,
    color: "#876F99",
    fontWeight: "700",
  },
  babyBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.58)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  babyIcon: {
    fontSize: 38,
  },
  softLabel: {
    fontSize: 12,
    color: "#8F84A3",
    marginBottom: 4,
  },
  fruitText: {
    fontSize: 17,
    color: "#61586F",
    fontWeight: "700",
    marginBottom: 18,
  },
  weekRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  timeCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: "800",
    color: "#625A75",
  },
  unitText: {
    fontSize: 13,
    color: "#9188A4",
    fontWeight: "600",
    marginTop: 2,
  },
  progressBarBackground: {
    width: "100%",
    height: 11,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressLabel: {
    fontSize: 12,
    color: "#8E84A2",
    marginTop: 10,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#665A7A",
    marginTop: 28,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  fullWidth: {
    width: "100%",
  },
  actionCard: {
    minHeight: 112,
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#D9C6EB",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.72)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#665B77",
  },
});