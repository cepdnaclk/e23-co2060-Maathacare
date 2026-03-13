import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "http://10.163.129.223:8080";

export default function MotherDetails() {
  const { motherId } = useLocalSearchParams(); // Get ID from navigation
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMotherDetails();
  }, []);

  const fetchMotherDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      // Use your existing endpoint or create a specific one for full details
      const res = await fetch(`${API_BASE_URL}/api/mothers/profile/${motherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{details?.fullName}</Text>
        <Text style={styles.nic}>NIC: {details?.nic}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        <DetailRow label="Blood Group" value={details?.bloodGroup} />
        <DetailRow label="LMP" value={details?.lastMenstrualPeriod} />
        <DetailRow label="Emergency Contact" value={details?.emergencyContactNumber} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location Details</Text>
        <DetailRow label="District" value={details?.district} />
        <DetailRow label="Province" value={details?.province} />
        <DetailRow label="Address" value={details?.address} />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || "Not Provided"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  centered: { flex: 1, justifyContent: "center" },
  header: { backgroundColor: "#0056b3", padding: 30, alignItems: "center" },
  name: { color: "white", fontSize: 24, fontWeight: "bold" },
  nic: { color: "#BBDEFB", fontSize: 16, marginTop: 5 },
  card: { backgroundColor: "white", margin: 15, padding: 20, borderRadius: 15, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 5 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#64748B", fontWeight: "600" },
  value: { color: "#1E293B", fontWeight: "bold" }
});