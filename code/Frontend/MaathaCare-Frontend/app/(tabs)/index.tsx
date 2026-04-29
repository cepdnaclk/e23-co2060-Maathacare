import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Activity, Calendar, Footprints, Lightbulb } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ weeks: 0, days: 0, totalDays: 0 });
  const [userName, setUserName] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchPregnancyData = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken");
          const ip = "10.224.114.226"; // Ensure this matches your current IP
          
          if (!token || !userId) { setLoading(false); return; }

          const response = await axios.get(`http://${ip}:8080/api/mothers/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const data = response.data;
          setUserName(data.fullName ? data.fullName.split(' ')[0] : "Mother");

          if (data.lastMenstrualPeriod) {
            const lmp = new Date(data.lastMenstrualPeriod);
            const today = new Date();
            const diffInMs = today.getTime() - lmp.getTime();
            const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (totalDays >= 0) {
              setStats({
                weeks: Math.floor(totalDays / 7),
                days: totalDays % 7,
                totalDays: totalDays
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

  if (loading) return <ActivityIndicator style={styles.center} color="#ED70A1" />;

  //dynamic baby Size
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {userName}!</Text>
          <Text style={styles.subText}>Your pregnancy journey</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Bell size={22} color="#ED70A1" />
        </TouchableOpacity>
      </View>

      {/* PRIMARY PROGRESS CARD */}
      <View style={styles.statsCard}>
        <Text style={styles.fruitText}>
          {getBabySizeInfo(stats.weeks).icon} Baby is the size of {getBabySizeInfo(stats.weeks).size}
        </Text>
        <View style={styles.row}>
          <Text style={styles.number}>{stats.weeks}</Text>
          <Text style={styles.unit}> Weeks </Text>
          <Text style={styles.number}>{stats.days}</Text>
          <Text style={styles.unit}> Days</Text>
        </View>
        
        {/* PROGRESS BAR */}
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={['#ED70A1', '#FF9A8B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>{Math.floor(progress * 100)}% of your journey complete</Text>
      </View>

      {/* QUICK ACTIONS GRID */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <ActionCard icon={<Activity color="#DB2777" />} label="Log Symptoms" color="#FCE7F3" />
        <ActionCard icon={<Calendar color="#0369A1" />} label="Upcoming Clinic" color="#E0F2FE" />
        <ActionCard icon={<Footprints color="#065F46" />} label="Kick Counter" color="#D1FAE5" />
        <ActionCard icon={<Lightbulb color="#92400E" />} label="Daily Tip" color="#FEF3C7" />
      </View>
    </ScrollView>
  );
}

// Sub-component for Grid Items
function ActionCard({ icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: color }]}>
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF2F8', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 60, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#ED70A1' },
  subText: { fontSize: 16, color: '#9CA3AF' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  
  statsCard: { backgroundColor: '#fff', padding: 25, borderRadius: 24, alignItems: 'center', elevation: 5, shadowColor: '#ED70A1', shadowOpacity: 0.1, shadowRadius: 10 },
  fruitText: { fontSize: 14, color: '#DB2777', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  number: { fontSize: 48, fontWeight: 'bold', color: '#1F2937', fontFamily: 'serif' },
  unit: { fontSize: 18, color: '#4B5563', fontFamily: 'serif' },
  
  progressBarBackground: { width: '100%', height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 8, fontWeight: '500' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 30, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', height: 110, borderRadius: 20, padding: 15, marginBottom: 15, justifyContent: 'space-between' },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 14, fontWeight: 'bold', color: '#374151' }
});