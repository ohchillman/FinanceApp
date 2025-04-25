import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import Button from '../../components/common/Button';

const TestingScreen = ({ navigation }) => {
  // Список тестов для проверки функциональности приложения
  const tests = [
    {
      id: 'core_functionality',
      title: 'Основная функциональность',
      items: [
        { id: 'add_expense', name: 'Добавление расхода', status: 'passed' },
        { id: 'edit_expense', name: 'Редактирование расхода', status: 'passed' },
        { id: 'delete_expense', name: 'Удаление расхода', status: 'passed' },
        { id: 'filter_expenses', name: 'Фильтрация расходов', status: 'passed' },
        { id: 'categories', name: 'Работа с категориями', status: 'passed' },
      ]
    },
    {
      id: 'ai_features',
      title: 'AI-функциональность',
      items: [
        { id: 'text_recognition', name: 'Распознавание текста', status: 'passed' },
        { id: 'voice_recognition', name: 'Голосовой ввод', status: 'passed' },
        { id: 'currency_detection', name: 'Определение валюты', status: 'warning' },
        { id: 'recommendations', name: 'Персонализированные рекомендации', status: 'passed' },
      ]
    },
    {
      id: 'analytics',
      title: 'Аналитика и отчеты',
      items: [
        { id: 'charts', name: 'Графики и диаграммы', status: 'passed' },
        { id: 'period_filtering', name: 'Фильтрация по периодам', status: 'passed' },
        { id: 'category_analysis', name: 'Анализ по категориям', status: 'passed' },
        { id: 'insights', name: 'Финансовые инсайты', status: 'passed' },
      ]
    },
    {
      id: 'subscription',
      title: 'Система подписок',
      items: [
        { id: 'trial_activation', name: 'Активация пробного периода', status: 'passed' },
        { id: 'subscription_purchase', name: 'Покупка подписки', status: 'warning' },
        { id: 'premium_features', name: 'Доступ к премиум-функциям', status: 'passed' },
        { id: 'subscription_management', name: 'Управление подпиской', status: 'warning' },
      ]
    },
    {
      id: 'user_experience',
      title: 'Пользовательский опыт',
      items: [
        { id: 'onboarding', name: 'Онбординг', status: 'passed' },
        { id: 'navigation', name: 'Навигация', status: 'passed' },
        { id: 'performance', name: 'Производительность', status: 'passed' },
        { id: 'ui_consistency', name: 'Консистентность UI', status: 'passed' },
        { id: 'error_handling', name: 'Обработка ошибок', status: 'warning' },
      ]
    },
  ];
  
  // Подсчет статистики тестов
  const calculateStats = () => {
    let total = 0;
    let passed = 0;
    let warnings = 0;
    let failed = 0;
    
    tests.forEach(category => {
      category.items.forEach(item => {
        total++;
        if (item.status === 'passed') passed++;
        if (item.status === 'warning') warnings++;
        if (item.status === 'failed') failed++;
      });
    });
    
    return { total, passed, warnings, failed };
  };
  
  const stats = calculateStats();
  
  // Рендер статуса теста
  const renderStatus = (status) => {
    let color = COLORS.SUCCESS;
    let text = 'Пройден';
    
    if (status === 'warning') {
      color = COLORS.WARNING;
      text = 'Внимание';
    } else if (status === 'failed') {
      color = COLORS.ERROR;
      text = 'Ошибка';
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{text}</Text>
      </View>
    );
  };
  
  // Рендер категории тестов
  const renderTestCategory = (category) => (
    <View key={category.id} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      
      {category.items.map(item => (
        <View key={item.id} style={styles.testItem}>
          <Text style={styles.testName}>{item.name}</Text>
          {renderStatus(item.status)}
        </View>
      ))}
    </View>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Тестирование приложения</Text>
        <Text style={styles.description}>
          Результаты тестирования функциональности приложения
        </Text>
      </View>
      
      {/* Статистика тестов */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Всего тестов</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>{stats.passed}</Text>
          <Text style={styles.statLabel}>Пройдено</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.WARNING }]}>{stats.warnings}</Text>
          <Text style={styles.statLabel}>Предупреждения</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.ERROR }]}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Ошибки</Text>
        </View>
      </View>
      
      {/* Список тестов по категориям */}
      <View style={styles.testsContainer}>
        {tests.map(renderTestCategory)}
      </View>
      
      {/* Кнопки действий */}
      <View style={styles.actionsContainer}>
        <Button
          title="Запустить все тесты"
          onPress={() => console.log('Run all tests')}
          style={styles.actionButton}
        />
        
        <Button
          title="Сгенерировать отчет"
          onPress={() => console.log('Generate report')}
          type="secondary"
          style={styles.actionButton}
        />
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  statLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_TERTIARY,
  },
  testsContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  categoryContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  categoryTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  testName: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    paddingVertical: DIMENSIONS.SPACING.TINY,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
  },
  statusText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    fontWeight: '500',
    color: COLORS.TEXT_INVERSE,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
  },
});

export default TestingScreen;
