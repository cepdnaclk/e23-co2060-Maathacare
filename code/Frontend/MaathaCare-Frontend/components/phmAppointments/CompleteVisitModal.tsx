import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trash2, X } from 'lucide-react-native';

import { COLORS } from './appointmentHelpers';
import type { Appointment, Supplement } from './appointmentTypes';

interface Props {
  visible: boolean;
  appointment: Appointment | null;

  remarks: string;
  additionalNotes: string;
  nextDate: string;
  nextTime: string;
  supplements: Supplement[];

  onChangeRemarks: (value: string) => void;
  onChangeAdditionalNotes: (value: string) => void;
  onChangeNextDate: (value: string) => void;
  onChangeNextTime: (value: string) => void;

  onAddSupplement: () => void;
  onUpdateSupplement: (
    index: number,
    field: 'name' | 'dosage' | 'instructions',
    value: string,
  ) => void;
  onRemoveSupplement: (index: number) => void;

  onSubmit: () => void;
  onClose: () => void;
}

export default function CompleteVisitModal({
  visible,
  appointment,
  remarks,
  additionalNotes,
  nextDate,
  nextTime,
  supplements,
  onChangeRemarks,
  onChangeAdditionalNotes,
  onChangeNextDate,
  onChangeNextTime,
  onAddSupplement,
  onUpdateSupplement,
  onRemoveSupplement,
  onSubmit,
  onClose,
}: Props) {
  const motherName = appointment?.motherName ?? 'Selected Mother';
  const gestationalAge = appointment?.gestationalAge ?? '';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Sticky-style header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>Clinical Visit Summary</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.patientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🤰</Text>
            </View>

            <View>
              <Text style={styles.patientName}>{motherName}</Text>

              {!!gestationalAge && (
                <Text style={styles.patientSubText}>{gestationalAge}</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bodyContent}
        >
          <Section title="Clinical Notes">
            <TextInput
              value={remarks}
              onChangeText={onChangeRemarks}
              placeholder="Enter examination findings, diagnosis and health advice..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </Section>

          <Section title="Prescribed Supplements">
            <View style={styles.supplementList}>
              {supplements.map((supplement, index) => (
                <View key={supplement.id ?? index.toString()} style={styles.supplementCard}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemoveSupplement(index)}
                    activeOpacity={0.85}
                  >
                    <Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                  </TouchableOpacity>

                  <View style={styles.twoColumnRow}>
                    <InputField
                      label="Supplement Name"
                      value={supplement.name}
                      onChange={(value) => onUpdateSupplement(index, 'name', value)}
                      placeholder="e.g. Folic Acid"
                    />

                    <InputField
                      label="Dosage"
                      value={supplement.dosage ?? ''}
                      onChange={(value) => onUpdateSupplement(index, 'dosage', value)}
                      placeholder="e.g. 5mg"
                    />
                  </View>

                  <View style={styles.instructionsWrapper}>
                    <InputField
                      label="Instructions"
                      value={supplement.instructions}
                      onChange={(value) =>
                        onUpdateSupplement(index, 'instructions', value)
                      }
                      placeholder="e.g. Once daily with food"
                    />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addSupplementButton}
              onPress={onAddSupplement}
              activeOpacity={0.85}
            >
              <Plus size={17} color={COLORS.primary} strokeWidth={2.7} />
              <Text style={styles.addSupplementText}>Add Supplement</Text>
            </TouchableOpacity>
          </Section>

          <Section title="Next Clinic Appointment">
            <View style={styles.twoColumnRow}>
              <InputField
                label="Date"
                value={nextDate}
                onChange={onChangeNextDate}
                placeholder="YYYY-MM-DD"
              />

              <InputField
                label="Time"
                value={nextTime}
                onChange={onChangeNextTime}
                placeholder="HH:MM"
              />
            </View>
          </Section>

          <Section title="Additional Notes">
            <TextInput
              value={additionalNotes}
              onChangeText={onChangeAdditionalNotes}
              placeholder="Any additional observations or recommendations..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={styles.additionalNotesInput}
            />
          </Section>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButtonWrapper}
            onPress={onSubmit}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>Save Visit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
  },

  patientName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  patientSubText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    marginTop: 2,
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },

  notesInput: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 22,
  },

  additionalNotesInput: {
    width: '100%',
    minHeight: 90,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 22,
  },

  supplementList: {
    gap: 12,
  },

  supplementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },

  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  instructionsWrapper: {
    marginTop: 10,
  },

  inputWrapper: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: 13,
    color: '#0F172A',
  },

  addSupplementButton: {
    width: '100%',
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  addSupplementText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
  },

  saveButtonWrapper: {
    flex: 2,
  },

  saveButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});