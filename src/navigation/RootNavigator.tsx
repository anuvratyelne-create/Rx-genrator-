import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  NewPrescriptionScreen,
  PrescriptionPreviewScreen,
  DoctorSetupScreen,
  HistoryScreen,
  SettingsScreen,
  TemplatesScreen,
} from '../screens';

export type RootStackParamList = {
  Home: undefined;
  NewPrescription: undefined;
  PrescriptionPreview: { prescriptionId: string };
  DoctorSetup: undefined;
  History: undefined;
  Settings: undefined;
  Templates: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="NewPrescription"
        component={NewPrescriptionScreen}
        options={({ navigation }) => ({
          title: 'New Prescription',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: -8, padding: 8 }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PrescriptionPreview"
        component={PrescriptionPreviewScreen}
        options={{
          title: 'Preview',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="DoctorSetup"
        component={DoctorSetupScreen}
        options={{
          title: 'Doctor Profile',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Prescription History',
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />

      <Stack.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          title: 'Saved Templates',
        }}
      />
    </Stack.Navigator>
  );
}
