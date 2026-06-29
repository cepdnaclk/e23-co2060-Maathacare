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
import { API_BASE_URL } from "../../constants/apiConfig"; // Adjust path if needed

export default function DigitalLocker() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  
  // State to hold the dynamic Mother ID
  const [motherId, setMotherId] = useState<string | null>(null);

  // 1. Fetch the Mother ID from AsyncStorage when the screen loads
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // IMPORTANT: Ensure "userId" matches the exact key you used in your login.tsx file!
        const storedId = await AsyncStorage.getItem("userId");
        
        if (storedId) {
          setMotherId(storedId);
        } else {
          Alert.alert("Authentication Error", "Could not find your user profile. Please log in again.");
          setIsLoadingDocs(false);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
        setIsLoadingDocs(false);
      }
    };

    loadUserData();
  }, []);

  // 2. Fetch documents ONLY after we have successfully loaded the motherId
  useEffect(() => {
    if (motherId) {
      fetchDocuments(motherId);
    }
  }, [motherId]);

  const fetchDocuments = async (id: string) => {
    try {
      setIsLoadingDocs(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/medical-records/mother/${id}`
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      Alert.alert("Error", "Could not load your medical records.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // 3. Handle picking and uploading a PDF
  const handleUploadDocument = async () => {
    if (!motherId) {
      Alert.alert("Error", "You must be logged in to upload documents.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return; 
      }

      const file = result.assets[0];
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
      } as any);
      
      // Use the dynamic ID here!
      formData.append("phoneNumber", motherId);
      formData.append("uploadedByRole", "MOTHER");

      await axios.post(`${API_BASE_URL}/api/medical-records/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success!", "Document uploaded securely to your locker.");
      fetchDocuments(motherId); 

    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "An unknown error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const openDocument = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open this document.");
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Digital Locker</Text>
      <Text style={styles.subtitle}>Securely store your medical records</Text>

      <TouchableOpacity
        style={[styles.uploadButton, (isUploading || !motherId) && styles.disabledButton]}
        onPress={handleUploadDocument}
        disabled={isUploading || !motherId}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>+ Upload PDF Report</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Uploaded Documents</Text>

      {isLoadingDocs ? (
        <ActivityIndicator size="large" color="#FF69B4" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openDocument(item.fileUrl)}
            >
              <Text style={styles.fileName}>{item.fileName}</Text>
              <Text style={styles.dateText}>
                Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No documents uploaded yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF69B4" },
  subtitle: { fontSize: 16, color: "#6c757d", marginBottom: 20 },
  uploadButton: {
    backgroundColor: "#FF69B4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  disabledButton: { backgroundColor: "#ffb6c1" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#343a40", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  fileName: { fontSize: 16, fontWeight: "600", color: "#495057", marginBottom: 5 },
  dateText: { fontSize: 12, color: "#6c757d" },
  emptyText: { textAlign: "center", color: "#6c757d", marginTop: 20 },
});