import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components';
import { useDoctorStore } from '../store/doctorStore';
import { useThemeStore } from '../store/themeStore';
import { resetDatabase } from '../database/init';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { doctor } = useDoctorStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all patients, prescriptions, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    iconColor = '#6b7280',
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Profile */}
        <Card variant="outlined" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color="#2563eb" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Dr. {doctor?.name}</Text>
              <Text style={styles.profileQual}>{doctor?.qualification}</Text>
              <Text style={styles.profileReg}>Reg: {doctor?.registrationNumber}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('DoctorSetup')}
          >
            <Ionicons name="create-outline" size={18} color="#2563eb" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card variant="outlined" style={styles.settingsCard}>
          <SettingItem
            icon="moon-outline"
            iconColor="#6366f1"
            title="Dark Mode"
            subtitle="Easier on eyes during night"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                thumbColor={isDark ? '#2563eb' : '#ffffff'}
              />
            }
          />
        </Card>

        {/* Data */}
        <Text style={styles.sectionTitle}>DATA</Text>
        <Card variant="outlined" style={styles.settingsCard}>
          <SettingItem
            icon="document-text-outline"
            iconColor="#16a34a"
            title="Prescription History"
            subtitle="View all past prescriptions"
            onPress={() => navigation.navigate('History')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="copy-outline"
            iconColor="#9333ea"
            title="Saved Templates"
            subtitle="Manage prescription templates"
            onPress={() => navigation.navigate('Templates')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="cloud-upload-outline"
            iconColor="#0891b2"
            title="Backup & Sync"
            subtitle="Coming soon"
          />
        </Card>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <Card variant="outlined" style={styles.settingsCard}>
          <SettingItem
            icon="trash-outline"
            iconColor="#ef4444"
            title="Reset All Data"
            subtitle="Delete all data and start fresh"
            onPress={handleResetData}
          />
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <Card variant="outlined" style={styles.settingsCard}>
          <SettingItem
            icon="information-circle-outline"
            iconColor="#6b7280"
            title="Version"
            subtitle="1.0.0"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="heart-outline"
            iconColor="#ec4899"
            title="Made for Indian Doctors"
            subtitle="Built with speed in mind"
          />
        </Card>

        <Text style={styles.footer}>
          RxFast - The fastest prescription generator{'\n'}
          for Indian doctors
        </Text>
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
    padding: 16,
  },
  profileCard: {
    padding: 16,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileQual: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profileReg: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 66,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 24,
    marginBottom: 24,
    lineHeight: 20,
  },
});
