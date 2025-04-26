import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import textRecognitionService from '../../services/ai/textRecognitionService';

const HomeScreen = ({ navigation }) => {
  const { expenses, loading, error, refreshData } = useExpenses();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [text, setText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);

  // Вычисление общей суммы расходов
  useEffect(() => {
    if (expenses.length > 0) {
      const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalExpenses(total);
    }
  }, [expenses]);

  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency = '₽') => {
    return `${parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} ${currency}`;
  };

  // Обработчик нажатия на кнопку добавления расхода
  const handleAddExpense = () => {
    navigation.navigate('AddExpenseTab');
  };

  // Обработчик нажатия на кнопку просмотра всех расходов
  const handleViewAllExpenses = () => {
    navigation.navigate('ExpensesListTab');
  };

  // Обработчик распознавания текста
  const handleRecognize = async () => {
    if (!text.trim()) {
      setRecognitionError('Пожалуйста, введите текст для распознавания');
      return;
    }
    
    try {
      setIsRecognizing(true);
      setRecognitionError(null);
      
      // Вызываем сервис распознавания текста
      const result = await textRecognitionService.recognizeExpense(text);
      
      // Переходим на экран с результатами распознавания
      navigation.navigate('TextRecognitionTab', { recognizedData: result, inputText: text });
      
      // Очищаем поле ввода
      setText('');
    } catch (err) {
      console.error('Error recognizing text:', err);
      setRecognitionError('Не удалось распознать текст. Пожалуйста, попробуйте снова.');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Обработчик нажатия на кнопку голосового ввода
  const handleVoiceInput = () => {
    navigation.navigate('VoiceRecognitionTab');
  };

  return (
    <View style={styles.container}>
      {/* Секция с общей суммой расходов */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceTitle}>Ваш баланс</Text>
        <Text style={styles.balanceAmount}>{formatAmount(totalExpenses)}</Text>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllExpenses}
        >
          <Text style={styles.viewAllButtonText}>Посмотреть все расходы</Text>
        </TouchableOpacity>
      </View>
      
      {/* Секция ввода текста */}
      <View style={styles.inputSection}>
        <Text style={styles.inputTitle}>Добавить расход</Text>
        <Text style={styles.inputDescription}>
          Введите информацию о расходе, и мы автоматически распознаем детали
        </Text>
        
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Например: Потратил 2500 рублей на продукты в магазине"
          multiline
          numberOfLines={3}
          style={styles.textInput}
        />
        
        {recognitionError && (
          <Text style={styles.errorText}>{recognitionError}</Text>
        )}
        
        <View style={styles.actionButtons}>
          <Button
            title={isRecognizing ? "Распознавание..." : "Распознать"}
            onPress={handleRecognize}
            disabled={isRecognizing || !text.trim()}
            style={styles.recognizeButton}
          />
          
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={handleVoiceInput}
          >
            <View style={styles.voiceButtonInner}>
              <Image 
                source={require('../../../assets/icons/microphone.png')} 
                style={styles.voiceIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.voiceButtonText}>Продиктовать</Text>
          </TouchableOpacity>
        </View>
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
  balanceSection: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: DIMENSIONS.SPACING.XLARGE,
    paddingHorizontal: DIMENSIONS.SPACING.LARGE,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_INVERSE,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  balanceAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_1,
    fontWeight: 'bold',
    color: COLORS.TEXT_INVERSE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  viewAllButton: {
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewAllButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
  },
  inputSection: {
    padding: DIMENSIONS.SPACING.LARGE,
  },
  inputTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  inputDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  textInput: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recognizeButton: {
    flex: 1,
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  voiceButton: {
    alignItems: 'center',
  },
  voiceButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.PRIMARY,
  },
  voiceButtonText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_PRIMARY,
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

export default HomeScreen;
