import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { API_BASE_URL } from '../../constants/apiConfig';
import AppointmentActionModal from './AppointmentActionModal';
import AppointmentCard from './AppointmentCard';
import CalendarPickerModal from './CalendarPickerModal';
import CompleteVisitModal from './CompleteVisitModal';
import DateSelector from './DateSelector';
import Header from './Header';
import { COLORS, getTodayDate } from './appointmentHelpers';
import type { Appointment, Supplement } from './appointmentTypes';

interface Props {
  phmUserId: string;
  onAddNew: () => void;
  refreshTrigger?: number;
}

export default function PhmAppointments({
  phmUserId,
  onAddNew,
  refreshTrigger,
}: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  const [remarks, setRemarks] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');
  const [supplements, setSupplements] = useState<Supplement[]>([]);

  const [selectedFullDate, setSelectedFullDate] = useState(getTodayDate());

  useFocusEffect(
    useCallback(() => {
      if (phmUserId) {
        loadAppointments();
      }
    }, [phmUserId, refreshTrigger]),
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');

      const appointmentResponse = await fetch(
        `${API_BASE_URL}/api/appointments/phm/${phmUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (appointmentResponse.ok) {
        const data = await appointmentResponse.json();
        setAppointments(data);
      } else {
        Alert.alert('Error', 'Failed to load appointments.');
      }
    } catch (error) {
      console.error('Appointment loading error:', error);
      Alert.alert(
        'Error',
        'Network error occurred while loading appointments.',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectDate = (date: string) => {
    setSelectedFullDate(date);
    setShowAll(false);
  };

  const openAppointmentActions = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setActionModalVisible(true);
  };

  const closeActionModal = () => {
    setActionModalVisible(false);
    setSelectedAppointment(null);
  };

  const closeCompleteModal = () => {
    setCompleteModalVisible(false);
    setRemarks('');
    setAdditionalNotes('');
    setNextDate('');
    setNextTime('');
    setSupplements([]);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedAppointment?.id) return;

    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${selectedAppointment.id}/status?status=${status}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setActionModalVisible(false);
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        Alert.alert('Error', 'Failed to update appointment status.');
      }
    } catch (error) {
      console.error('Status update error:', error);
      Alert.alert('Error', 'Network error occurred while updating status.');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment?.id) return;

    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${selectedAppointment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setActionModalVisible(false);
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        Alert.alert('Error', 'Failed to delete appointment.');
      }
    } catch (error) {
      console.error('Delete appointment error:', error);
      Alert.alert('Error', 'Network error occurred while deleting appointment.');
    }
  };

  const submitCompletedVisit = async () => {
    if (!selectedAppointment?.id) return;

    try {
      const token = await AsyncStorage.getItem('userToken');

      const payload = {
        remarks,
        additionalNotes,
        nextDate,
        nextTime,
        supplements: supplements.map(({ name, dosage, instructions }) => ({
          name,
          dosage,
          instructions,
        })),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${selectedAppointment.id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setCompleteModalVisible(false);
        setActionModalVisible(false);
        setSelectedAppointment(null);

        setRemarks('');
        setAdditionalNotes('');
        setNextDate('');
        setNextTime('');
        setSupplements([]);

        loadAppointments();

        Alert.alert('Success', 'Clinic visit recorded successfully!');
      } else {
        Alert.alert('Error', 'Failed to save visit data.');
      }
    } catch (error) {
      console.error('Complete visit error:', error);
      Alert.alert('Error', 'Network error occurred while saving visit data.');
    }
  };

  const addSupplementRow = () => {
    setSupplements((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: '',
        dosage: '',
        instructions: '',
      },
    ]);
  };

  const updateSupplement = (
    index: number,
    field: 'name' | 'dosage' | 'instructions',
    value: string,
  ) => {
    setSupplements((current) => {
      const next = [...current];

      next[index] = {
        ...next[index],
        [field]: value,
      };

      return next;
    });
  };

  const removeSupplementRow = (index: number) => {
    setSupplements((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const filteredAppointments = showAll
    ? appointments
    : appointments.filter(
        (appointment) => appointment.fullDate === selectedFullDate,
      );

  return (
    <View style={styles.container}>
      <Header
        appointments={appointments}
        onCalendarPress={() => setIsCalendarOpen(true)}
      />

      <DateSelector
        selectedFullDate={selectedFullDate}
        onSelectDate={selectDate}
      />

      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.listHeader}>Appointments</Text>

            <Text style={styles.listSubHeader}>
              {showAll ? 'All appointments' : selectedFullDate}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.viewAllButton, showAll && styles.viewAllButtonActive]}
            onPress={() => setShowAll((current) => !current)}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.viewAllText, showAll && styles.viewAllTextActive]}
            >
              {showAll ? 'Show Daily' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onPress={() => openAppointmentActions(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🤰</Text>

                <Text style={styles.emptyTitle}>
                  No Appointments Scheduled
                </Text>

                <Text style={styles.emptyText}>
                  No appointments found for this selection. Add a new clinic
                  appointment to continue.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.calendarFab}
          onPress={() => setIsCalendarOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.calendarFabIcon}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onAddNew} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.addFab}
          >
            <Text style={styles.addFabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <CalendarPickerModal
        visible={isCalendarOpen}
        appointments={appointments}
        selectedFullDate={selectedFullDate}
        onSelectDate={selectDate}
        onClose={() => setIsCalendarOpen(false)}
      />

      <AppointmentActionModal
        visible={actionModalVisible}
        appointment={selectedAppointment}
        onClose={closeActionModal}
        onCompletePress={() => {
          setActionModalVisible(false);
          setCompleteModalVisible(true);
        }}
        onMarkMissed={() => handleUpdateStatus('MISSED')}
        onDelete={handleDeleteAppointment}
      />

      <CompleteVisitModal
        visible={completeModalVisible}
        appointment={selectedAppointment}
        remarks={remarks}
        additionalNotes={additionalNotes}
        nextDate={nextDate}
        nextTime={nextTime}
        supplements={supplements}
        onChangeRemarks={setRemarks}
        onChangeAdditionalNotes={setAdditionalNotes}
        onChangeNextDate={setNextDate}
        onChangeNextTime={setNextTime}
        onAddSupplement={addSupplementRow}
        onUpdateSupplement={updateSupplement}
        onRemoveSupplement={removeSupplementRow}
        onSubmit={submitCompletedVisit}
        onClose={closeCompleteModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  listHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  listSubHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2,
  },

  viewAllButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  viewAllButtonActive: {
    backgroundColor: COLORS.primary,
  },

  viewAllText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '800',
  },

  viewAllTextActive: {
    color: '#FFFFFF',
  },

  loader: {
    marginTop: 50,
  },

  listContent: {
    paddingBottom: 120,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  fabContainer: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    alignItems: 'center',
    gap: 12,
  },

  calendarFab: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },

  calendarFabIcon: {
    fontSize: 20,
  },

  addFab: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },

  addFabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
});