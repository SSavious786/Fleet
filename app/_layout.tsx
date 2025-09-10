import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import SplashScreen from './SplashScreen';
import LoginScreen from './(auth)/login';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading, false = not logged in, true = logged in

  useEffect(() => {
    if (!showSplash) {
      // Check login status after splash
      AsyncStorage.getItem('userToken').then((token: string | null) => {
        setIsLoggedIn(!!token);
      });
    }
  }, [showSplash]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoggedIn === null) {
    // Still checking login status
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Dashboard' }} />
        <Stack.Screen name="AddAsset" options={{ title: 'Add New Asset' }} />
        <Stack.Screen name="UpdateAsset" options={{ title: 'Update Asset' }} />
        <Stack.Screen name="AddTicket" options={{ title: 'Add New Ticket' }} />
        <Stack.Screen name="UpdateTicket" options={{ title: 'Update Ticket' }} />
        <Stack.Screen name="AddEquipment" options={{ title: 'Add New Equipment' }} />
        <Stack.Screen name="UpdateEquipment" options={{ title: 'Update New Equipment' }} />
        <Stack.Screen name="AddExpense" options={{ title: 'Add New Expense' }} />
        <Stack.Screen name="UpdateExpense" options={{ title: 'Update Expense' }} />
        <Stack.Screen name="AddService" options={{ title: 'Add New Service' }} />
        <Stack.Screen name="UpdateService" options={{ title: 'Update Service' }} />
        <Stack.Screen name="AddRenewal" options={{ title: 'Add New Renewal' }} />
        <Stack.Screen name="UpdateRenewal" options={{ title: 'Update Renewal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
