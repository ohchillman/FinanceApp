import React from 'react';
import { Image, StyleSheet, Platform, Dimensions, View } from 'react-native';
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

// Компонент для иконки таба с точным позиционированием
const TabBarIcon = ({ source, color }) => {
  return (
    <View style={styles.iconContainer}>
      <Image 
        source={source}
        style={[styles.tabIcon, { tintColor: color }]}
        resizeMode="contain"
      />
    </View>
  );
};

// Основной навигатор приложения
const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          // Устанавливаем полную ширину экрана
          width: screenWidth,
          // Убираем горизонтальные отступы
          paddingHorizontal: 0,
          // Убираем левый и правый отступы
          marginLeft: 0,
          marginRight: 0,
          // Убираем все возможные отступы
          left: 0,
          right: 0,
          position: 'absolute',
          // Добавляем стили для равномерного распределения
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
        headerShown: false,
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 5 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
          // Центрируем текст
          textAlign: 'center',
        },
        // Устанавливаем равную ширину для каждого элемента
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
        },
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
      }}
      tabBarOptions={{
        style: {
          width: screenWidth,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={require('../../assets/icons/home.png')} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ExpensesListTab" 
        component={ExpensesListStack} 
        options={{
          tabBarLabel: 'Расходы',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={require('../../assets/icons/list.png')} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddExpenseTab" 
        component={AddExpenseStack} 
        options={{
          tabBarLabel: 'Добавить',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={require('../../assets/icons/plus.png')} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AnalyticsTab" 
        component={AnalyticsStack} 
        options={{
          tabBarLabel: 'Аналитика',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={require('../../assets/icons/chart.png')} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack} 
        options={{
          tabBarLabel: 'Настройки',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={require('../../assets/icons/settings.png')} color={color} />
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
  iconContainer: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
  }
});

export default AppNavigator;
