import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../constants/apiConfig";

export default function ViewVisitsScreen() {
  const { motherId, motherName } = useLocalSearchParams();
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch visits whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchVisits();
    }, [motherId]),
  );

  const fetchVisits = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const url = `${API_BASE_URL}/api/visits/mother/${motherId}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      } else {
        console.log("Server returned status:", response.status);
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a specific record
  const handleDelete = (recordId: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this clinical record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive", // Makes the button red on iOS
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(
                `${API_BASE_URL}/api/visits/${recordId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              if (response.ok) {
                // Instantly remove the deleted item from the screen without reloading
                setVisits((prevVisits) =>
                  prevVisits.filter((item) => item.id !== recordId),
                );
                Alert.alert("Success", "Record deleted successfully.");
              } else {
                const errorText = await response.text();
                console.log("Delete Error Status:", response.status);
                console.log("Delete Error Message:", errorText);
                Alert.alert(
                  "Server Error",
                  `Status: ${response.status}\nDetails: ${errorText}`,
                );
              }
            } catch (error) {
              Alert.alert("Network Error", "Could not connect to the server.");
            }
          },
        },
      ],
    );
  };

  const renderVisitCard = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.weekText}>Week {item.gestationalWeek}</Text>
          <Text style={styles.dateText}>
            {new Date(item.visitDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dataGrid}>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{item.weight} kg</Text>
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>Blood Pressure</Text>
          <Text style={styles.value}>{item.bloodPressure}</Text>
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>SFH</Text>
          <Text style={styles.value}>
            {item.sfh ? `${item.sfh} cm` : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dataGrid}>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>Fetal Heart</Text>
          <Text style={styles.value}>{item.fhs}</Text>
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>Movement</Text>
          <Text style={styles.value}>{item.fetalMovements}</Text>
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.label}>Supplements</Text>
          <Text style={styles.value}>
            {item.iron ? "Fe " : ""}
            {item.calcium ? "Ca " : ""}
            {item.folicAcid ? "FA" : ""}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Clinical History</Text>
      <Text style={styles.subHeader}>Patient: {motherName}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0056b3"
          style={{ marginTop: 50 }}
        />
      ) : visits.length === 0 ? (
        <Text style={styles.emptyText}>
          No clinical records found for this patient.
        </Text>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisitCard}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FAFC" },
  backBtn: { marginBottom: 15, marginTop: 40 },
  backBtnText: { color: "#0056b3", fontSize: 16, fontWeight: "bold" },
  header: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  subHeader: { fontSize: 16, color: "#64748B", marginBottom: 20 },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 50,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  weekText: { fontSize: 18, fontWeight: "bold", color: "#0056b3" },
  dateText: { color: "#64748B", fontSize: 13, marginTop: 2 },
  deleteBtn: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteIcon: { fontSize: 16 },
  dataGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  dataColumn: { flex: 1 },
  label: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { fontSize: 15, color: "#1E293B", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
});
