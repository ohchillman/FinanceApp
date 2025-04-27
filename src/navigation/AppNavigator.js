import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Компонент для таба с точным позиционированием
const CustomTabBarItem = ({ label, icon, isFocused, onPress, color }) => {
  return (
    <View style={styles.tabItem}>
      <View style={styles.iconWrapper}>
        <Image 
          source={icon}
          style={[styles.tabIcon, { tintColor: color }]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
};

// Основной навигатор приложения
const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingHorizontal: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          marginTop: 0,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/icons/home.png')}
              style={[styles.tabIcon, { tintColor: color }]}
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
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/icons/list.png')}
              style={[styles.tabIcon, { tintColor: color }]}
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
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/icons/plus.png')}
              style={[styles.tabIcon, { tintColor: color }]}
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
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/icons/chart.png')}
              style={[styles.tabIcon, { tintColor: color }]}
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
          tabBarIcon: ({ color, focused }) => (
            <Image 
              source={require('../../assets/icons/settings.png')}
              style={[styles.tabIcon, { tintColor: color }]}
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
        }}
      />
      <Tab.Screen 
        name="VoiceRecognitionTab" 
        component={VoiceRecognitionStack} 
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
  }
});

export default AppNavigator;
