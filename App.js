import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ExpenseProvider>
        <SubscriptionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SubscriptionProvider>
      </ExpenseProvider>
    </SafeAreaProvider>
  );
}
