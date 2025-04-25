import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import { useSubscription } from '../../context/SubscriptionContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const RecommendationsScreen = ({ navigation }) => {
  const { expenses, categories, getExpensesByPeriod, getTotalByPeriod } = useExpenses();
  const { isPremium } = useSubscription();
  
  // Состояния для рекомендаций и инсайтов
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка рекомендаций при монтировании компонента
  useEffect(() => {
    generateRecommendations();
  }, [expenses]);
  
  // Генерация персонализированных рекомендаций на основе данных о расходах
  const generateRecommendations = () => {
    try {
      setLoading(true);
      
      // Получаем данные за последние 3 месяца для анализа
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 3);
      
      const periodExpenses = getExpensesByPeriod(startDate, endDate);
      
      // Если недостаточно данных, показываем базовые рекомендации
      if (periodExpenses.length < 5) {
        setRecommendations(getDefaultRecommendations());
        setInsights([]);
        return;
      }
      
      // Анализируем расходы по категориям
      const categoryTotals = {};
      const monthlyTotals = {};
      
      periodExpenses.forEach(expense => {
        const categoryId = expense.category_id || 'other';
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = 0;
        }
        categoryTotals[categoryId] += parseFloat(expense.amount);
        
        // Группируем по месяцам
        const expenseDate = new Date(expense.date);
        const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += parseFloat(expense.amount);
      });
      
      // Находим категорию с наибольшими расходами
      let maxCategory = null;
      let maxAmount = 0;
      
      Object.keys(categoryTotals).forEach(categoryId => {
        if (categoryTotals[categoryId] > maxAmount) {
          maxAmount = categoryTotals[categoryId];
          maxCategory = categoryId;
        }
      });
      
      // Находим категорию с наибольшим ростом расходов
      const monthKeys = Object.keys(monthlyTotals).sort();
      let growthCategory = null;
      let maxGrowth = 0;
      
      if (monthKeys.length >= 2) {
        const lastMonth = monthKeys[monthKeys.length - 1];
        const prevMonth = monthKeys[monthKeys.length - 2];
        
        // Анализируем рост по категориям
        const lastMonthExpenses = getExpensesByPeriod(
          new Date(lastMonth + '-01'),
          new Date(new Date(lastMonth + '-01').setMonth(new Date(lastMonth + '-01').getMonth() + 1))
        );
        
        const prevMonthExpenses = getExpensesByPeriod(
          new Date(prevMonth + '-01'),
          new Date(new Date(prevMonth + '-01').setMonth(new Date(prevMonth + '-01').getMonth() + 1))
        );
        
        const lastMonthByCategory = {};
        const prevMonthByCategory = {};
        
        lastMonthExpenses.forEach(expense => {
          const categoryId = expense.category_id || 'other';
          if (!lastMonthByCategory[categoryId]) {
            lastMonthByCategory[categoryId] = 0;
          }
          lastMonthByCategory[categoryId] += parseFloat(expense.amount);
        });
        
        prevMonthExpenses.forEach(expense => {
          const categoryId = expense.category_id || 'other';
          if (!prevMonthByCategory[categoryId]) {
            prevMonthByCategory[categoryId] = 0;
          }
          prevMonthByCategory[categoryId] += parseFloat(expense.amount);
        });
        
        // Вычисляем рост по каждой категории
        Object.keys(lastMonthByCategory).forEach(categoryId => {
          const lastAmount = lastMonthByCategory[categoryId] || 0;
          const prevAmount = prevMonthByCategory[categoryId] || 0;
          
          if (prevAmount > 0) {
            const growth = (lastAmount - prevAmount) / prevAmount;
            
            if (growth > maxGrowth && lastAmount > 1000) {
              maxGrowth = growth;
              growthCategory = categoryId;
            }
          }
        });
      }
      
      // Генерируем персонализированные рекомендации
      const personalizedRecommendations = [];
      
      // Рекомендация по категории с наибольшими расходами
      if (maxCategory) {
        const category = categories.find(c => c.id === maxCategory) || { name: 'Другое' };
        
        personalizedRecommendations.push({
          id: 'high_spending',
          title: `Высокие расходы на ${category.name.toLowerCase()}`,
          description: `За последние 3 месяца вы потратили ${formatAmount(maxAmount)} на ${category.name.toLowerCase()}. Это ваша самая крупная категория расходов.`,
          action: 'Установите бюджет для этой категории, чтобы контролировать расходы.',
          icon: '💰',
          type: 'warning'
        });
      }
      
      // Рекомендация по категории с наибольшим ростом
      if (growthCategory && maxGrowth > 0.2) { // Рост более 20%
        const category = categories.find(c => c.id === growthCategory) || { name: 'Другое' };
        
        personalizedRecommendations.push({
          id: 'growing_expenses',
          title: `Рост расходов на ${category.name.toLowerCase()}`,
          description: `Ваши расходы на ${category.name.toLowerCase()} выросли на ${Math.round(maxGrowth * 100)}% по сравнению с прошлым месяцем.`,
          action: 'Проанализируйте причины роста и подумайте, как можно оптимизировать эти расходы.',
          icon: '📈',
          type: 'warning'
        });
      }
      
      // Анализ регулярности расходов
      const regularExpenses = findRegularExpenses(periodExpenses);
      if (regularExpenses.length > 0) {
        const totalRegular = regularExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        personalizedRecommendations.push({
          id: 'regular_expenses',
          title: 'Регулярные платежи',
          description: `У вас есть регулярные платежи на сумму около ${formatAmount(totalRegular)} в месяц.`,
          action: 'Проверьте, все ли подписки и регулярные платежи вам действительно нужны.',
          icon: '🔄',
          type: 'info'
        });
      }
      
      // Добавляем общие рекомендации
      const defaultRecs = getDefaultRecommendations();
      const combinedRecommendations = [...personalizedRecommendations];
      
      // Добавляем дефолтные рекомендации, если персонализированных недостаточно
      if (combinedRecommendations.length < 3) {
        for (let i = 0; i < defaultRecs.length && combinedRecommendations.length < 4; i++) {
          // Проверяем, что такой рекомендации еще нет
          if (!combinedRecommendations.some(r => r.id === defaultRecs[i].id)) {
            combinedRecommendations.push(defaultRecs[i]);
          }
        }
      }
      
      // Генерируем инсайты о расходах
      const generatedInsights = generateInsights(periodExpenses, monthlyTotals);
      
      setRecommendations(combinedRecommendations);
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRecommendations(getDefaultRecommendations());
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Поиск регулярных расходов (подписки, регулярные платежи)
  const findRegularExpenses = (expenses) => {
    // Группируем расходы по описанию и сумме
    const expenseGroups = {};
    
    expenses.forEach(expense => {
      const key = `${expense.description}_${expense.amount}`;
      if (!expenseGroups[key]) {
        expenseGroups[key] = [];
      }
      expenseGroups[key].push(expense);
    });
    
    // Находим группы с регулярными платежами (минимум 2 раза)
    const regularExpenses = [];
    
    Object.keys(expenseGroups).forEach(key => {
      const group = expenseGroups[key];
      if (group.length >= 2) {
        regularExpenses.push({
          description: group[0].description,
          amount: parseFloat(group[0].amount),
          count: group.length
        });
      }
    });
    
    return regularExpenses;
  };
  
  // Генерация инсайтов о расходах
  const generateInsights = (expenses, monthlyTotals) => {
    const insights = [];
    
    // Если есть данные минимум за 2 месяца
    const monthKeys = Object.keys(monthlyTotals).sort();
    
    if (monthKeys.length >= 2) {
      const lastMonth = monthKeys[monthKeys.length - 1];
      const prevMonth = monthKeys[monthKeys.length - 2];
      
      const lastMonthTotal = monthlyTotals[lastMonth];
      const prevMonthTotal = monthlyTotals[prevMonth];
      
      // Сравнение с прошлым месяцем
      const diff = lastMonthTotal - prevMonthTotal;
      const percentDiff = (diff / prevMonthTotal) * 100;
      
      if (Math.abs(percentDiff) >= 5) { // Изменение более 5%
        insights.push({
          id: 'month_comparison',
          title: diff > 0 ? 'Расходы выросли' : 'Расходы снизились',
          description: diff > 0 
            ? `В этом месяце вы потратили на ${formatAmount(Math.abs(diff))} больше, чем в прошлом (${Math.abs(Math.round(percentDiff))}%).`
            : `В этом месяце вы потратили на ${formatAmount(Math.abs(diff))} меньше, чем в прошлом (${Math.abs(Math.round(percentDiff))}%).`,
          icon: diff > 0 ? '📈' : '📉',
          type: diff > 0 ? 'warning' : 'success'
        });
      }
    }
    
    // Анализ дней недели с наибольшими расходами
    const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0]; // Вс, Пн, Вт, Ср, Чт, Пт, Сб
    let totalAmount = 0;
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayOfWeek = expenseDate.getDay();
      dayOfWeekTotals[dayOfWeek] += parseFloat(expense.amount);
      totalAmount += parseFloat(expense.amount);
    });
    
    if (totalAmount > 0) {
      // Находим день с наибольшими расходами
      let maxDay = 0;
      let maxDayAmount = 0;
      
      dayOfWeekTotals.forEach((amount, day) => {
        if (amount > maxDayAmount) {
          maxDayAmount = amount;
          maxDay = day;
        }
      });
      
      const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
      const percentOfTotal = (maxDayAmount / totalAmount) * 100;
      
      if (percentOfTotal >= 20) { // Если на этот день приходится минимум 20% расходов
        insights.push({
          id: 'day_of_week',
          title: 'День наибольших трат',
          description: `Вы тратите больше всего в ${dayNames[maxDay]} — ${formatAmount(maxDayAmount)} (${Math.round(percentOfTotal)}% от общей суммы).`,
          icon: '📆',
          type: 'info'
        });
      }
    }
    
    return insights;
  };
  
  // Получение стандартных рекомендаций
  const getDefaultRecommendations = () => {
    return [
      {
        id: 'budget_planning',
        title: 'Планирование бюджета',
        description: 'Установите месячный бюджет для каждой категории расходов, чтобы лучше контролировать свои финансы.',
        action: 'Создайте бюджет на следующий месяц и отслеживайте его выполнение.',
        icon: '📊',
        type: 'info'
      },
      {
        id: 'expense_tracking',
        title: 'Регулярный учет расходов',
        description: 'Записывайте все расходы сразу после их совершения, чтобы не упустить важные детали.',
        action: 'Используйте голосовой ввод для быстрого добавления расходов.',
        icon: '🎤',
        type: 'info'
      },
      {
        id: 'savings',
        title: 'Накопления',
        description: 'Регулярно откладывайте часть доходов на накопления и инвестиции.',
        action: 'Начните с 10% от ежемесячного дохода.',
        icon: '💰',
        type: 'info'
      },
      {
        id: 'review',
        title: 'Анализ расходов',
        description: 'Регулярно анализируйте свои расходы, чтобы выявить возможности для экономии.',
        action: 'Просматривайте отчеты в конце каждого месяца.',
        icon: '📈',
        type: 'info'
      }
    ];
  };
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency = '₽') => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency}`;
  };
  
  // Рендер карточки рекомендации
  const renderRecommendationCard = (item) => (
    <Card 
      key={item.id} 
      style={[
        styles.recommendationCard, 
        item.type === 'warning' && styles.warningCard,
        item.type === 'success' && styles.successCard
      ]}
    >
      <View style={styles.recommendationHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
      </View>
      <Text style={styles.recommendationDescription}>{item.description}</Text>
      {item.action && (
        <Text style={styles.recommendationAction}>💡 {item.action}</Text>
      )}
    </Card>
  );
  
  // Рендер карточки инсайта
  const renderInsightCard = (item) => (
    <Card 
      key={item.id} 
      style={[
        styles.insightCard, 
        item.type === 'warning' && styles.warningCard,
        item.type === 'success' && styles.successCard
      ]}
    >
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{item.icon}</Text>
        <Text style={styles.insightTitle}>{item.title}</Text>
      </View>
      <Text style={styles.insightDescription}>{item.description}</Text>
    </Card>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Рекомендации</Text>
        <Text style={styles.description}>
          Персонализированные советы для оптимизации ваших расходов
        </Text>
      </View>
      
      {/* Блок с инсайтами */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Инсайты о ваших расходах</Text>
          {insights.map(renderInsightCard)}
        </View>
      )}
      
      {/* Блок с рекомендациями */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рекомендации по управлению финансами</Text>
        {recommendations.map(renderRecommendationCard)}
      </View>
      
      {/* Премиум-блок */}
      {!isPremium() && (
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Расширенные рекомендации</Text>
          <Text style={styles.premiumDescription}>
            Получите доступ к персонализированным рекомендациям, основанным на глубоком анализе ваших расходов,
            и настройте напоминания о регулярных платежах.
          </Text>
          <Button
            title="Подключить премиум"
            onPress={() => navigation.navigate('SubscriptionScreen')}
            style={styles.premiumButton}
          />
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: DIMENSIONS.SPACING.LARGE,
  },
  header: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  recommendationCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.WARNING,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  iconText: {
    fontSize: 20,
  },
  recommendationTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  recommendationAction: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  insightCard: {
    padding: DIMENSIONS.SPACING.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  insightTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  insightDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  premiumCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  premiumTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  premiumDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  premiumButton: {
    marginTop: DIMENSIONS.SPACING.SMALL,
  },
});

export default RecommendationsScreen;
