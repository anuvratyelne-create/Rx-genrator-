import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../components';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { getTemplates, deleteTemplate, incrementTemplateUseCount } from '../database/repositories';
import type { Template, MedicineItemForm } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { resetForm, setDiagnosis, setAdvice, addMedicine } = usePrescriptionStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      await incrementTemplateUseCount(template.id);
      resetForm();

      if (template.diagnosis) {
        setDiagnosis(template.diagnosis);
      }

      if (template.advice) {
        setAdvice(template.advice);
      }

      const medicines: MedicineItemForm[] = JSON.parse(template.medicinesJson);
      medicines.forEach((med) => addMedicine(med));

      navigation.navigate('NewPrescription');
    } catch (error) {
      console.error('Failed to use template:', error);
      Alert.alert('Error', 'Failed to load template');
    }
  };

  const handleDeleteTemplate = (template: Template) => {
    Alert.alert('Delete Template', `Are you sure you want to delete "${template.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTemplate(template.id);
            setTemplates(templates.filter((t) => t.id !== template.id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete template');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Template }) => {
    const medicines: MedicineItemForm[] = JSON.parse(item.medicinesJson);

    return (
      <Card variant="outlined" style={styles.templateCard}>
        <View style={styles.cardHeader}>
          <View style={styles.templateIcon}>
            <Ionicons name="copy" size={20} color="#9333ea" />
          </View>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{item.name}</Text>
            {item.diagnosis && (
              <Text style={styles.templateDiagnosis}>{item.diagnosis}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTemplate(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.medicinesList}>
          {medicines.slice(0, 3).map((med, index) => (
            <Text key={index} style={styles.medicineText} numberOfLines={1}>
              {index + 1}. {med.medicineName}
            </Text>
          ))}
          {medicines.length > 3 && (
            <Text style={styles.moreText}>+{medicines.length - 3} more</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.useCount}>Used {item.useCount} times</Text>
          <Button
            title="Use Template"
            onPress={() => handleUseTemplate(item)}
            size="sm"
          />
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="copy-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No templates yet</Text>
      <Text style={styles.emptySubtitle}>
        Save your frequently used prescription patterns as templates for quick access
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  templateCard: {
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  templateDiagnosis: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  medicinesList: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  medicineText: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
