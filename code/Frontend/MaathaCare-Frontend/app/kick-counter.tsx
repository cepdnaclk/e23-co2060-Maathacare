import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  Footprints,
  Info,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Save,
  Timer,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import { API_BASE_URL } from "../constants/apiConfig";

const screenWidth = Dimensions.get("window").width;

interface KickRecord {
  id: number;
  kickCount: number;
  timestamp: string;
  date?: string | null;
}

const TOKEN_STORAGE_KEYS = [
  "userToken",
  "token",
  "authToken",
  "jwtToken",
] as const;

const extractToken = (storedValue: string): string => {
  let value: unknown = storedValue.trim();

  try {
    value = JSON.parse(storedValue);
  } catch {
    // The stored value is already a plain token.
  }

  if (typeof value === "object" && value !== null) {
    const session = value as Record<string, unknown>;
    value =
      session.token ??
      session.accessToken ??
      session.jwt ??
      session.userToken ??
      "";
  }

  let token = typeof value === "string" ? value.trim() : "";

  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }

  return token;
};

const getMotherSession = async (): Promise<{
  token: string;
  userId: string | null;
}> => {
  let token = "";

  for (const key of TOKEN_STORAGE_KEYS) {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) continue;

    token = extractToken(stored);
    if (token) break;
  }

  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  const userId = await AsyncStorage.getItem("userId");
  return { token, userId };
};

const authorizationHeaders = (token: string) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const describeAxiosError = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Unknown request error.";
  }

  const status = error.response?.status;
  const responseData = error.response?.data;

  if (status === 401 || status === 403) {
    return "Your mother session is missing, expired, or has the wrong role. Please sign out and sign in again using a mother account.";
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData
  ) {
    return String((responseData as { message?: unknown }).message);
  }

  return status
    ? `The server returned HTTP ${status}.`
    : "The server could not be reached.";
};

const normaliseKickRecord = (value: unknown): KickRecord | null => {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const id = Number(record.id);
  const kickCount = Number(record.kickCount ?? record.count);
  const timestamp = String(record.timestamp ?? record.date ?? "");

  if (!Number.isFinite(id) || !Number.isFinite(kickCount) || !timestamp) {
    return null;
  }

  return {
    id,
    kickCount,
    timestamp,
    date: record.date == null ? null : String(record.date),
  };
};

