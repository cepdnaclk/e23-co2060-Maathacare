import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../constants/apiConfig";

export default function DigitalLocker() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [motherId, setMotherId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");
        if (storedId) setMotherId(storedId);
        else {
          Alert.alert("Auth Error", "Please log in again.");
          setIsLoadingDocs(false);
        }
      } catch (error) {
        setIsLoadingDocs(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (motherId) fetchDocuments(motherId);
  }, [motherId]);

  const fetchDocuments = async (id: string) => {
    try {
      setIsLoadingDocs(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${API_BASE_URL}/api/medical-records/mother/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load records.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!motherId) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (result.canceled) return;
      const file = result.assets[0];
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: "application/pdf" } as any);
      formData.append("phoneNumber", motherId);
      formData.append("uploadedByRole", "MOTHER");

      const token = await AsyncStorage.getItem("userToken");
      await axios.post(`${API_BASE_URL}/api/medical-records/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success!", "Uploaded successfully.");
      fetchDocuments(motherId);
    } catch (error) {
      Alert.alert("Upload Failed", "An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
      setIsDeleting(id);
      const token = await AsyncStorage.getItem("userToken");
      try {
        await axios.delete(`${API_BASE_URL}/api/medical-records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // 1. Update UI immediately
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
        
        // 2. Force a re-fetch to ensure the DB state matches the UI state
        await fetchDocuments(motherId!); 
        
        Alert.alert("Success", "Document deleted.");
      } catch (error) {
        Alert.alert("Error", "Could not delete.");
      } finally {
        setIsDeleting(null);
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Digital Locker</Text>
      <Text style={styles.subtitle}>Secure, encrypted storage for your records</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument} disabled={isUploading}>
        {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>+ Upload PDF Report</Text>}
      </TouchableOpacity>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={30} color="#FF69B4" />
              <View style={styles.cardInfo}>
                <Text style={styles.fileName}>{decodeURIComponent(item.fileName).replace(/%20/g, ' ')}</Text>
                <Text style={styles.dateText}>Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="lock-closed" size={18} color="#6c757d" />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)} style={styles.viewButton}>
                <Text style={styles.viewText}>View PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7f6", padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 20 },
  uploadButton: { backgroundColor: "#FF69B4", padding: 18, borderRadius: 12, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardInfo: { flex: 1, marginLeft: 10 },
  fileName: { fontSize: 15, fontWeight: "600", color: "#333" },
  dateText: { fontSize: 12, color: "#aaa" },
  buttonRow: { flexDirection: "row", marginTop: 10, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  viewButton: { flex: 1, backgroundColor: "#eef2f5", padding: 10, borderRadius: 8, alignItems: "center", marginRight: 10 },
  deleteButton: { backgroundColor: "#ff6b6b", padding: 10, borderRadius: 8, alignItems: "center" },
  viewText: { fontWeight: "600", color: "#555" },
});

function setIsDeleting(id: string) {
  throw new Error("Function not implemented.");
}
