import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUBSCRIPTION_PLANS } from '../constants/subscriptionPlans';

// Создаем контекст для подписок
const SubscriptionContext = createContext();

// Провайдер контекста подписок
export const SubscriptionProvider = ({ children }) => {
  // Состояние для хранения информации о подписке
  const [subscription, setSubscription] = useState({
    status: 'loading', // 'loading', 'free', 'trial', 'premium'
    plan: null,
    expiryDate: null,
    features: []
  });
  
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для отслеживания ошибок
  const [error, setError] = useState(null);
  
  // Загрузка информации о подписке при монтировании компонента
  useEffect(() => {
    loadSubscription();
  }, []);
  
  // Загрузка информации о подписке из хранилища
  const loadSubscription = async () => {
    try {
      setLoading(true);
      
      // Получаем информацию о подписке из хранилища
      const subscriptionData = await SecureStore.getItemAsync('subscription');
      
      if (subscriptionData) {
        // Парсим данные подписки
        const parsedData = JSON.parse(subscriptionData);
        
        // Проверяем срок действия подписки
        if (parsedData.expiryDate && new Date(parsedData.expiryDate) > new Date()) {
          // Подписка активна
          setSubscription({
            status: parsedData.status,
            plan: parsedData.plan,
            expiryDate: new Date(parsedData.expiryDate),
            features: parsedData.features || []
          });
        } else {
          // Подписка истекла, переводим на бесплатный план
          setSubscription({
            status: 'free',
            plan: SUBSCRIPTION_PLANS.FREE,
            expiryDate: null,
            features: SUBSCRIPTION_PLANS.FREE.features
          });
        }
      } else {
        // Нет данных о подписке, устанавливаем бесплатный план
        setSubscription({
          status: 'free',
          plan: SUBSCRIPTION_PLANS.FREE,
          expiryDate: null,
          features: SUBSCRIPTION_PLANS.FREE.features
        });
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription data');
      
      // В случае ошибки устанавливаем бесплатный план
      setSubscription({
        status: 'free',
        plan: SUBSCRIPTION_PLANS.FREE,
        expiryDate: null,
        features: SUBSCRIPTION_PLANS.FREE.features
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Сохранение информации о подписке в хранилище
  const saveSubscription = async (subscriptionData) => {
    try {
      await SecureStore.setItemAsync('subscription', JSON.stringify(subscriptionData));
      return true;
    } catch (err) {
      console.error('Error saving subscription:', err);
      return false;
    }
  };
  
  // Активация пробного периода
  const activateTrial = async () => {
    try {
      // Проверяем, был ли уже использован пробный период
      const trialUsed = await SecureStore.getItemAsync('trialUsed');
      
      if (trialUsed === 'true') {
        throw new Error('Trial period already used');
      }
      
      // Устанавливаем дату окончания пробного периода (7 дней)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SUBSCRIPTION_PLANS.TRIAL.duration);
      
      // Создаем данные подписки
      const subscriptionData = {
        status: 'trial',
        plan: SUBSCRIPTION_PLANS.TRIAL,
        expiryDate: expiryDate.toISOString(),
        features: SUBSCRIPTION_PLANS.TRIAL.features,
        activatedAt: new Date().toISOString()
      };
      
      // Сохраняем информацию о подписке
      const success = await saveSubscription(subscriptionData);
      
      if (success) {
        // Отмечаем, что пробный период был использован
        await SecureStore.setItemAsync('trialUsed', 'true');
        
        // Обновляем состояние
        setSubscription({
          ...subscriptionData,
          expiryDate: expiryDate
        });
        
        return true;
      } else {
        throw new Error('Failed to save subscription data');
      }
    } catch (err) {
      console.error('Error activating trial:', err);
      setError(err.message);
      return false;
    }
  };
  
  // Покупка подписки (в реальном приложении здесь будет интеграция с In-App Purchases)
  const purchaseSubscription = async (planId) => {
    try {
      // Находим план подписки
      const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }
      
      // В реальном приложении здесь будет вызов API для покупки подписки
      // Для демонстрации просто устанавливаем подписку
      
      // Устанавливаем дату окончания подписки
      const expiryDate = new Date();
      if (plan.period === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      
      // Создаем данные подписки
      const subscriptionData = {
        status: 'premium',
        plan: plan,
        expiryDate: expiryDate.toISOString(),
        features: plan.features,
        activatedAt: new Date().toISOString()
      };
      
      // Сохраняем информацию о подписке
      const success = await saveSubscription(subscriptionData);
      
      if (success) {
        // Обновляем состояние
        setSubscription({
          ...subscriptionData,
          expiryDate: expiryDate
        });
        
        return true;
      } else {
        throw new Error('Failed to save subscription data');
      }
    } catch (err) {
      console.error('Error purchasing subscription:', err);
      setError(err.message);
      return false;
    }
  };
  
  // Отмена подписки
  const cancelSubscription = async () => {
    try {
      // В реальном приложении здесь будет вызов API для отмены подписки
      // Для демонстрации просто сбрасываем подписку на бесплатный план
      
      // Создаем данные бесплатной подписки
      const subscriptionData = {
        status: 'free',
        plan: SUBSCRIPTION_PLANS.FREE,
        expiryDate: null,
        features: SUBSCRIPTION_PLANS.FREE.features
      };
      
      // Сохраняем информацию о подписке
      const success = await saveSubscription(subscriptionData);
      
      if (success) {
        // Обновляем состояние
        setSubscription(subscriptionData);
        
        return true;
      } else {
        throw new Error('Failed to save subscription data');
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err.message);
      return false;
    }
  };
  
  // Проверка наличия конкретной функции в текущей подписке
  const hasFeature = (featureName) => {
    if (loading) return false;
    
    // Проверяем наличие функции в списке доступных функций
    return subscription.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
  };
  
  // Проверка, является ли пользователь премиум-пользователем
  const isPremium = () => {
    return subscription.status === 'premium' || subscription.status === 'trial';
  };
  
  // Получение оставшегося времени пробного периода в днях
  const getTrialDaysLeft = () => {
    if (subscription.status !== 'trial' || !subscription.expiryDate) {
      return 0;
    }
    
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  // Значение контекста
  const value = {
    subscription,
    loading,
    error,
    activateTrial,
    purchaseSubscription,
    cancelSubscription,
    hasFeature,
    isPremium,
    getTrialDaysLeft,
    refreshSubscription: loadSubscription
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Хук для использования контекста подписок
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
