import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const AppStoreSubmissionScreen = ({ navigation }) => {
  // Секции подготовки к публикации
  const submissionSections = [
    {
      id: 'metadata',
      title: 'Метаданные приложения',
      items: [
        { id: 'app_name', name: 'Название приложения', status: 'completed' },
        { id: 'subtitle', name: 'Подзаголовок', status: 'completed' },
        { id: 'description', name: 'Описание', status: 'completed' },
        { id: 'keywords', name: 'Ключевые слова', status: 'completed' },
        { id: 'support_url', name: 'URL поддержки', status: 'pending' },
        { id: 'privacy_policy', name: 'Политика конфиденциальности', status: 'pending' },
      ]
    },
    {
      id: 'visual_assets',
      title: 'Визуальные материалы',
      items: [
        { id: 'app_icon', name: 'Иконка приложения', status: 'completed' },
        { id: 'screenshots_iphone', name: 'Скриншоты iPhone', status: 'completed' },
        { id: 'screenshots_ipad', name: 'Скриншоты iPad', status: 'pending' },
        { id: 'preview_video', name: 'Превью-видео', status: 'pending' },
      ]
    },
    {
      id: 'pricing',
      title: 'Ценообразование и доступность',
      items: [
        { id: 'price_tier', name: 'Ценовая категория', status: 'completed' },
        { id: 'subscription_setup', name: 'Настройка подписок', status: 'in_progress' },
        { id: 'territories', name: 'Территории доступности', status: 'completed' },
        { id: 'release_date', name: 'Дата релиза', status: 'pending' },
      ]
    },
    {
      id: 'technical',
      title: 'Технические аспекты',
      items: [
        { id: 'build_upload', name: 'Загрузка сборки', status: 'pending' },
        { id: 'version_info', name: 'Информация о версии', status: 'completed' },
        { id: 'app_review_info', name: 'Информация для проверки', status: 'pending' },
        { id: 'encryption', name: 'Информация о шифровании', status: 'completed' },
      ]
    },
  ];
  
  // Подсчет статистики подготовки
  const calculateStats = () => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    
    submissionSections.forEach(section => {
      section.items.forEach(item => {
        total++;
        if (item.status === 'completed') completed++;
        if (item.status === 'in_progress') inProgress++;
        if (item.status === 'pending') pending++;
      });
    });
    
    const completionPercentage = Math.round((completed / total) * 100);
    
    return { total, completed, inProgress, pending, completionPercentage };
  };
  
  const stats = calculateStats();
  
  // Рендер статуса элемента
  const renderStatus = (status) => {
    let color = COLORS.SUCCESS;
    let text = 'Готово';
    
    if (status === 'in_progress') {
      color = COLORS.WARNING;
      text = 'В процессе';
    } else if (status === 'pending') {
      color = COLORS.GRAY_400;
      text = 'Ожидает';
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{text}</Text>
      </View>
    );
  };
  
  // Рендер секции подготовки
  const renderSection = (section) => (
    <Card key={section.id} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      
      {section.items.map(item => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          {renderStatus(item.status)}
        </View>
      ))}
    </Card>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Подготовка к публикации</Text>
        <Text style={styles.description}>
          Статус подготовки приложения к публикации в App Store
        </Text>
      </View>
      
      {/* Прогресс подготовки */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Общий прогресс</Text>
          <Text style={styles.progressPercentage}>{stats.completionPercentage}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${stats.completionPercentage}%` }
            ]} 
          />
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{stats.completed}</Text>
            <Text style={styles.progressStatLabel}>Готово</Text>
          </View>
          
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{stats.inProgress}</Text>
            <Text style={styles.progressStatLabel}>В процессе</Text>
          </View>
          
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{stats.pending}</Text>
            <Text style={styles.progressStatLabel}>Ожидает</Text>
          </View>
        </View>
      </Card>
      
      {/* Секции подготовки */}
      <View style={styles.sectionsContainer}>
        {submissionSections.map(renderSection)}
      </View>
      
      {/* Кнопки действий */}
      <View style={styles.actionsContainer}>
        <Button
          title="Просмотреть руководство"
          onPress={() => console.log('View guide')}
          style={styles.actionButton}
        />
        
        <Button
          title="Подготовить сборку"
          onPress={() => console.log('Prepare build')}
          type="secondary"
          style={styles.actionButton}
        />
      </View>
      
      {/* Информационный блок */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Следующие шаги</Text>
        <Text style={styles.infoText}>
          1. Завершите настройку подписок в App Store Connect
        </Text>
        <Text style={styles.infoText}>
          2. Подготовьте скриншоты для iPad
        </Text>
        <Text style={styles.infoText}>
          3. Создайте страницу политики конфиденциальности
        </Text>
        <Text style={styles.infoText}>
          4. Подготовьте и загрузите финальную сборку приложения
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
  progressCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  progressTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  progressPercentage: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.GRAY_200,
    borderRadius: 4,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressStatValue: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  progressStatLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_TERTIARY,
  },
  sectionsContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  sectionCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  itemName: {
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
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
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
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  infoText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
});

export default AppStoreSubmissionScreen;
