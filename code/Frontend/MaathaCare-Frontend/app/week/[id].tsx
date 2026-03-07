import axios from 'axios';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function WeekDetails() {
  const { id } = useLocalSearchParams(); // Gets the number (e.g., "14") from the click
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetches the specific week data from your Spring Boot backend
    axios.get(`http://10.30.1.91:8080/api/milestones/${id}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [id]);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Week ${id}`, headerShown: true }} />
      <Text style={styles.title}>Week {id} Progress</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.info}>Baby Size: {data.babySize}</Text>
          <Text style={styles.info}>Weight: {data.babyWeight}</Text>
          <Text style={styles.tipTitle}>Health Tip:</Text>
          <Text style={styles.tipText}>{data.weeklyTip}</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#ED70A1" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ED70A1', marginBottom: 20 },
  card: { padding: 20, backgroundColor: '#fce7f3', borderRadius: 15 },
  info: { fontSize: 18, marginBottom: 10 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  tipText: { fontSize: 16, fontStyle: 'italic' }
});