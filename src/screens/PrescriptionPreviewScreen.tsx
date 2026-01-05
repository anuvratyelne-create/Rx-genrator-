import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card } from '../components';
import { useDoctorStore } from '../store/doctorStore';
import { getPrescriptionById } from '../database/repositories';
import {
  generatePrescriptionPdf,
  sharePrescriptionPdf,
  printPrescription,
} from '../services/pdfGenerator';
import type { Prescription, PrescriptionItem } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrescriptionPreview'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PrescriptionPreviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Props['route']>();
  const { prescriptionId } = route.params;
  const { doctor } = useDoctorStore();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    try {
      const rx = await getPrescriptionById(prescriptionId);
      setPrescription(rx);
      if (rx?.pdfPath) {
        setPdfPath(rx.pdfPath);
      }
    } catch (error) {
      console.error('Failed to load prescription:', error);
      Alert.alert('Error', 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!prescription || !doctor || !prescription.patient) return;

    setGenerating(true);
    try {
      const path = await generatePrescriptionPdf({
        doctor,
        patient: prescription.patient,
        prescription,
        items: prescription.items || [],
      });
      setPdfPath(path);
      Alert.alert('Success', 'PDF generated successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!prescription || !doctor || !prescription.patient) return;

    setGenerating(true);
    try {
      let path = pdfPath;
      if (!path) {
        path = await generatePrescriptionPdf({
          doctor,
          patient: prescription.patient,
          prescription,
          items: prescription.items || [],
        });
        setPdfPath(path);
      }
      await sharePrescriptionPdf(path);
    } catch (error) {
      console.error('Failed to share:', error);
      Alert.alert('Error', 'Failed to share prescription');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!prescription || !doctor || !prescription.patient) return;

    try {
      await printPrescription({
        doctor,
        patient: prescription.patient,
        prescription,
        items: prescription.items || [],
      });
    } catch (error) {
      console.error('Failed to print:', error);
      Alert.alert('Error', 'Failed to print prescription');
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatInstruction = (instruction?: string) => {
    const map: Record<string, string> = {
      'Before food': 'BF',
      'After food': 'AF',
      'With food': 'WF',
      'Empty stomach': 'ES',
      'At bedtime': 'HS',
      'As needed': 'SOS',
    };
    return map[instruction || ''] || instruction || '';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!prescription || !prescription.patient) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Prescription not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <Card variant="elevated" style={styles.previewCard}>
          {/* Doctor Header */}
          <View style={styles.doctorHeader}>
            <Text style={styles.doctorName}>Dr. {doctor?.name}</Text>
            <Text style={styles.doctorQual}>{doctor?.qualification}</Text>
            <Text style={styles.doctorReg}>Reg. No: {doctor?.registrationNumber}</Text>
            {doctor?.clinicName && (
              <Text style={styles.clinicInfo}>{doctor.clinicName}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Patient Info */}
          <View style={styles.patientRow}>
            <View>
              <Text style={styles.patientLabel}>Patient</Text>
              <Text style={styles.patientName}>{prescription.patient.name}</Text>
              <Text style={styles.patientMeta}>
                {prescription.patient.age} yrs /{' '}
                {prescription.patient.gender === 'M'
                  ? 'Male'
                  : prescription.patient.gender === 'F'
                  ? 'Female'
                  : 'Other'}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Date</Text>
              <Text style={styles.dateValue}>{formatDate(prescription.createdAt)}</Text>
            </View>
          </View>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <>
              <View style={styles.divider} />
              <View style={styles.diagnosisSection}>
                <Text style={styles.sectionLabel}>Diagnosis</Text>
                <Text style={styles.diagnosisText}>{prescription.diagnosis}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Medicines */}
          <View style={styles.rxSection}>
            <Text style={styles.rxSymbol}>℞</Text>
            {prescription.items?.map((item, index) => (
              <View key={item.id} style={styles.medicineRow}>
                <Text style={styles.medicineNumber}>{index + 1}.</Text>
                <View style={styles.medicineDetails}>
                  <Text style={styles.medicineName}>{item.medicineName}</Text>
                  <View style={styles.medicineMetaRow}>
                    <Text style={styles.medicineFreq}>{item.frequency}</Text>
                    <Text style={styles.medicineDuration}>
                      × {item.duration} {item.durationUnit}
                    </Text>
                    {item.instruction && (
                      <View style={styles.instructionBadge}>
                        <Text style={styles.instructionText}>
                          {formatInstruction(item.instruction)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Advice */}
          {prescription.advice && (
            <>
              <View style={styles.divider} />
              <View style={styles.adviceSection}>
                <Text style={styles.sectionLabel}>Advice</Text>
                <Text style={styles.adviceText}>{prescription.advice}</Text>
              </View>
            </>
          )}

          {/* Follow-up */}
          {prescription.followUpDays && (
            <View style={styles.followUpBadge}>
              <Ionicons name="calendar-outline" size={16} color="#2563eb" />
              <Text style={styles.followUpText}>
                Follow-up after {prescription.followUpDays} days
              </Text>
            </View>
          )}

          {/* Signature */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Dr. {doctor?.name}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print-outline" size={24} color="#374151" />
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={24} color="#ffffff" />
                <Text style={[styles.actionText, styles.shareText]}>Share</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleGeneratePdf}>
            <Ionicons name="download-outline" size={24} color="#374151" />
            <Text style={styles.actionText}>Save PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title="Done - Next Patient"
          onPress={handleDone}
          size="xl"
          fullWidth
          icon={<Ionicons name="checkmark-done" size={24} color="#ffffff" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  previewCard: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  doctorHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  doctorQual: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  doctorReg: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  clinicInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  patientMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 2,
  },
  diagnosisSection: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '500',
  },
  rxSection: {
    paddingVertical: 8,
  },
  rxSymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 12,
  },
  medicineRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  medicineNumber: {
    fontSize: 14,
    color: '#6b7280',
    width: 24,
    fontWeight: '500',
  },
  medicineDetails: {
    flex: 1,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  medicineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  medicineFreq: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  medicineDuration: {
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
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  adviceSection: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  adviceText: {
    fontSize: 13,
    color: '#065f46',
    lineHeight: 20,
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  followUpText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  signatureSection: {
    alignItems: 'flex-end',
    marginTop: 24,
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#9ca3af',
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shareButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  shareText: {
    color: '#ffffff',
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
