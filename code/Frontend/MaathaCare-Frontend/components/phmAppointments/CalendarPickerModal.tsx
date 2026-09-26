import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { COLORS } from './appointmentHelpers';
import type { Appointment } from './appointmentTypes';

interface Props {
  visible: boolean;
  appointments: Appointment[];
  selectedFullDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export default function CalendarPickerModal({
  visible,
  appointments,
  selectedFullDate,
  onSelectDate,
  onClose,
}: Props) {
  const getMarkedDates = () => {
    const marked: Record<string, any> = {};

    appointments.forEach((appointment) => {
      if (appointment.fullDate) {
        marked[appointment.fullDate] = {
          marked: true,
          dotColor: COLORS.primary,
        };
      }
    });

    marked[selectedFullDate] = {
      ...marked[selectedFullDate],
      selected: true,
      selectedColor: COLORS.primary,
    };

    return marked;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Date</Text>
          <Calendar
            markedDates={getMarkedDates()}
            onDayPress={(day: any) => {
              onSelectDate(day.dateString);
              onClose();
            }}
            theme={{
              todayTextColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
              dotColor: COLORS.primary,
              arrowColor: COLORS.primary,
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
