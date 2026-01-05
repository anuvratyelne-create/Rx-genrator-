import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/database/init';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }
    prepare();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-red-500 text-lg text-center">
          Failed to initialize: {error}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-600">
        <Text className="text-white text-2xl font-bold mb-4">RxFast</Text>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white/80 mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
