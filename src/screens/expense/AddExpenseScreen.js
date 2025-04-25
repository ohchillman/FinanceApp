import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../constants/categories';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AmountInput from '../../components/expense/AmountInput';
import CategorySelector from '../../components/expense/CategorySelector';

const AddExpenseScreen = ({ navigation }) => {
  const { addExpense } = useExpenses();
  
  // Состояния для формы
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currency, setCurrency] = useState('₽');
  const [date, setDate] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Обработчик сохранения расхода
  const handleSaveExpense = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Валидация
      if (!amount || parseFloat(amount) <= 0) {
        setError('Пожалуйста, введите корректную сумму');
        setIsProcessing(false);
        return;
      }
      
      // Создание объекта расхода
      const expenseData = {
        amount: parseFloat(amount),
        description,
        category_id: selectedCategoryId,
        currency,
        date
      };
      
      // Сохранение расхода
      await addExpense(expenseData);
      
      // Сброс формы
      setAmount('0');
      setDescription('');
      setSelectedCategoryId(null);
      
      // Возврат на главный экран
      navigation.navigate('HomeTab');
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('Не удалось сохранить расход. Пожалуйста, попробуйте снова.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Обработчик выбора категории
  const handleCategorySelect = (category) => {
    setSelectedCategoryId(category.id);
  };

  // Обработчик распознавания текста
  const handleRecognizeText = async () => {
    if (!textInput.trim()) {
      setError('Пожалуйста, введите текст для распознавания');
      return;
    }
    
    try {
      setIsRecognizing(true);
      setError(null);
      
      // Здесь будет интеграция с OpenRouter и моделями Gemini
      // Пока используем заглушку для демонстрации
      
      // Имитация задержки запроса к API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Простой парсинг текста (будет заменен на AI-распознавание)
      const result = parseExpenseText(textInput);
      
      if (result) {
        setAmount(result.amount.toString());
        setDescription(result.description);
        
        // Поиск подходящей категории по ключевым словам
        if (result.category) {
          const matchedCategory = CATEGORIES.find(cat => 
            cat.keywords.some(keyword => 
              result.category.toLowerCase().includes(keyword.toLowerCase())
            )
          );
          
          if (matchedCategory) {
            setSelectedCategoryId(matchedCategory.id);
          }
        }
      }
    } catch (err) {
      console.error('Error recognizing text:', err);
      setError('Не удалось распознать текст. Пожалуйста, попробуйте снова.');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Простой парсер текста (будет заменен на AI-распознавание)
  const parseExpenseText = (text) => {
    // Ищем числа, которые могут быть суммой
    const amountMatch = text.match(/\d+(\s*[.,]\s*\d+)?/);
    
    // Извлекаем возможную категорию
    const categoryWords = CATEGORIES.flatMap(cat => cat.keywords);
    const words = text.toLowerCase().split(/\s+/);
    const categoryMatch = words.find(word => categoryWords.includes(word));
    
    // Извлекаем описание (все, что не сумма и не категория)
    let description = text;
    if (amountMatch) {
      description = description.replace(amountMatch[0], '').trim();
    }
    
    return {
      amount: amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 0,
      description: description,
      category: categoryMatch || ''
    };
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сумма</Text>
          <AmountInput
            value={amount}
            onChangeValue={setAmount}
            currency={currency}
            style={styles.amountInput}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Что вы купили?"
            style={styles.input}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Категория</Text>
          <CategorySelector
            categories={CATEGORIES}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
            style={styles.categorySelector}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Распознавание текста</Text>
          <Text style={styles.sectionDescription}>
            Введите текст о расходе, и мы автоматически распознаем сумму и категорию
          </Text>
          <Input
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Например: Потратил 2500 рублей на продукты"
            multiline
            numberOfLines={3}
            style={styles.textInput}
          />
          <Button
            title={isRecognizing ? "Распознавание..." : "Распознать"}
            onPress={handleRecognizeText}
            disabled={isRecognizing || !textInput.trim()}
            type="secondary"
            style={styles.recognizeButton}
          />
        </View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <Button
          title={isProcessing ? "Сохранение..." : "Сохранить расход"}
          onPress={handleSaveExpense}
          disabled={isProcessing || parseFloat(amount) <= 0}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: DIMENSIONS.SPACING.LARGE,
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
  sectionDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  amountInput: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  input: {
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  textInput: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  categorySelector: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  recognizeButton: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  saveButton: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.XLARGE,
  },
});

export default AddExpenseScreen;
