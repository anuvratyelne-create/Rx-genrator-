import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input, Button } from '../components';
import { useDoctorStore } from '../store/doctorStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DoctorSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { saveDoctor } = useDoctorStore();

  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (!registrationNumber.trim()) {
      Alert.alert('Required', 'Please enter your registration number');
      return;
    }

    setLoading(true);
    try {
      await saveDoctor({
        name: name.trim(),
        qualification: qualification.trim(),
        registrationNumber: registrationNumber.trim(),
        clinicName: clinicName.trim() || undefined,
        clinicAddress: clinicAddress.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      console.error('Failed to save doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.header}>
            <Text style={styles.title}>Doctor Profile</Text>
            <Text style={styles.subtitle}>
              This information will appear on your prescriptions
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

            <Input
              label="Full Name *"
              placeholder="Dr. John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Input
              label="Qualification"
              placeholder="MBBS, MD"
              value={qualification}
              onChangeText={setQualification}
              autoCapitalize="characters"
            />

            <Input
              label="Registration Number *"
              placeholder="MH/2020/12345"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              autoCapitalize="characters"
            />

            <Text style={[styles.sectionTitle, styles.sectionMargin]}>
              CLINIC DETAILS (OPTIONAL)
            </Text>

            <Input
              label="Clinic Name"
              placeholder="City Medical Center"
              value={clinicName}
              onChangeText={setClinicName}
              autoCapitalize="words"
            />

            <Input
              label="Clinic Address"
              placeholder="123 Main Street, City"
              value={clinicAddress}
              onChangeText={setClinicAddress}
              multiline
            />

            <Input
              label="Phone Number"
              placeholder="9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomAction}>
          <Button
            title="Save & Continue"
            onPress={handleSave}
            size="xl"
            fullWidth
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  form: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionMargin: {
    marginTop: 16,
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
