import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input, Chip, Button, MedicineItem, MedicineSearchModal } from '../components';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { useDoctorStore } from '../store/doctorStore';
import { searchPatients } from '../database/repositories';
import { COMMON_DIAGNOSES, COMMON_ADVICE, type Patient, type MedicineItemForm } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NewPrescriptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { doctor } = useDoctorStore();
  const {
    currentForm,
    selectedPatient,
    patientSuggestions,
    isSubmitting,
    setPatientField,
    setDiagnosis,
    setAdvice,
    setFollowUpDays,
    addMedicine,
    updateMedicine,
    removeMedicine,
    selectPatient,
    searchPatientsByName,
    submitPrescription,
  } = usePrescriptionStore();

  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingMedicineIndex, setEditingMedicineIndex] = useState<number | null>(null);
  const [showDiagnosisChips, setShowDiagnosisChips] = useState(true);
  const [showAdviceChips, setShowAdviceChips] = useState(false);

  // Patient search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentForm.patient.name && !selectedPatient) {
        searchPatientsByName(currentForm.patient.name);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentForm.patient.name, selectedPatient]);

  const handlePatientSelect = (patient: Patient) => {
    selectPatient(patient);
  };

  const handleAddMedicine = (medicine: MedicineItemForm) => {
    if (editingMedicineIndex !== null) {
      updateMedicine(editingMedicineIndex, medicine);
      setEditingMedicineIndex(null);
    } else {
      addMedicine(medicine);
    }
  };

  const handleEditMedicine = (index: number) => {
    setEditingMedicineIndex(index);
    setShowMedicineModal(true);
  };

  const handleRemoveMedicine = (index: number) => {
    Alert.alert('Remove Medicine', 'Are you sure you want to remove this medicine?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMedicine(index) },
    ]);
  };

  const handleDiagnosisChip = (diagnosis: string) => {
    const current = currentForm.diagnosis;
    if (current) {
      setDiagnosis(`${current}, ${diagnosis}`);
    } else {
      setDiagnosis(diagnosis);
    }
  };

  const handleAdviceChip = (advice: string) => {
    const current = currentForm.advice;
    if (current) {
      setAdvice(`${current}\n${advice}`);
    } else {
      setAdvice(advice);
    }
  };

  const validateForm = (): boolean => {
    if (!currentForm.patient.name.trim()) {
      Alert.alert('Missing Information', 'Please enter patient name');
      return false;
    }
    if (currentForm.medicines.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one medicine');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !doctor) return;

    try {
      const prescription = await submitPrescription(doctor.id);
      navigation.replace('PrescriptionPreview', { prescriptionId: prescription.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to save prescription. Please try again.');
      console.error('Failed to submit prescription:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Patient Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PATIENT</Text>
            <Input
              placeholder="Patient name"
              value={currentForm.patient.name}
              onChangeText={(text) => setPatientField('name', text)}
              leftIcon={<Ionicons name="person-outline" size={20} color="#9ca3af" />}
              autoCapitalize="words"
            />

            {/* Patient Suggestions */}
            {patientSuggestions.length > 0 && !selectedPatient && (
              <View style={styles.suggestions}>
                {patientSuggestions.map((patient) => (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.suggestionItem}
                    onPress={() => handlePatientSelect(patient)}
                  >
                    <Text style={styles.suggestionName}>{patient.name}</Text>
                    <Text style={styles.suggestionMeta}>
                      {patient.gender}, {patient.age} yrs
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.flex}>
                <Input
                  placeholder="Age"
                  value={currentForm.patient.age}
                  onChangeText={(text) => setPatientField('age', text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  containerStyle={styles.ageInput}
                />
              </View>
              <View style={styles.genderButtons}>
                {(['M', 'F', 'O'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      currentForm.patient.gender === g && styles.genderButtonSelected,
                    ]}
                    onPress={() => setPatientField('gender', g)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        currentForm.patient.gender === g && styles.genderTextSelected,
                      ]}
                    >
                      {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Diagnosis Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
              <Text style={styles.optional}>(optional)</Text>
            </View>
            <Input
              placeholder="Enter diagnosis"
              value={currentForm.diagnosis}
              onChangeText={setDiagnosis}
              multiline
            />
            {showDiagnosisChips && (
              <View style={styles.chipGrid}>
                {COMMON_DIAGNOSES.slice(0, 8).map((d) => (
                  <Chip key={d} label={d} onPress={() => handleDiagnosisChip(d)} size="sm" />
                ))}
              </View>
            )}
          </View>

          {/* Medicines Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEDICINES</Text>

            {currentForm.medicines.map((medicine, index) => (
              <MedicineItem
                key={medicine.id}
                item={medicine}
                index={index}
                onEdit={() => handleEditMedicine(index)}
                onRemove={() => handleRemoveMedicine(index)}
              />
            ))}

            <TouchableOpacity
              style={styles.addMedicineButton}
              onPress={() => {
                setEditingMedicineIndex(null);
                setShowMedicineModal(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color="#2563eb" />
              <Text style={styles.addMedicineText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>

          {/* Advice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ADVICE</Text>
              <TouchableOpacity onPress={() => setShowAdviceChips(!showAdviceChips)}>
                <Ionicons
                  name={showAdviceChips ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            <Input
              placeholder="Instructions for patient"
              value={currentForm.advice}
              onChangeText={setAdvice}
              multiline
              numberOfLines={3}
            />
            {showAdviceChips && (
              <View style={styles.chipGrid}>
                {COMMON_ADVICE.slice(0, 6).map((a) => (
                  <Chip key={a} label={a} onPress={() => handleAdviceChip(a)} size="sm" />
                ))}
              </View>
            )}
          </View>

          {/* Follow-up Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FOLLOW-UP</Text>
            <View style={styles.followUpRow}>
              {['3', '5', '7', '14', '30'].map((days) => (
                <Chip
                  key={days}
                  label={`${days} days`}
                  selected={currentForm.followUpDays === days}
                  onPress={() =>
                    setFollowUpDays(currentForm.followUpDays === days ? '' : days)
                  }
                  variant="primary"
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          <Button
            title="Generate Prescription"
            onPress={handleSubmit}
            size="xl"
            fullWidth
            loading={isSubmitting}
            disabled={currentForm.medicines.length === 0}
            icon={<Ionicons name="checkmark-circle" size={24} color="#ffffff" />}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Medicine Modal */}
      <MedicineSearchModal
        visible={showMedicineModal}
        onClose={() => {
          setShowMedicineModal(false);
          setEditingMedicineIndex(null);
        }}
        onAdd={handleAddMedicine}
        initialMedicine={
          editingMedicineIndex !== null
            ? currentForm.medicines[editingMedicineIndex]
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  optional: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    marginBottom: 0,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  genderButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  genderTextSelected: {
    color: '#ffffff',
  },
  suggestions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: -8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  suggestionMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  addMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    gap: 8,
  },
  addMedicineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  followUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
