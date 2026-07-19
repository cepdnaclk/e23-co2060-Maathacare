import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COLORS, generateDateStrip } from "./appointmentHelpers";

interface Props {
  selectedFullDate: string;
  onSelectDate: (date: string) => void;
}

export default function DateSelector({ selectedFullDate, onSelectDate }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {generateDateStrip().map((item) => {
        const isSelected = selectedFullDate === item.full;

        return (
          <TouchableOpacity
            key={item.full}
            style={[styles.dateCard, isSelected && styles.dateCardActive]}
            onPress={() => onSelectDate(item.full)}
            activeOpacity={0.85}
          >
            <Text style={[styles.dayName, isSelected && styles.activeText]}>
              {item.dayName}
            </Text>

            <Text style={[styles.dayNumber, isSelected && styles.activeText]}>
              {item.dayNumber}
            </Text>

            <Text style={[styles.monthName, isSelected && styles.activeSubText]}>
              {item.monthName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 150,
  },

  container: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  dateCard: {
    width: 72,
    height: 118,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  dayName: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "700",
  },

  dayNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 8,
  },

  monthName: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 4,
  },

  activeText: {
    color: "#FFFFFF",
  },

  activeSubText: {
    color: "rgba(255,255,255,0.75)",
  },
});