import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define the shape of our data based on the Backend DTO
interface StaffMember {
  nic: string;
  staffId: string;
  fullName: string;
  mohArea: string;
}

export default function ManageStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the data as soon as the screen loads
  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await fetch(
        "http://192.168.131.223:8080/api/users/staff/all",
      );
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      } else {
        Alert.alert("Error", "Failed to load staff list.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (staffId: string, fullName: string) => {
    Alert.alert(
      "Remove Officer",
      `Are you sure you want to permanently delete ${fullName} from the system?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `http://192.168.131.223:8080/api/users/staff/delete/${staffId}`,
                {
                  method: "DELETE",
                },
              );

              if (response.ok) {
                Alert.alert("Deleted", `${fullName} has been removed.`);
                // Refresh the list immediately so the card disappears!
                fetchStaffList();
              } else {
                const errorMsg = await response.text();
                Alert.alert("Error", errorMsg);
              }
            } catch (error) {
              Alert.alert("Network Error", "Could not connect to server.");
            }
          },
        },
      ],
    );
  };

  // The design for a single PHM Card with the new Remove button
  const renderStaffCard = ({ item }: { item: StaffMember }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.nameText}>{item.fullName}</Text>
          <Text style={styles.idText}>{item.staffId}</Text>
        </View>

        {/* 🚀 NEW: The Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.staffId, item.fullName)}
        >
          <Text style={styles.deleteBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.detailText}>
          🏥 MOH Area: {item.mohArea || "N/A"}
        </Text>
        <Text style={styles.detailText}>🪪 NIC: {item.nic}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage PHM Officers</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0056b3"
          style={{ marginTop: 50 }}
        />
      ) : staff.length === 0 ? (
        <Text style={styles.emptyText}>No staff members registered yet.</Text>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item, index) => item.staffId || index.toString()}
          renderItem={renderStaffCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f9", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#28a745", // Green accent
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  idText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0056b3",
    backgroundColor: "#e6f0fa",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start", // Keeps the background color tight to the text
  },
  // 🚀 NEW: Styles for the delete button
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardBody: { marginTop: 5 },
  detailText: { fontSize: 14, color: "#555", marginBottom: 3 },
});
