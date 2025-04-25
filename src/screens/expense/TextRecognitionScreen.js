import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import textRecognitionService from '../../services/ai/textRecognitionService';

const TextRecognitionScreen = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [recognizedData, setRecognizedData] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState(null);
  
  // Получаем функцию для добавления расхода из контекста
  const { addExpense } = useExpenses();
  
  // Обработчик распознавания текста
  const handleRecognize = async () => {
    if (!text.trim()) {
      setError('Пожалуйста, введите текст для распознавания');
      return;
    }
    
    try {
      setIsRecognizing(true);
      setError(null);
      
      // Вызываем сервис распознавания текста
      const result = await textRecognitionService.recognizeExpense(text);
      
      // Сохраняем результат распознавания
      setRecognizedData(result);
    } catch (err) {
      console.error('Error recognizing text:', err);
      setError('Не удалось распознать текст. Пожалуйста, попробуйте снова.');
    } finally {
      setIsRecognizing(false);
    }
  };
  
  // Обработчик сохранения распознанного расхода
  const handleSaveExpense = async () => {
    if (!recognizedData) {
      setError('Нет данных для сохранения');
      return;
    }
    
    try {
      // Добавляем распознанный расход
      await addExpense(recognizedData);
      
      // Сбрасываем форму
      setText('');
      setRecognizedData(null);
      
      // Возвращаемся на главный экран
      navigation.navigate('HomeTab');
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('Не удалось сохранить расход. Пожалуйста, попробуйте снова.');
    }
  };
  
  // Обработчик редактирования распознанных данных
  const handleEditData = () => {
    // Переходим на экран добавления расхода с предзаполненными данными
    navigation.navigate('AddExpenseTab', { expenseData: recognizedData });
  };
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency) => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency || '₽'}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.title}>Распознавание расходов</Text>
        <Text style={styles.description}>
          Введите текст о вашем расходе, и мы автоматически распознаем сумму, категорию и другие детали
        </Text>
        
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Например: Потратил 2500 рублей на продукты в магазине"
          multiline
          numberOfLines={4}
          style={styles.textInput}
        />
        
        <Button
          title={isRecognizing ? "Распознавание..." : "Распознать"}
          onPress={handleRecognize}
          disabled={isRecognizing || !text.trim()}
          style={styles.recognizeButton}
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
      
      {recognizedData && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Распознанная информация</Text>
          
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Сумма:</Text>
              <Text style={styles.resultValue}>
                {formatAmount(recognizedData.amount, recognizedData.currency)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Категория:</Text>
              <Text style={styles.resultValue}>
                {recognizedData.category_id ? 
                  getCategoryNameById(recognizedData.category_id) : 
                  'Не определена'}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Описание:</Text>
              <Text style={styles.resultValue}>
                {recognizedData.description || 'Без описания'}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Дата:</Text>
              <Text style={styles.resultValue}>
                {recognizedData.date ? 
                  recognizedData.date.toLocaleDateString('ru-RU') : 
                  new Date().toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              title="Редактировать"
              onPress={handleEditData}
              type="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Сохранить"
              onPress={handleSaveExpense}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// Вспомогательная функция для получения названия категории по ID
const getCategoryNameById = (categoryId) => {
  const categoryMap = {
    'food': 'Еда',
    'transport': 'Транспорт',
    'home': 'Дом',
    'health': 'Здоровье',
    'subscriptions': 'Подписки',
    'entertainment': 'Развлечения',
    'family': 'Семья',
    'business': 'Бизнес'
  };
  
  return categoryMap[categoryId] || 'Другое';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: DIMENSIONS.SPACING.LARGE,
  },
  inputSection: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  textInput: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  recognizeButton: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  resultSection: {
    flex: 1,
  },
  resultTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  resultCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.LARGE,
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  resultLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: DIMENSIONS.SPACING.MEDIUM,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
  },
});

export default TextRecognitionScreen;
