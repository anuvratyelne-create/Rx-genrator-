import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './Input';
import { Chip } from './Chip';
import { Button } from './Button';
import type { Medicine, MedicineItemForm } from '../types';
import { searchMedicines, getTopMedicines } from '../database/repositories';
import { FREQUENCY_OPTIONS, DURATION_OPTIONS, INSTRUCTION_OPTIONS } from '../types';
import uuid from 'react-native-uuid';

interface MedicineSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (medicine: MedicineItemForm) => void;
  initialMedicine?: MedicineItemForm;
}

export function MedicineSearchModal({
  visible,
  onClose,
  onAdd,
  initialMedicine,
}: MedicineSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [topMedicines, setTopMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Form state
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('3');
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [instruction, setInstruction] = useState('After food');

  // Step tracking
  const [step, setStep] = useState<'search' | 'details'>('search');

  useEffect(() => {
    if (visible) {
      loadTopMedicines();
      if (initialMedicine) {
        setMedicineName(initialMedicine.medicineName);
        setDose(initialMedicine.dose);
        setFrequency(initialMedicine.frequency);
        setDuration(initialMedicine.duration);
        setDurationUnit(initialMedicine.durationUnit);
        setInstruction(initialMedicine.instruction);
        setStep('details');
      } else {
        resetForm();
      }
    }
  }, [visible, initialMedicine]);

  const loadTopMedicines = async () => {
    try {
      const medicines = await getTopMedicines(8);
      setTopMedicines(medicines);
    } catch (error) {
      console.error('Failed to load top medicines:', error);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedMedicine(null);
    setMedicineName('');
    setDose('');
    setFrequency('1-0-1');
    setDuration('3');
    setDurationUnit('days');
    setInstruction('After food');
    setStep('search');
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const results = await searchMedicines(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to search medicines:', error);
      }
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setMedicineName(
      `${medicine.genericName}${medicine.strength ? ` ${medicine.strength}` : ''}`
    );
    setDose(medicine.defaultDose || '1 tab');
    setFrequency(medicine.defaultFrequency || '1-0-1');
    setDuration(medicine.defaultDuration || '3');
    setInstruction(medicine.defaultInstruction || 'After food');
    setStep('details');
  };

  const handleCustomMedicine = () => {
    setMedicineName(searchQuery);
    setStep('details');
  };

  const handleAdd = () => {
    const medicineItem: MedicineItemForm = {
      id: initialMedicine?.id || (uuid.v4() as string),
      medicineName,
      dose,
      frequency,
      duration,
      durationUnit,
      instruction,
    };
    onAdd(medicineItem);
    onClose();
    resetForm();
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={styles.medicineItem}
      onPress={() => handleSelectMedicine(item)}
    >
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>
          {item.genericName}
          {item.strength && (
            <Text style={styles.medicineStrength}> {item.strength}</Text>
          )}
        </Text>
        {item.useCount > 0 && (
          <View style={styles.frequentBadge}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.frequentText}>Frequently used</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step === 'details' && !initialMedicine) {
                setStep('search');
              } else {
                onClose();
                resetForm();
              }
            }}
          >
            <Ionicons
              name={step === 'details' && !initialMedicine ? 'arrow-back' : 'close'}
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initialMedicine ? 'Edit Medicine' : step === 'search' ? 'Add Medicine' : 'Medicine Details'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {step === 'search' ? (
          // Search Step
          <View style={styles.searchStep}>
            <Input
              placeholder="Search medicine..."
              value={searchQuery}
              onChangeText={handleSearch}
              leftIcon={<Ionicons name="search" size={20} color="#9ca3af" />}
              autoFocus
            />

            {searchQuery.length >= 2 && suggestions.length === 0 && (
              <TouchableOpacity style={styles.customButton} onPress={handleCustomMedicine}>
                <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
                <Text style={styles.customButtonText}>Add "{searchQuery}" as custom medicine</Text>
              </TouchableOpacity>
            )}

            {suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={renderMedicineItem}
                style={styles.list}
                keyboardShouldPersistTaps="handled"
              />
            ) : searchQuery.length < 2 && topMedicines.length > 0 ? (
              <View style={styles.topSection}>
                <Text style={styles.sectionTitle}>Your frequently used</Text>
                <FlatList
                  data={topMedicines}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMedicineItem}
                  style={styles.list}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            ) : null}
          </View>
        ) : (
          // Details Step
          <ScrollView style={styles.detailsStep} keyboardShouldPersistTaps="handled">
            <Input
              label="Medicine Name"
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="e.g., Paracetamol 500mg"
            />

            <Input
              label="Dose"
              value={dose}
              onChangeText={setDose}
              placeholder="e.g., 1 tab, 5ml"
            />

            <Text style={styles.sectionLabel}>Frequency</Text>
            <View style={styles.chipGrid}>
              {FREQUENCY_OPTIONS.slice(0, 8).map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={frequency === opt.value}
                  onPress={() => setFrequency(opt.value)}
                  variant="primary"
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.chipGrid}>
              {DURATION_OPTIONS.map((opt) => (
                <Chip
                  key={`${opt.value}-${opt.unit}`}
                  label={opt.label}
                  selected={duration === opt.value && durationUnit === opt.unit}
                  onPress={() => {
                    setDuration(opt.value);
                    setDurationUnit(opt.unit as 'days' | 'weeks' | 'months');
                  }}
                  variant="primary"
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Instructions</Text>
            <View style={styles.chipGrid}>
              {INSTRUCTION_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={instruction === opt.value}
                  onPress={() => setInstruction(opt.value)}
                  variant="success"
                />
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={initialMedicine ? 'Update Medicine' : 'Add to Prescription'}
                onPress={handleAdd}
                size="lg"
                fullWidth
                disabled={!medicineName.trim()}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchStep: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  medicineStrength: {
    fontWeight: '400',
    color: '#6b7280',
  },
  frequentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  frequentText: {
    fontSize: 12,
    color: '#d97706',
  },
  topSection: {
    flex: 1,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  customButtonText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '500',
  },
  detailsStep: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});
