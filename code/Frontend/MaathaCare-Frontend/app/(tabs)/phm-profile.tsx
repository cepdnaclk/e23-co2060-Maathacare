import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PHMProfileScreen() {
  // These are "State" variables. Later, we will fill these with your Spring Boot data.
  const [phmInfo, setPhmInfo] = useState({
    name: "Kasun Hansika",
    id: "PHM-2026-045",
    phone: "+94 77 123 4567",
    area: "Kandy South"
  });

  return (
    <ScrollView style={styles.container}>
      
      {/* 1. Profile Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>PHM Dashboard</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>
        
        <Text style={styles.name}>{phmInfo.name}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Staff ID:</Text>
          <Text style={styles.infoValue}>{phmInfo.id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{phmInfo.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>MOH Area:</Text>
          <Text style={styles.infoValue}>{phmInfo.area}</Text>
        </View>
      </View>

      {/* 2. Assigned Mothers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Mothers</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        
        {/* Card for Kumari Silva (Data from your pgAdmin) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Kumari Silva</Text>
            <View style={[styles.statusDot, {backgroundColor: '#4CAF50'}]} />
          </View>
          <Text style={styles.cardSub}>ID: 62df2c26... (Active)</Text>
        </View>
      </View>

      {/* 3. Upcoming Appointments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        
        <View style={styles.card}>
          <Text style={styles.dateText}>Mar 20, 2026 - 10:30 AM</Text>
          <Text style={styles.cardTitle}>Kandy South Clinic</Text>
          <View style={styles.divider} />
          <Text style={styles.cardSub}>Mother: Kumari Silva</Text>
          <Text style={styles.cardSub}>Note: First trimester checkup</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  
  // Header Design
  headerCard: { backgroundColor: '#4CAF50', padding: 25, borderRadius: 20, marginBottom: 25, elevation: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 14, color: '#E8F5E9', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  name: { fontSize: 28, color: 'white', fontWeight: 'bold', marginBottom: 15 },
  
  // Info Rows
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { color: '#C8E6C9', width: 85, fontSize: 14 },
  infoValue: { color: 'white', fontSize: 14, fontWeight: '600' },

  // Content Sections
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  seeAll: { color: '#4CAF50', fontWeight: '600' },
  
  // Card Design
  card: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#334155' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  dateText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 }
});