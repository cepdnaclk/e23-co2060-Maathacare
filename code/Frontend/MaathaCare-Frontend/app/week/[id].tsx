import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronLeft } from "lucide-react-native";

export default function WeekDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📹 VIDEO SOURCE LOGIC
  // This maps the ID to your physical files in assets/videos/
  const getVideoSource = (weekId: string | string[]) => {
    switch (weekId) {
      case "1": return require("../../assets/videos/week1.mp4");
      case "2": return require("../../assets/videos/week2.mp4");
      case "3": return require("../../assets/videos/week3.mp4");
      case "4": return require("../../assets/videos/week4.mp4");
      case "5": return require("../../assets/videos/week5.mp4");
      case "6": return require("../../assets/videos/week6.mp4");
      case "7": return require("../../assets/videos/week7.mp4");
      case "8": return require("../../assets/videos/week8.mp4");
      case "9": return require("../../assets/videos/week2.mp4");
      case "10": return require("../../assets/videos/week2.mp4");
      case "11": return require("../../assets/videos/week2.mp4");
      case "12": return require("../../assets/videos/week12.mp4");
      case "13": return require("../../assets/videos/week13.mp4");
      case "14": return require("../../assets/videos/week14.mp4");
      case "15": return require("../../assets/videos/week15.mp4");
      case "16": return require("../../assets/videos/week16.mp4");
      case "17": return require("../../assets/videos/week17.mp4");
      case "18": return require("../../assets/videos/week18.mp4");
      case "19": return require("../../assets/videos/week19.mp4");
      case "20": return require("../../assets/videos/week20.mp4");
      case "21": return require("../../assets/videos/week21.mp4");
      case "22": return require("../../assets/videos/week22.mp4");
      case "23": return require("../../assets/videos/week23.mp4");
      case "24": return require("../../assets/videos/week24.mp4");
      case "25": return require("../../assets/videos/week25.mp4");
      case "26": return require("../../assets/videos/week26.mp4");
      case "27": return require("../../assets/videos/week27.mp4");
      case "28": return require("../../assets/videos/week28.mp4");
      case "29": return require("../../assets/videos/week2.mp4");
      case "30": return require("../../assets/videos/week2.mp4");
      case "31": return require("../../assets/videos/week2.mp4");
      case "32": return require("../../assets/videos/week2.mp4");
      case "33": return require("../../assets/videos/week2.mp4");
      case "34": return require("../../assets/videos/week2.mp4");
      case "35": return require("../../assets/videos/week2.mp4");
      case "36": return require("../../assets/videos/week2.mp4");
      case "37": return require("../../assets/videos/week2.mp4");case "2": return require("../../assets/videos/week2.mp4");
      case "38": return require("../../assets/videos/week2.mp4");
      case "39": return require("../../assets/videos/week2.mp4");
      case "40": return require("../../assets/videos/week2.mp4");
    }
  };

  const player = useVideoPlayer(getVideoSource(id), (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    // 🟢 Ensure this IP matches your laptop's current IPv4
    const fetchUrl = `http://172.20.10.4:8080/api/weekly-milestones/${id}`;

    axios
      .get(fetchUrl)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error detail:", err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ED70A1" />
        <Text style={styles.loadingText}>Loading Week {id}...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#ED70A1" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Week {id} Progress</Text>

      {/* 📹 VIDEO PLAYER SECTION */}
      <View style={styles.videoWrapper}>
        <VideoView 
          style={styles.video} 
          player={player} 
          allowsFullscreen 
          allowsPictureInPicture 
          nativeControls={false} // Set to true if you want play/pause buttons
        />
        <View style={styles.videoOverlay}>
          <Text style={styles.overlayText}>Inside the Womb</Text>
        </View>
      </View>

      {data ? (
        <View style={styles.content}>
          {/* STATS CARDS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.label}>Baby Size</Text>
              <Text style={styles.value}>{data.babySize}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.label}>Est. Weight</Text>
              <Text style={styles.value}>{data.babyWeight}</Text>
            </View>
          </View>

          {/* BABY DEVELOPMENT */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>👶 Your Baby's Development</Text>
            <Text style={styles.cardText}>{data.babyDevelopment }</Text>
          </View>

          {/* MOTHER'S CHANGES */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>🤰 Changes in Your Body</Text>
            <Text style={styles.cardText}>{data.motherChanges}</Text>
          </View>

          {/* PHM CHECKLIST */}
          <View style={styles.clinicCard}>
            <Text style={styles.clinicHeader}>🏥 PHM & Clinic Checklist</Text>
            <Text style={styles.clinicText}>{data.phmChecklist}</Text>
          </View>

          {/* HEALTH TIP */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>Weekly Health Tip ✨</Text>
            <Text style={styles.tipText}>{data.weeklyTip}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>
          Milestone data for Week {id} not found.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FDF2F8", flexGrow: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10,
    marginTop: 10 
  },
  backText: { color: "#ED70A1", fontSize: 18, fontWeight: "600", marginLeft: 5 },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ED70A1",
    marginBottom: 20,
    textAlign: "center"
  },
  videoWrapper: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 5,
  },
  video: { width: '100%', height: '100%' },
  videoOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 15,
    backgroundColor: 'rgba(237, 112, 161, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  overlayText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  content: { paddingBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { 
    backgroundColor: 'white', 
    width: '48%', 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 2 
  },
  infoCard: { 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 15, 
    elevation: 2 
  },
  cardHeader: { fontSize: 18, fontWeight: "bold", color: "#DB2777", marginBottom: 8 },
  cardText: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  clinicCard: { 
    padding: 20, 
    borderRadius: 20, 
    backgroundColor: "#E0F2FE", 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: "#0369A1", 
    marginBottom: 15 
  },
  clinicHeader: { fontSize: 17, fontWeight: "bold", color: "#0369A1", marginBottom: 5 },
  clinicText: { fontSize: 14, color: "#0C4A6E", fontWeight: "500", lineHeight: 20 },
  label: { fontSize: 12, color: "#9CA3AF", fontWeight: "700", textTransform: 'uppercase' },
  value: { fontSize: 16, color: "#1F2937", fontWeight: "bold", marginTop: 4 },
  tipContainer: {
    marginTop: 10,
    backgroundColor: "#FFF5F7",
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#ED70A1"
  },
  tipTitle: { fontSize: 20, fontWeight: "bold", color: "#DB2777", marginBottom: 8 },
  tipText: { fontSize: 16, color: "#4B5563", lineHeight: 24, fontStyle: "italic" },
  loadingText: { marginTop: 10, color: "#ED70A1" },
  errorText: { textAlign: "center", color: "#6B7280", marginTop: 50 },
});