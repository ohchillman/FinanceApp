import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import { useSubscription } from '../../context/SubscriptionContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AnalyticsScreen = ({ navigation }) => {
  const { expenses, categories, getExpensesByPeriod, getTotalByPeriod } = useExpenses();
  const { isPremium } = useSubscription();
  
  // Состояния для фильтрации и отображения данных
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'week', 'month', 'year'
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка данных при изменении периода или списка расходов
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, expenses]);
  
  // Загрузка данных для аналитики
  const loadAnalyticsData = () => {
    try {
      setLoading(true);
      
      // Определяем даты начала и конца периода
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }
      
      // Получаем расходы за выбранный период
      const periodExpenses = getExpensesByPeriod(startDate, endDate);
      
      // Вычисляем общую сумму расходов
      const total = getTotalByPeriod(startDate, endDate);
      setTotalExpenses(total);
      
      // Подготавливаем данные по категориям для круговой диаграммы
      const categoryTotals = {};
      
      periodExpenses.forEach(expense => {
        const categoryId = expense.category_id || 'other';
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = 0;
        }
        categoryTotals[categoryId] += parseFloat(expense.amount);
      });
      
      const categoryChartData = Object.keys(categoryTotals).map(categoryId => {
        const category = categories.find(c => c.id === categoryId) || { 
          name: 'Другое', 
          color: COLORS.GRAY_400 
        };
        
        return {
          name: category.name,
          amount: categoryTotals[categoryId],
          color: category.color || COLORS.GRAY_400,
          legendFontColor: COLORS.TEXT_PRIMARY,
          legendFontSize: 12
        };
      });
      
      // Сортируем категории по убыванию суммы
      categoryChartData.sort((a, b) => b.amount - a.amount);
      
      setCategoryData(categoryChartData);
      
      // Подготавливаем данные по дням для линейного графика
      const dailyTotals = {};
      const labels = [];
      
      // Определяем количество дней для отображения
      let daysToShow = 30;
      if (selectedPeriod === 'week') daysToShow = 7;
      if (selectedPeriod === 'year') daysToShow = 12; // По месяцам
      
      // Инициализируем массив дней/месяцев
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date();
        
        if (selectedPeriod === 'year') {
          // Для года показываем помесячно
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          dailyTotals[monthKey] = 0;
          
          // Добавляем метку месяца
          const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
          labels.unshift(monthNames[date.getMonth()]);
        } else {
          // Для недели и месяца показываем по дням
          date.setDate(date.getDate() - i);
          const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          dailyTotals[dayKey] = 0;
          
          // Добавляем метку дня
          labels.unshift(`${date.getDate()}.${date.getMonth() + 1}`);
        }
      }
      
      // Заполняем данные по дням/месяцам
      periodExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        let key;
        
        if (selectedPeriod === 'year') {
          key = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`;
        } else {
          key = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}-${expenseDate.getDate()}`;
        }
        
        if (dailyTotals[key] !== undefined) {
          dailyTotals[key] += parseFloat(expense.amount);
        }
      });
      
      // Преобразуем в массив для графика
      const dailyValues = Object.values(dailyTotals).slice(0, daysToShow).reverse();
      
      setDailyData({
        labels,
        datasets: [
          {
            data: dailyValues,
            color: (opacity = 1) => COLORS.PRIMARY,
            strokeWidth: 2
          }
        ]
      });
    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик изменения периода
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency = '₽') => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency}`;
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
  
  // Конфигурация для линейного графика
  const lineChartConfig = {
    backgroundColor: COLORS.SURFACE,
    backgroundGradientFrom: COLORS.SURFACE,
    backgroundGradientTo: COLORS.SURFACE,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${parseInt(COLORS.PRIMARY.slice(1, 3), 16)}, ${parseInt(COLORS.PRIMARY.slice(3, 5), 16)}, ${parseInt(COLORS.PRIMARY.slice(5, 7), 16)}, ${opacity})`,
    labelColor: (opacity = 1) => COLORS.TEXT_SECONDARY,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.PRIMARY
    }
  };
  
  // Ширина экрана для графиков
  const screenWidth = Dimensions.get('window').width - DIMENSIONS.SPACING.LARGE * 2;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Аналитика расходов</Text>
        <Text style={styles.description}>
          Анализ ваших расходов по категориям и периодам
        </Text>
      </View>
      
      {/* Кнопки выбора периода */}
      <View style={styles.periodButtonsContainer}>
        {renderPeriodButton('week', 'Неделя')}
        {renderPeriodButton('month', 'Месяц')}
        {renderPeriodButton('year', 'Год')}
      </View>
      
      {/* Общая сумма расходов */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Общая сумма расходов</Text>
        <Text style={styles.totalAmount}>{formatAmount(totalExpenses)}</Text>
        <Text style={styles.periodLabel}>
          {selectedPeriod === 'week' ? 'за последние 7 дней' : 
           selectedPeriod === 'month' ? 'за последний месяц' : 
           'за последний год'}
        </Text>
      </Card>
      
      {/* График расходов по дням/месяцам */}
      {dailyData.labels && dailyData.labels.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Динамика расходов</Text>
          <LineChart
            data={dailyData}
            width={screenWidth - DIMENSIONS.SPACING.LARGE * 2}
            height={220}
            chartConfig={lineChartConfig}
            bezier
            style={styles.chart}
          />
        </Card>
      )}
      
      {/* График расходов по категориям */}
      {categoryData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Расходы по категориям</Text>
          <PieChart
            data={categoryData}
            width={screenWidth - DIMENSIONS.SPACING.LARGE * 2}
            height={220}
            chartConfig={lineChartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      )}
      
      {/* Топ категорий расходов */}
      <Card style={styles.categoriesCard}>
        <Text style={styles.chartTitle}>Топ категорий расходов</Text>
        {categoryData.slice(0, 5).map((category, index) => (
          <View key={index} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text style={styles.categoryAmount}>{formatAmount(category.amount)}</Text>
          </View>
        ))}
      </Card>
      
      {/* Премиум-функции аналитики */}
      {!isPremium() && (
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Расширенная аналитика</Text>
          <Text style={styles.premiumDescription}>
            Получите доступ к расширенной аналитике с детальными отчетами, 
            экспортом данных и персонализированными рекомендациями по оптимизации расходов.
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
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  periodButton: {
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    backgroundColor: COLORS.SURFACE,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  periodButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
  },
  selectedPeriodButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: '600',
  },
  totalCard: {
    alignItems: 'center',
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  totalLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  totalAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_1,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  periodLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_TERTIARY,
  },
  chartCard: {
    padding: DIMENSIONS.SPACING.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  chartTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  chart: {
    marginVertical: DIMENSIONS.SPACING.SMALL,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
  },
  categoriesCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  categoryName: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  categoryAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
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

export default AnalyticsScreen;