export default function KickCounterScreen() {
  const [count, setCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<KickRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);

  // 🌟 Variables to store and evaluate the calculated weeks
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const isTrackingAllowed = currentWeek >= 26;

  // Timer States
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfileAndKicks = async () => {
    setLoadingData(true);

    try {
      const { token, userId } = await getMotherSession();
      const headers = authorizationHeaders(token);

      if (userId) {
        try {
          const profileRes = await axios.get(
            `${API_BASE_URL}/api/mothers/profile/${encodeURIComponent(userId)}`,
            { headers },
          );

          if (profileRes.data?.lastMenstrualPeriod) {
            const lmpDate = new Date(profileRes.data.lastMenstrualPeriod);
            const today = new Date();

            if (!Number.isNaN(lmpDate.getTime())) {
              const diffTime = today.getTime() - lmpDate.getTime();
              const diffDays = Math.max(
                0,
                Math.floor(diffTime / (1000 * 60 * 60 * 24)),
              );
              setCurrentWeek(Math.floor(diffDays / 7));
            } else {
              setCurrentWeek(0);
            }
          } else {
            setCurrentWeek(0);
          }
        } catch (profileError) {
          console.error("Mother profile request failed:", {
            message: describeAxiosError(profileError),
            status: axios.isAxiosError(profileError)
              ? profileError.response?.status
              : undefined,
            data: axios.isAxiosError(profileError)
              ? profileError.response?.data
              : undefined,
          });
          setCurrentWeek(0);
        }
      } else {
        console.warn(
          "No userId was found in AsyncStorage. Kick history can still load, but the pregnancy-week lock cannot be calculated.",
        );
        setCurrentWeek(0);
      }

      const historyRes = await axios.get(
        `${API_BASE_URL}/api/mothers/kicks/history`,
        { headers },
      );

      const records = Array.isArray(historyRes.data)
        ? historyRes.data
            .map(normaliseKickRecord)
            .filter((item): item is KickRecord => item !== null)
        : [];

      setHistory(records.slice(-5));

      const todayStr = new Date().toLocaleDateString();
      const alreadySaved = records.some(
        (item) => new Date(item.timestamp).toLocaleDateString() === todayStr,
      );

      setHasSavedToday(alreadySaved);

      if (alreadySaved) {
        setIsTimerActive(false);
      }
    } catch (error) {
      const message = describeAxiosError(error);

      console.error("Failed to load kick history:", {
        message,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        data: axios.isAxiosError(error) ? error.response?.data : undefined,
      });

      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        Alert.alert(
          "Session required",
          "Please sign in again using your mother account.",
        );
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Countdown Effect
  useEffect(() => {
    if (!isTrackingAllowed) return;

    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert(
        "Time's Up",
        "The 1-hour session has ended. Please save your recorded kick count.",
      );
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerActive, timeLeft, isTrackingAllowed]);

  useEffect(() => {
    const loadPersistedCount = async () => {
      try {
        const savedCount = await AsyncStorage.getItem("daily_kick_count");
        if (savedCount !== null) {
          setCount(parseInt(savedCount));
        }
      } catch (e) {
        console.error("Failed to load kicks from storage", e);
      }
    };

    loadPersistedCount();
    fetchProfileAndKicks();
  }, []);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const toggleTimer = () => {
    if (hasSavedToday) return;
    if (timeLeft === 0) {
      Alert.alert(
        "Session Expired",
        "Please reset the session to start tracking a new hour.",
      );
      return;
    }
    setIsTimerActive(!isTimerActive);
  };

  const handleIncrement = async () => {
    if (hasSavedToday) {
      Alert.alert(
        "Daily Limit Reached",
        "You have already recorded your session for today.",
      );
      return;
    }
    if (!isTimerActive && timeLeft > 0) {
      Alert.alert(
        "Timer Paused",
        "Please start or resume your session timer to accurately track movements.",
      );
      return;
    }
    if (timeLeft === 0) {
      Alert.alert("Session Ended", "Time has expired. Please save your entry.");
      return;
    }

    const newCount = count + 1;
    setCount(newCount);
    try {
      await AsyncStorage.setItem("daily_kick_count", newCount.toString());
    } catch (e) {
      console.error("Failed to save kicks to storage", e);
    }
  };

  const handleReset = async () => {
    if (hasSavedToday) return;
    setIsTimerActive(false);
    setCount(0);
    setTimeLeft(3600);
    await AsyncStorage.setItem("daily_kick_count", "0");
  };

  const saveKicksToBackend = async () => {
    if (hasSavedToday) {
      Alert.alert("Already Saved", "Your entry for today is already logged.");
      return;
    }

    if (count === 0) {
      Alert.alert(
        "No Kicks Recorded",
        "Please register a kick value before saving.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const { token } = await getMotherSession();

      const response = await axios.post(
        `${API_BASE_URL}/api/mothers/kicks`,
        {
          kickCount: count,
          date: new Date().toISOString().slice(0, 10),
        },
        {
          headers: authorizationHeaders(token),
        },
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success",
          `Today's record of ${count} kicks has been saved.`,
        );
        setHasSavedToday(true);
        setIsTimerActive(false);
        setCount(0);
        await AsyncStorage.setItem("daily_kick_count", "0");
        await fetchProfileAndKicks();
      }
    } catch (error) {
      const message = describeAxiosError(error);

      console.error("Backend kick save error:", {
        message,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        data: axios.isAxiosError(error) ? error.response?.data : undefined,
      });

      Alert.alert("Unable to save kick count", message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const chartData = {
    labels:
      history.length > 0
        ? history.map((item) =>
            new Date(item.timestamp).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            }),
          )
        : ["No Entry"],
    datasets: [
      {
        data: history.length > 0 ? history.map((item) => item.kickCount) : [0],
        color: (opacity = 1) => `rgba(201, 124, 138, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // 🌟 Loading Screen while fetching profile data
  if (loadingData) {
    return (
      <View style={[styles.lockedContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#C97C8A" />
      </View>
    );
  }

  // 🌟 LOCK SCREEN: Displays if the calculated week is under 26
  if (!isTrackingAllowed) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockCard}>
          <View style={styles.lockIconWrapper}>
            <Lock size={40} color="#C97C8A" />
          </View>
          <Text style={styles.lockTitle}>Feature Locked</Text>
          <Text style={styles.lockDescription}>
            Fetal movement tracking is recommended during the third trimester.
            You can start using the kick counter from **Week 26** onwards.
          </Text>
          <View style={styles.currentWeekBadge}>
            <Text style={styles.badgeText}>
              You are currently at {currentWeek} Weeks
            </Text>
          </View>
          <Text style={styles.lockFooter}>
            Your Public Health Midwife (PHM) will guide you when it's time to
            begin dynamic tracking!
          </Text>
        </View>
      </View>
    );
  }

  // 🌟 MAIN SCREEN: Renders only if currentWeek >= 26
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* COUNTER CARD */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Baby Kicks</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Info size={24} color="#C97C8A" />
          </TouchableOpacity>
        </View>

        {/* Interactive Timer Row */}
        {!hasSavedToday && (
          <View style={styles.timerControlWrapper}>
            <View
              style={[
                styles.timerContainer,
                timeLeft === 0 && styles.timerExpired,
              ]}
            >
              <Timer
                size={18}
                color={timeLeft === 0 ? "#D9534F" : "#C97C8A"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.timerText,
                  timeLeft === 0 && styles.timerTextExpired,
                ]}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.timerActionButton,
                isTimerActive ? styles.pauseActiveBtn : styles.startActiveBtn,
              ]}
              onPress={toggleTimer}
              activeOpacity={0.7}
            >
              {isTimerActive ? (
                <>
                  <Pause size={14} color="#C97C8A" style={{ marginRight: 4 }} />
                  <Text style={styles.timerActionText}>Pause</Text>
                </>
              ) : (
                <>
                  <Play size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={[styles.timerActionText, { color: "#FFFFFF" }]}>
                    {timeLeft === 3600 ? "Start" : "Resume"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.counterButton,
            (hasSavedToday || timeLeft === 0 || !isTimerActive) &&
              styles.disabledCounter,
          ]}
          onPress={handleIncrement}
          activeOpacity={hasSavedToday || timeLeft === 0 ? 1 : 0.85}
        >
          <View style={styles.iconWrapper}>
            <Footprints size={46} color="#C97C8A" />
          </View>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.tapText}>
            {hasSavedToday
              ? "Completed"
              : timeLeft === 0
                ? "Expired"
                : !isTimerActive
                  ? "Paused"
                  : "Tap"}
          </Text>
        </TouchableOpacity>

        {hasSavedToday && (
          <Text style={styles.alreadySavedNotice}>
            Today's tracking is complete. See you tomorrow!
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.resetBtn, hasSavedToday && styles.disabledBtn]}
            onPress={handleReset}
            disabled={hasSavedToday}
          >
            <RotateCcw size={18} color="#9A7B82" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              (isSaving || hasSavedToday) && styles.disabledBtn,
            ]}
            onPress={saveKicksToBackend}
            disabled={isSaving || hasSavedToday}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.saveText}>
              {isSaving ? "Saving" : hasSavedToday ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GRAPH CARD */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Kick Activity Analytics</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>
            Not enough database records to plot a trend yet.
          </Text>
        ) : (
          <LineChart
            data={chartData}
            width={screenWidth - 48}
            height={200}
            chartConfig={{
              backgroundColor: "#FFFBFA",
              backgroundGradientFrom: "#FFFBFA",
              backgroundGradientTo: "#FFF4F5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(122, 78, 87, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(154, 123, 130, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#C97C8A" },
            }}
            bezier
            style={styles.chartStyles}
          />
        )}
      </View>

      {/* INSTRUCTIONS POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalMainTitle}>🤰 The One-Hour Method</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color="#9A7B82" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.instructionStep}>
                <Text style={styles.stepTitle}>⏰ Pick a Time</Text>
                <Text style={styles.stepText}>
                  Choose a time when your baby is most active (often after a
                  meal or in the evening). Aim for the same time every day.
                </Text>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepTitle}>🛋️ Get Comfortable</Text>
                <Text style={styles.stepText}>
                  Sit with your feet propped up or lie comfortably on your left
                  side to maximize blood flow to the baby.
                </Text>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepTitle}>👣 Count Movements</Text>
                <Text style={styles.stepText}>
                  Set a timer for 1 hour. Count every kick, flutter, swish, or
                  roll until you reach 10 distinct movements, tapping the
                  counter circle for each one.
                </Text>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepTitle}>✨ Expected Activity</Text>
                <Text style={styles.stepText}>
                  Many active babies will achieve 10 or more movements within a
                  single hour.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#FFF4F1",
  },
  card: {
    backgroundColor: "#FFFBFA",
    borderRadius: 36,
    padding: 24,
    alignItems: "center",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
    position: "relative",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#7A4E57" },
  infoButton: { position: "absolute", right: 4, padding: 4 },
  timerControlWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  timerExpired: { backgroundColor: "#FDF2F2" },
  timerText: { fontSize: 15, fontWeight: "800", color: "#C97C8A" },
  timerTextExpired: { color: "#D9534F" },
  timerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  startActiveBtn: { backgroundColor: "#C97C8A" },
  pauseActiveBtn: {
    backgroundColor: "#FFF2F4",
    borderWidth: 1,
    borderColor: "#FAD6DC",
  },
  timerActionText: { fontSize: 14, fontWeight: "700", color: "#C97C8A" },
  counterButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#F8D7DA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#FDECEF",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 7,
  },
  disabledCounter: {
    backgroundColor: "#F2EAEB",
    borderColor: "#F8F1F3",
    shadowOpacity: 0.05,
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF8F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  count: { fontSize: 72, fontWeight: "900", color: "#7A4E57", lineHeight: 82 },
  tapText: { fontSize: 17, fontWeight: "700", color: "#9A7B82" },
  alreadySavedNotice: {
    marginTop: 16,
    fontSize: 14,
    color: "#C97C8A",
    fontWeight: "600",
    textAlign: "center",
  },
  buttonRow: { flexDirection: "row", marginTop: 24, width: "100%" },
  resetBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F7E8E6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 10,
  },
  resetText: {
    color: "#9A7B82",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },
  saveBtn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#C97C8A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: 10,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },
  disabledBtn: { opacity: 0.4 },
  graphCard: {
    backgroundColor: "#FFFBFA",
    borderRadius: 28,
    padding: 16,
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7A4E57",
    marginBottom: 12,
    alignSelf: "flex-start",
    marginLeft: 4,
  },
  emptyText: {
    color: "#9A7B82",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 40,
  },
  chartStyles: { marginVertical: 8, borderRadius: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(82, 58, 62, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFBFA",
    borderRadius: 28,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#7A4E57",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F7E8E6",
    paddingBottom: 12,
  },
  modalMainTitle: { fontSize: 20, fontWeight: "800", color: "#7A4E57" },
  modalScroll: { marginVertical: 4 },
  instructionStep: { marginBottom: 18 },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7A4E57",
    marginBottom: 4,
  },
  stepText: { fontSize: 14, color: "#9A7B82", lineHeight: 20 },

  // Lock View Layout Styles
  lockedContainer: {
    flex: 1,
    backgroundColor: "#FFF4F1",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockCard: {
    backgroundColor: "#FFFBFA",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#C97C8A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  lockIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDECEF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#7A4E57",
    marginBottom: 12,
  },
  lockDescription: {
    fontSize: 15,
    color: "#9A7B82",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  currentWeekBadge: {
    backgroundColor: "#C97C8A",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  lockFooter: {
    fontSize: 13,
    color: "#BAA1A5",
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
