import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const BugFixScreen = ({ navigation }) => {
  // Список обнаруженных ошибок
  const [bugs, setBugs] = useState([
    {
      id: 'bug_001',
      title: 'Ошибка определения валюты',
      description: 'Некорректное определение валюты при вводе текста на некоторых языках',
      status: 'fixed',
      priority: 'high',
      component: 'CurrencyService',
      solution: 'Улучшен алгоритм определения валюты с учетом контекста и языка устройства'
    },
    {
      id: 'bug_002',
      title: 'Проблема с покупкой подписки',
      description: 'Ошибка при обработке платежа через App Store',
      status: 'in_progress',
      priority: 'critical',
      component: 'SubscriptionContext',
      solution: 'Обновление интеграции с StoreKit и добавление обработки ошибок'
    },
    {
      id: 'bug_003',
      title: 'Задержка при голосовом вводе',
      description: 'Длительная задержка при обработке голосового ввода на устройствах с iOS 15',
      status: 'fixed',
      priority: 'medium',
      component: 'VoiceRecognitionService',
      solution: 'Оптимизация процесса обработки аудио и добавление индикатора загрузки'
    },
    {
      id: 'bug_004',
      title: 'Некорректное отображение графиков',
      description: 'Графики не отображаются корректно при отсутствии данных за выбранный период',
      status: 'fixed',
      priority: 'medium',
      component: 'AnalyticsScreen',
      solution: 'Добавлена проверка наличия данных и отображение соответствующего сообщения'
    },
    {
      id: 'bug_005',
      title: 'Ошибка при удалении категории',
      description: 'Приложение вылетает при попытке удалить категорию, к которой привязаны расходы',
      status: 'fixed',
      priority: 'high',
      component: 'CategoryManager',
      solution: 'Добавлено предупреждение и опция переноса расходов в другую категорию'
    },
    {
      id: 'bug_006',
      title: 'Проблема с управлением подпиской',
      description: 'Не отображается актуальный статус подписки после ее изменения',
      status: 'in_progress',
      priority: 'high',
      component: 'SubscriptionScreen',
      solution: 'Реализация обновления статуса подписки в реальном времени'
    },
    {
      id: 'bug_007',
      title: 'Ошибка обработки ввода',
      description: 'Некорректная обработка специальных символов при вводе описания расхода',
      status: 'fixed',
      priority: 'low',
      component: 'ExpenseForm',
      solution: 'Добавлена санитизация ввода и обработка специальных символов'
    },
  ]);

  // Фильтры для отображения ошибок
  const [filter, setFilter] = useState('all'); // 'all', 'fixed', 'in_progress'
  
  // Фильтрация ошибок
  const filteredBugs = bugs.filter(bug => {
    if (filter === 'all') return true;
    return bug.status === filter;
  });
  
  // Подсчет статистики ошибок
  const calculateStats = () => {
    const total = bugs.length;
    const fixed = bugs.filter(bug => bug.status === 'fixed').length;
    const inProgress = bugs.filter(bug => bug.status === 'in_progress').length;
    
    return { total, fixed, inProgress };
  };
  
  const stats = calculateStats();
  
  // Обработчик изменения статуса ошибки
  const handleChangeStatus = (id, newStatus) => {
    setBugs(prevBugs => 
      prevBugs.map(bug => 
        bug.id === id 
          ? { ...bug, status: newStatus } 
          : bug
      )
    );
  };
  
  // Обработчик удаления ошибки
  const handleDeleteBug = (id) => {
    Alert.alert(
      'Удаление ошибки',
      'Вы уверены, что хотите удалить эту ошибку?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: () => {
            setBugs(prevBugs => prevBugs.filter(bug => bug.id !== id));
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Получение цвета приоритета
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return COLORS.ERROR;
      case 'high':
        return COLORS.WARNING;
      case 'medium':
        return COLORS.INFO;
      case 'low':
        return COLORS.SUCCESS;
      default:
        return COLORS.GRAY_400;
    }
  };
  
  // Получение текста приоритета
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'critical':
        return 'Критический';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return 'Неизвестно';
    }
  };
  
  // Получение текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'fixed':
        return 'Исправлено';
      case 'in_progress':
        return 'В работе';
      default:
        return 'Неизвестно';
    }
  };
  
  // Рендер карточки ошибки
  const renderBugCard = (bug) => (
    <Card key={bug.id} style={styles.bugCard}>
      <View style={styles.bugHeader}>
        <Text style={styles.bugTitle}>{bug.title}</Text>
        <View 
          style={[
            styles.priorityBadge, 
            { backgroundColor: getPriorityColor(bug.priority) }
          ]}
        >
          <Text style={styles.priorityText}>{getPriorityText(bug.priority)}</Text>
        </View>
      </View>
      
      <Text style={styles.bugDescription}>{bug.description}</Text>
      
      <View style={styles.bugDetails}>
        <View style={styles.bugDetail}>
          <Text style={styles.bugDetailLabel}>Компонент:</Text>
          <Text style={styles.bugDetailValue}>{bug.component}</Text>
        </View>
        
        <View style={styles.bugDetail}>
          <Text style={styles.bugDetailLabel}>Статус:</Text>
          <Text 
            style={[
              styles.bugDetailValue, 
              { 
                color: bug.status === 'fixed' ? COLORS.SUCCESS : COLORS.WARNING 
              }
            ]}
          >
            {getStatusText(bug.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.solutionContainer}>
        <Text style={styles.solutionLabel}>Решение:</Text>
        <Text style={styles.solutionText}>{bug.solution}</Text>
      </View>
      
      <View style={styles.bugActions}>
        {bug.status === 'in_progress' ? (
          <Button
            title="Отметить как исправленную"
            onPress={() => handleChangeStatus(bug.id, 'fixed')}
            type="secondary"
            style={styles.bugAction}
          />
        ) : (
          <Button
            title="Вернуть в работу"
            onPress={() => handleChangeStatus(bug.id, 'in_progress')}
            type="secondary"
            style={styles.bugAction}
          />
        )}
        
        <Button
          title="Удалить"
          onPress={() => handleDeleteBug(bug.id)}
          type="danger"
          style={styles.bugAction}
        />
      </View>
    </Card>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Исправление ошибок</Text>
        <Text style={styles.description}>
          Отслеживание и исправление обнаруженных ошибок в приложении
        </Text>
      </View>
      
      {/* Статистика ошибок */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Всего ошибок</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>{stats.fixed}</Text>
          <Text style={styles.statLabel}>Исправлено</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.WARNING }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>В работе</Text>
        </View>
      </View>
      
      {/* Фильтры */}
      <View style={styles.filtersContainer}>
        <Button
          title="Все"
          onPress={() => setFilter('all')}
          type={filter === 'all' ? 'primary' : 'secondary'}
          style={styles.filterButton}
        />
        
        <Button
          title="Исправленные"
          onPress={() => setFilter('fixed')}
          type={filter === 'fixed' ? 'primary' : 'secondary'}
          style={styles.filterButton}
        />
        
        <Button
          title="В работе"
          onPress={() => setFilter('in_progress')}
          type={filter === 'in_progress' ? 'primary' : 'secondary'}
          style={styles.filterButton}
        />
      </View>
      
      {/* Список ошибок */}
      <View style={styles.bugsContainer}>
        {filteredBugs.length > 0 ? (
          filteredBugs.map(renderBugCard)
        ) : (
          <Text style={styles.emptyText}>
            Нет ошибок, соответствующих выбранному фильтру
          </Text>
        )}
      </View>
      
      {/* Кнопка добавления новой ошибки */}
      <Button
        title="Добавить новую ошибку"
        onPress={() => console.log('Add new bug')}
        style={styles.addButton}
      />
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
    flex: 1,
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.TINY,
  },
  bugsContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  bugCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  bugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  bugTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    paddingVertical: DIMENSIONS.SPACING.TINY,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
  },
  priorityText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    fontWeight: '500',
    color: COLORS.TEXT_INVERSE,
  },
  bugDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  bugDetails: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  bugDetail: {
    flexDirection: 'row',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  bugDetailLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_TERTIARY,
    width: 100,
  },
  bugDetailValue: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
    fontWeight: '500',
  },
  solutionContainer: {
    backgroundColor: COLORS.GRAY_100,
    padding: DIMENSIONS.SPACING.MEDIUM,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  solutionLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  solutionText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  bugActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bugAction: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.TINY,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginVertical: DIMENSIONS.SPACING.XLARGE,
  },
  addButton: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
});

export default BugFixScreen;
