import { useRouter } from 'expo-router'; //
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Generate numbers 1 to 40 for the pregnancy weeks
const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

export default function ExploreScreen() {
  const router = useRouter(); //

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pregnancy Journey</Text>
        <Text style={styles.subtitle}>Explore details for every week of your baby's growth.</Text>

        <View style={styles.grid}>
          {weeks.map((week) => (
            <TouchableOpacity 
              key={week} 
              style={styles.weekCard}
              // This triggers the dynamic route we will create next
              onPress={() => router.push(`/week/${week}`)} 
            >
              <Text style={styles.weekLabel}>WEEK</Text>
              <Text style={styles.weekNumber}>{week}</Text>
              <View style={styles.dot} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Matches the clean light background
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ED70A1', // MaathaCare Rose
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7E7E7E',
    marginBottom: 25,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weekCard: {
    backgroundColor: 'white',
    width: '30%', // Creates a 3-column grid
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  weekLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  weekNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ED70A1',
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FBCFE8',
    marginTop: 8,
  },
});