import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MedicineItemForm } from '../types';

interface MedicineItemProps {
  item: MedicineItemForm;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

export function MedicineItem({ item, index, onEdit, onRemove }: MedicineItemProps) {
  const getInstructionShort = (instruction: string) => {
    const map: Record<string, string> = {
      'Before food': 'BF',
      'After food': 'AF',
      'With food': 'WF',
      'Empty stomach': 'ES',
      'At bedtime': 'HS',
      'As needed': 'SOS',
    };
    return map[instruction] || instruction;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onEdit} activeOpacity={0.7}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.medicineName} numberOfLines={1}>
            {item.medicineName}
          </Text>
          {item.dose && <Text style={styles.dose}>{item.dose}</Text>}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.metaText}>{item.frequency}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text style={styles.metaText}>
                {item.duration} {item.durationUnit}
              </Text>
            </View>

            {item.instruction && (
              <View style={[styles.metaItem, styles.instructionBadge]}>
                <Text style={styles.instructionText}>
                  {getInstructionShort(item.instruction)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  dose: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  instructionBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  removeButton: {
    padding: 12,
  },
});
