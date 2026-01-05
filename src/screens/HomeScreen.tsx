import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../components';
import { useDoctorStore } from '../store/doctorStore';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { getPatients } from '../database/repositories';
import type { Patient } from '../types';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { doctor, loadDoctor } = useDoctorStore();
  const { lastPrescription, loadLastPrescription, resetForm, repeatLastPrescription, selectPatient } =
    usePrescriptionStore();

  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadDoctor(), loadLastPrescription(), loadRecentPatients()]);
  };

  const loadRecentPatients = async () => {
    try {
      const patients = await getPatients(5);
      setRecentPatients(patients);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNewPrescription = () => {
    resetForm();
    navigation.navigate('NewPrescription');
  };

  const handleRepeatLast = () => {
    if (lastPrescription) {
      resetForm();
      repeatLastPrescription();
      navigation.navigate('NewPrescription');
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    resetForm();
    selectPatient(patient);
    navigation.navigate('NewPrescription');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatLastVisit = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Show onboarding if doctor not set up
  if (!doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.onboarding}>
          <View style={styles.logoContainer}>
            <Ionicons name="medical" size={64} color="#2563eb" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to RxFast</Text>
          <Text style={styles.welcomeSubtitle}>
            The fastest prescription generator for Indian doctors
          </Text>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('DoctorSetup')}
            size="xl"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.doctorName}>Dr. {doctor.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Main Actions */}
        <TouchableOpacity style={styles.mainAction} onPress={handleNewPrescription}>
          <View style={styles.mainActionIcon}>
            <Ionicons name="add" size={32} color="#ffffff" />
          </View>
          <Text style={styles.mainActionText}>NEW PRESCRIPTION</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, !lastPrescription && styles.quickActionDisabled]}
            onPress={handleRepeatLast}
            disabled={!lastPrescription}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="repeat" size={24} color="#16a34a" />
            </View>
            <Text style={styles.quickActionText}>Repeat Last</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="document-text-outline" size={24} color="#d97706" />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Templates')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="copy-outline" size={24} color="#9333ea" />
            </View>
            <Text style={styles.quickActionText}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Patients */}
        {recentPatients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT PATIENTS</Text>
            {recentPatients.map((patient) => (
              <Card
                key={patient.id}
                variant="outlined"
                style={styles.patientCard}
                onPress={() => handlePatientSelect(patient)}
              >
                <View style={styles.patientInfo}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.patientInitial}>
                      {patient.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.patientDetails}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientMeta}>
                      {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : ''}
                      {patient.age && `, ${patient.age} yrs`}
                      {' • '}
                      {formatLastVisit(patient.lastVisit)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recentPatients.length}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {recentPatients.reduce((sum, p) => sum + p.visitCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Prescriptions</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mainAction: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mainActionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  patientCard: {
    marginBottom: 8,
    padding: 14,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  patientMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },

  // Onboarding
  onboarding: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
});
