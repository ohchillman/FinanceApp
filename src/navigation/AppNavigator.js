import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Импорт экранов из соответствующих директорий
import HomeScreen from '../screens/home/HomeScreen';
import ExpensesListScreen from '../screens/expense/ExpensesListScreen';
import AddExpenseScreen from '../screens/expense/AddExpenseScreen';
import TextRecognitionScreen from '../screens/expense/TextRecognitionScreen';
import VoiceRecognitionScreen from '../screens/expense/VoiceRecognitionScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/CurrencySettingsScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';

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
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
  </Stack.Navigator>
);

// Стек навигации для экрана списка расходов
const ExpensesListStack = () => (
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
    <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ title: 'Мои расходы' }} />
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

// Стек навигации для экрана текстового распознавания
const TextRecognitionStack = () => (
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
    <Stack.Screen name="TextRecognition" component={TextRecognitionScreen} options={{ title: 'Распознавание текста' }} />
  </Stack.Navigator>
);

// Стек навигации для экрана голосового распознавания
const VoiceRecognitionStack = () => (
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
    <Stack.Screen name="VoiceRecognition" component={VoiceRecognitionScreen} options={{ title: 'Голосовой ввод' }} />
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
    <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} options={{ title: 'Подписка' }} />
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
    <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} options={{ title: 'Подписка' }} />
  </Stack.Navigator>
);

// Основной навигатор приложения
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopColor: COLORS.GRAY_200,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Главная',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../assets/icons/home.png')}
              style={styles.tabIcon}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ExpensesListTab" 
        component={ExpensesListStack} 
        options={{
          tabBarLabel: 'Расходы',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../assets/icons/list.png')}
              style={styles.tabIcon}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="AddExpenseTab" 
        component={AddExpenseStack} 
        options={{
          tabBarLabel: 'Добавить',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../assets/icons/plus.png')}
              style={styles.tabIcon}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="AnalyticsTab" 
        component={AnalyticsStack} 
        options={{
          tabBarLabel: 'Аналитика',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../assets/icons/chart.png')}
              style={styles.tabIcon}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack} 
        options={{
          tabBarLabel: 'Настройки',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../../assets/icons/settings.png')}
              style={styles.tabIcon}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      
      {/* Скрытые табы для навигации */}
      <Tab.Screen 
        name="TextRecognitionTab" 
        component={TextRecognitionStack} 
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="VoiceRecognitionTab" 
        component={VoiceRecognitionStack} 
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
  }
});

export default AppNavigator;
