import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WeekDetails() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🟢 FIXED: Updated URL path to match your Backend Controller
    // 🟢 FIXED: Added more detailed error logging
    const fetchUrl = `http://10.161.201.226:8080/api/weekly-milestones/${id}`;

    console.log("🚀 Attempting to fetch from:", fetchUrl);

    axios
      .get(fetchUrl)
      .then((res) => {
        console.log("✅ Data received:", res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error detail:", err.message);
        // If the server isn't reached, it stays loading forever unless we stop it here
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ED70A1" />
        <Text style={styles.loadingText}>Fetching Week {id} Data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Week {id} Progress</Text>

      {data ? (
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Baby Size:</Text>
            <Text style={styles.value}>{data.babySize} </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Est. Weight:</Text>
            <Text style={styles.value}>{data.babyWeight}</Text>
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>Weekly Health Tip ✨</Text>
            <Text style={styles.tipText}>{data.weeklyTip}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>
          Milestone data for Week {id} not found in database.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FDF2F8", flexGrow: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ED70A1",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  label: { fontSize: 18, color: "#4B5563", fontWeight: "600" },
  value: { fontSize: 18, color: "#1F2937", fontWeight: "bold" },
  tipContainer: {
    marginTop: 20,
    backgroundColor: "#FFF5F7",
    padding: 15,
    borderRadius: 15,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DB2777",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    fontStyle: "italic",
  },
  loadingText: { marginTop: 10, color: "#ED70A1" },
  errorText: { textAlign: "center", color: "#6B7280", marginTop: 50 },
});
