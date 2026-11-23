import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, getStatusStyle } from './appointmentHelpers';
import type { Appointment } from './appointmentTypes';

interface Props {
  appointment: Appointment;
  onPress: () => void;
}

export default function AppointmentCard({ appointment, onPress }: Props) {
  const [timeValue, period] = appointment.time?.split(' ') ?? ['--:--', ''];
  const statusStyle = getStatusStyle(appointment.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{timeValue}</Text>
        <Text style={styles.periodText}>{period}</Text>
      </View>

      <View style={styles.detailsBlock}>
        <View style={styles.mainRow}>
          <View style={styles.patientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🤰</Text>
            </View>

            <View style={styles.nameBlock}>
              <Text style={styles.patientName} numberOfLines={1}>
                {appointment.motherName ?? 'Unknown Mother'}
              </Text>
              <Text style={styles.reasonText} numberOfLines={1}>
                {appointment.reason ?? 'Clinic Visit'}
              </Text>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaText}>👶 {appointment.gestationalAge ?? 'Maternal clinic appointment'}</Text>
          <Text style={styles.metaText}>📍 {appointment.location ?? 'PHM clinic'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  timeBlock: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderRightColor: COLORS.border,
    paddingRight: 14,
    marginRight: 14,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: 24,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  detailsBlock: {
    flex: 1,
    minWidth: 0,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  patientRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaBlock: {
    marginTop: 10,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
});
