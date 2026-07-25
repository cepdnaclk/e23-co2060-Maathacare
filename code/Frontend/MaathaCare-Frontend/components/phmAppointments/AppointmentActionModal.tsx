import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react-native';

import { COLORS, isTimePassed } from './appointmentHelpers';
import type { Appointment } from './appointmentTypes';

interface Props {
  visible: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onCompletePress: () => void;
  onMarkMissed: () => void;
  onDelete: () => void;
}

export default function AppointmentActionModal({
  visible,
  appointment,
  onClose,
  onCompletePress,
  onMarkMissed,
  onDelete,
}: Props) {
  const status = appointment?.status?.toUpperCase();
  const canUpdate = status !== 'COMPLETED' && status !== 'MISSED';
  const unlocked = isTimePassed(appointment);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.handle} />

          <Text style={styles.title}>Update Appointment</Text>

          <Text style={styles.subtitle}>
            {appointment?.motherName ?? 'Selected appointment'}
          </Text>

          {canUpdate && unlocked && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={onCompletePress}
                activeOpacity={0.85}
              >
                <View style={styles.actionButtonContent}>
                  <CheckCircle2
                    size={22}
                    color="#15803D"
                    strokeWidth={2.5}
                  />
                  <Text style={[styles.actionText, styles.completeText]}>
                    Complete & Prescribe
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.missedButton]}
                onPress={onMarkMissed}
                activeOpacity={0.85}
              >
                <View style={styles.actionButtonContent}>
                  <AlertTriangle
                    size={22}
                    color="#C2410C"
                    strokeWidth={2.5}
                  />
                  <Text style={[styles.actionText, styles.missedText]}>
                    Patient Missed Clinic
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {canUpdate && !unlocked && (
            <View style={styles.lockedContainer}>
              <View style={styles.lockedContent}>
                <Clock size={20} color={COLORS.muted} strokeWidth={2.4} />
                <Text style={styles.lockedText}>
                  Status updates will unlock after the appointment time passes.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
            activeOpacity={0.85}
          >
            <View style={styles.actionButtonContent}>
              <Trash2 size={22} color="#B91C1C" strokeWidth={2.5} />
              <Text style={[styles.actionText, styles.deleteText]}>
                Delete Appointment
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelText}>Cancel</Text>
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
    justifyContent: 'flex-end',
  },

  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
  },

  handle: {
    width: 48,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    marginBottom: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 20,
  },

  actionButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },

  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  actionText: {
    fontSize: 15,
    fontWeight: '800',
  },

  completeButton: {
    backgroundColor: '#DCFCE7',
  },

  completeText: {
    color: '#15803D',
  },

  missedButton: {
    backgroundColor: '#FFEDD5',
  },

  missedText: {
    color: '#C2410C',
  },

  deleteButton: {
    backgroundColor: '#FEE2E2',
    marginTop: 10,
  },

  deleteText: {
    color: '#B91C1C',
  },

  lockedContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  lockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  lockedText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
  },

  cancelText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});