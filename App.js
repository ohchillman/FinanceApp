import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <ExpenseProvider>
        <SubscriptionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SubscriptionProvider>
      </ExpenseProvider>
    </>
  );
}
