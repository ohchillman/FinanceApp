import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import Card from '../../components/common/Card';
import ExpenseItem from '../../components/expense/ExpenseItem';
import Button from '../../components/common/Button';

const ExpensesListScreen = ({ navigation }) => {
  const { expenses, categories, loading, error, refreshData } = useExpenses();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [periodExpenses, setPeriodExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'week', 'month'

  // Вычисление общей суммы расходов
  useEffect(() => {
    if (expenses.length > 0) {
      const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);
      
      // Фильтрация расходов по выбранному периоду
      filterExpensesByPeriod(selectedPeriod);
    }
  }, [expenses, selectedPeriod]);

  // Фильтрация расходов по периоду
  const filterExpensesByPeriod = (period) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }
    
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
    
    setPeriodExpenses(filtered);
  };

  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency = '₽') => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency}`;
  };

  // Обработчик нажатия на расход
  const handleExpensePress = (expense) => {
    // Навигация к экрану редактирования расхода
    // navigation.navigate('EditExpense', { expenseId: expense.id });
    console.log('Edit expense:', expense.id);
  };

  // Обработчик нажатия на кнопку добавления расхода
  const handleAddExpense = () => {
    navigation.navigate('AddExpenseTab');
  };

  // Обработчик нажатия на кнопку периода
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Рендер кнопки выбора периода
  const renderPeriodButton = (period, label) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.selectedPeriodButton
      ]}
      onPress={() => handlePeriodChange(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.selectedPeriodButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Секция с общей суммой расходов */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Общая сумма расходов</Text>
        <Text style={styles.summaryAmount}>{formatAmount(totalExpenses)}</Text>
        
        {/* Кнопки выбора периода */}
        <View style={styles.periodButtonsContainer}>
          {renderPeriodButton('day', 'День')}
          {renderPeriodButton('week', 'Неделя')}
          {renderPeriodButton('month', 'Месяц')}
        </View>
      </View>
      
      {/* Список расходов */}
      <View style={styles.expensesSection}>
        <Text style={styles.sectionTitle}>
          {selectedPeriod === 'day' ? 'Сегодня' : 
           selectedPeriod === 'week' ? 'На этой неделе' : 'В этом месяце'}
        </Text>
        
        {loading ? (
          <View style={styles.centerContainer}>
            <Text>Загрузка...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              title="Повторить" 
              onPress={refreshData} 
              type="secondary"
              style={styles.retryButton}
            />
          </View>
        ) : periodExpenses.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Нет расходов за выбранный период</Text>
            <Button 
              title="Добавить расход" 
              onPress={handleAddExpense} 
              style={styles.addButton}
            />
          </View>
        ) : (
          <FlatList
            data={periodExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItem 
                expense={item} 
                onPress={() => handleExpensePress(item)}
                style={styles.expenseItem}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      
      {/* Кнопка добавления расхода */}
      <TouchableOpacity 
        style={styles.addExpenseButton}
        onPress={handleAddExpense}
      >
        <Text style={styles.addExpenseButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  summarySection: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: DIMENSIONS.SPACING.XLARGE,
    paddingHorizontal: DIMENSIONS.SPACING.LARGE,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_INVERSE,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  summaryAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_1,
    fontWeight: 'bold',
    color: COLORS.TEXT_INVERSE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  periodButton: {
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.TEXT_INVERSE,
  },
  periodButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
  },
  selectedPeriodButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  expensesSection: {
    flex: 1,
    padding: DIMENSIONS.SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  retryButton: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  addButton: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  listContent: {
    paddingBottom: DIMENSIONS.SPACING.XLARGE,
  },
  expenseItem: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  addExpenseButton: {
    position: 'absolute',
    bottom: DIMENSIONS.SPACING.LARGE,
    right: DIMENSIONS.SPACING.LARGE,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addExpenseButtonText: {
    fontSize: 32,
    color: COLORS.TEXT_INVERSE,
    fontWeight: 'bold',
  },
});

export default ExpensesListScreen;
