import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Импорт экранов из соответствующих директорий
import HomeScreen from '../screens/home/HomeScreen';
import AddExpenseScreen from '../screens/expense/AddExpenseScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/CurrencySettingsScreen';

import { View, Text } from 'react-native';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Стек навигации для главного экрана
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.TEXT_INVERSE,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Мои расходы' }} />
  </Stack.Navigator>
);

// Стек навигации для экрана добавления расхода
const AddExpenseStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.TEXT_INVERSE,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Добавить расход' }} />
  </Stack.Navigator>
);

// Стек навигации для экрана аналитики
const AnalyticsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.TEXT_INVERSE,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Аналитика' }} />
  </Stack.Navigator>
);

// Стек навигации для экрана настроек
const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.PRIMARY,
      },
      headerTintColor: COLORS.TEXT_INVERSE,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
  </Stack.Navigator>
);

// Основной навигатор приложения
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.PRIMARY,
          tabBarInactiveTintColor: COLORS.GRAY_500,
          tabBarStyle: {
            backgroundColor: COLORS.SURFACE,
            borderTopColor: COLORS.GRAY_200,
            paddingBottom: 5,
            paddingTop: 5,
          },
        }}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack} 
          options={{
            tabBarLabel: 'Главная',
            headerShown: false,
            // tabBarIcon будет добавлен позже
          }}
        />
        <Tab.Screen 
          name="AddExpenseTab" 
          component={AddExpenseStack} 
          options={{
            tabBarLabel: 'Добавить',
            headerShown: false,
            // tabBarIcon будет добавлен позже
          }}
        />
        <Tab.Screen 
          name="AnalyticsTab" 
          component={AnalyticsStack} 
          options={{
            tabBarLabel: 'Аналитика',
            headerShown: false,
            // tabBarIcon будет добавлен позже
          }}
        />
        <Tab.Screen 
          name="SettingsTab" 
          component={SettingsStack} 
          options={{
            tabBarLabel: 'Настройки',
            headerShown: false,
            // tabBarIcon будет добавлен позже
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
