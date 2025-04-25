import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import { useSubscription } from '../../context/SubscriptionContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const RemindersScreen = ({ navigation }) => {
  const { expenses } = useExpenses();
  const { isPremium } = useSubscription();
  
  // Состояния для напоминаний
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка напоминаний при монтировании компонента
  useEffect(() => {
    loadReminders();
  }, [expenses]);
  
  // Загрузка напоминаний на основе данных о расходах
  const loadReminders = () => {
    try {
      setLoading(true);
      
      // Находим регулярные расходы для создания напоминаний
      const regularExpenses = findRegularExpenses(expenses);
      
      // Создаем напоминания на основе регулярных расходов
      const generatedReminders = regularExpenses.map((expense, index) => ({
        id: `reminder_${index}`,
        title: expense.description || 'Регулярный платеж',
        amount: expense.amount,
        frequency: 'monthly', // По умолчанию ежемесячно
        nextDate: getNextPaymentDate(expense.dates),
        enabled: true,
        category: expense.category_id
      }));
      
      // Добавляем стандартные напоминания, если не хватает
      if (generatedReminders.length < 2) {
        const defaultReminders = getDefaultReminders();
        setReminders([...generatedReminders, ...defaultReminders]);
      } else {
        setReminders(generatedReminders);
      }
    } catch (err) {
      console.error('Error loading reminders:', err);
      setReminders(getDefaultReminders());
    } finally {
      setLoading(false);
    }
  };
  
  // Поиск регулярных расходов для создания напоминаний
  const findRegularExpenses = (allExpenses) => {
    // Группируем расходы по описанию и сумме
    const expenseGroups = {};
    
    allExpenses.forEach(expense => {
      // Создаем ключ на основе описания и суммы
      const key = `${expense.description}_${expense.amount}`;
      
      if (!expenseGroups[key]) {
        expenseGroups[key] = {
          description: expense.description,
          amount: parseFloat(expense.amount),
          category_id: expense.category_id,
          dates: [],
          count: 0
        };
      }
      
      expenseGroups[key].dates.push(new Date(expense.date));
      expenseGroups[key].count += 1;
    });
    
    // Находим группы с регулярными платежами (минимум 2 раза)
    const regularExpenses = [];
    
    Object.values(expenseGroups).forEach(group => {
      if (group.count >= 2) {
        regularExpenses.push(group);
      }
    });
    
    // Сортируем по количеству повторений (по убыванию)
    regularExpenses.sort((a, b) => b.count - a.count);
    
    return regularExpenses;
  };
  
  // Определение даты следующего платежа на основе предыдущих дат
  const getNextPaymentDate = (dates) => {
    if (!dates || dates.length === 0) {
      return new Date();
    }
    
    // Сортируем даты по возрастанию
    const sortedDates = [...dates].sort((a, b) => a - b);
    const lastDate = sortedDates[sortedDates.length - 1];
    
    // Если только одна дата, предполагаем ежемесячный платеж
    if (sortedDates.length === 1) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      return nextDate;
    }
    
    // Пытаемся определить периодичность на основе разницы между датами
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i] - sortedDates[i - 1];
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Разница в днях
    }
    
    // Вычисляем среднюю периодичность
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    // Определяем тип периодичности
    let daysToAdd = 30; // По умолчанию ежемесячно
    
    if (avgInterval <= 7.5) {
      daysToAdd = 7; // Еженедельно
    } else if (avgInterval >= 28 && avgInterval <= 31) {
      daysToAdd = 30; // Ежемесячно
    } else if (avgInterval >= 85 && avgInterval <= 95) {
      daysToAdd = 90; // Ежеквартально
    } else if (avgInterval >= 350 && avgInterval <= 380) {
      daysToAdd = 365; // Ежегодно
    }
    
    // Вычисляем следующую дату платежа
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    
    return nextDate;
  };
  
  // Получение стандартных напоминаний
  const getDefaultReminders = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return [
      {
        id: 'default_rent',
        title: 'Оплата аренды',
        amount: 25000,
        frequency: 'monthly',
        nextDate: nextMonth,
        enabled: false,
        category: 'home'
      },
      {
        id: 'default_subscription',
        title: 'Подписка на сервисы',
        amount: 599,
        frequency: 'monthly',
        nextDate: nextMonth,
        enabled: false,
        category: 'subscriptions'
      }
    ];
  };
  
  // Обработчик переключения напоминания
  const handleToggleReminder = (id) => {
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: !reminder.enabled } 
          : reminder
      )
    );
  };
  
  // Обработчик редактирования напоминания
  const handleEditReminder = (reminder) => {
    // В реальном приложении здесь будет навигация на экран редактирования
    console.log('Edit reminder:', reminder);
  };
  
  // Обработчик удаления напоминания
  const handleDeleteReminder = (id) => {
    setReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== id)
    );
  };
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency = '₽') => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency}`;
  };
  
  // Форматирование даты
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
  };
  
  // Получение названия категории по ID
  const getCategoryName = (categoryId) => {
    const categoryMap = {
      'food': 'Еда',
      'transport': 'Транспорт',
      'home': 'Дом',
      'health': 'Здоровье',
      'subscriptions': 'Подписки',
      'entertainment': 'Развлечения',
      'family': 'Семья',
      'business': 'Бизнес',
      'other': 'Другое'
    };
    
    return categoryMap[categoryId] || 'Другое';
  };
  
  // Рендер карточки напоминания
  const renderReminderCard = (reminder) => (
    <Card key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderAmount}>{formatAmount(reminder.amount)}</Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={() => handleToggleReminder(reminder.id)}
          trackColor={{ false: COLORS.GRAY_300, true: COLORS.PRIMARY_LIGHT }}
          thumbColor={reminder.enabled ? COLORS.PRIMARY : COLORS.GRAY_500}
        />
      </View>
      
      <View style={styles.reminderDetails}>
        <View style={styles.reminderDetail}>
          <Text style={styles.reminderDetailLabel}>Следующая дата:</Text>
          <Text style={styles.reminderDetailValue}>{formatDate(reminder.nextDate)}</Text>
        </View>
        
        <View style={styles.reminderDetail}>
          <Text style={styles.reminderDetailLabel}>Периодичность:</Text>
          <Text style={styles.reminderDetailValue}>
            {reminder.frequency === 'monthly' ? 'Ежемесячно' : 
             reminder.frequency === 'weekly' ? 'Еженедельно' : 
             reminder.frequency === 'quarterly' ? 'Ежеквартально' : 
             reminder.frequency === 'yearly' ? 'Ежегодно' : 'Разово'}
          </Text>
        </View>
        
        {reminder.category && (
          <View style={styles.reminderDetail}>
            <Text style={styles.reminderDetailLabel}>Категория:</Text>
            <Text style={styles.reminderDetailValue}>{getCategoryName(reminder.category)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.reminderActions}>
        <TouchableOpacity 
          style={styles.reminderAction}
          onPress={() => handleEditReminder(reminder)}
        >
          <Text style={styles.reminderActionText}>Редактировать</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.reminderAction, styles.reminderDeleteAction]}
          onPress={() => handleDeleteReminder(reminder.id)}
        >
          <Text style={[styles.reminderActionText, styles.reminderDeleteText]}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Напоминания</Text>
        <Text style={styles.description}>
          Управляйте напоминаниями о регулярных платежах и подписках
        </Text>
      </View>
      
      {/* Список напоминаний */}
      <View style={styles.remindersContainer}>
        {reminders.length > 0 ? (
          reminders.map(renderReminderCard)
        ) : (
          <Text style={styles.emptyText}>
            У вас пока нет напоминаний. Добавьте регулярные расходы, чтобы создать напоминания.
          </Text>
        )}
      </View>
      
      {/* Кнопка добавления напоминания */}
      <Button
        title="Добавить напоминание"
        onPress={() => console.log('Add reminder')}
        style={styles.addButton}
      />
      
      {/* Премиум-блок */}
      {!isPremium() && (
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Расширенные напоминания</Text>
          <Text style={styles.premiumDescription}>
            Получите доступ к расширенным напоминаниям с уведомлениями, автоматическим определением регулярных платежей
            и синхронизацией с календарем.
          </Text>
          <Button
            title="Подключить премиум"
            onPress={() => navigation.navigate('SubscriptionScreen')}
            style={styles.premiumButton}
          />
        </Card>
      )}
      
      {/* Информационный блок */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Как это работает</Text>
        <Text style={styles.infoText}>
          Приложение автоматически анализирует ваши расходы и определяет регулярные платежи.
          На основе этих данных создаются напоминания, которые помогут вам не забыть о важных платежах.
        </Text>
        <Text style={styles.infoText}>
          Вы также можете добавлять напоминания вручную и настраивать их периодичность.
        </Text>
      </Card>
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
  remindersContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  reminderCard: {
    padding: DIMENSIONS.SPACING.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  reminderAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  reminderDetails: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  reminderDetail: {
    flexDirection: 'row',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  reminderDetailLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_TERTIARY,
    width: 120,
  },
  reminderDetailValue: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_200,
    paddingTop: DIMENSIONS.SPACING.SMALL,
  },
  reminderAction: {
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
  },
  reminderActionText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.PRIMARY,
  },
  reminderDeleteAction: {
    marginLeft: DIMENSIONS.SPACING.MEDIUM,
  },
  reminderDeleteText: {
    color: COLORS.ERROR,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginVertical: DIMENSIONS.SPACING.XLARGE,
  },
  addButton: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
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
  infoCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
    backgroundColor: COLORS.INFO_LIGHT,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.INFO,
  },
  infoTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  infoText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
});

export default RemindersScreen;
