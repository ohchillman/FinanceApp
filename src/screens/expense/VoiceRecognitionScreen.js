import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { useExpenses } from '../../context/ExpenseContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import voiceRecognitionService from '../../services/ai/voiceRecognitionService';
import textRecognitionService from '../../services/ai/textRecognitionService';

const VoiceRecognitionScreen = ({ navigation, route }) => {
  // Состояния для управления записью и распознаванием
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [recognizedData, setRecognizedData] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  
  // Получаем функцию для добавления расхода из контекста
  const { addExpense } = useExpenses();
  
  // Запрашиваем разрешения при монтировании компонента
  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await voiceRecognitionService.requestPermissions();
      setHasPermission(granted);
    };
    
    checkPermissions();
    
    // Очищаем ресурсы при размонтировании компонента
    return () => {
      voiceRecognitionService.cleanup();
    };
  }, []);
  
  // Обработчик начала записи
  const handleStartRecording = async () => {
    try {
      setError(null);
      
      // Проверяем разрешения
      if (!hasPermission) {
        setError('Нет разрешения на запись аудио');
        return;
      }
      
      // Начинаем запись
      const success = await voiceRecognitionService.startRecording();
      
      if (success) {
        setIsRecording(true);
      } else {
        setError('Не удалось начать запись');
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Ошибка при начале записи');
    }
  };
  
  // Обработчик остановки записи
  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      
      // Останавливаем запись
      const uri = await voiceRecognitionService.stopRecording();
      
      if (uri) {
        setRecordingUri(uri);
        
        // Автоматически начинаем процесс распознавания
        handleTranscribeRecording(uri);
      } else {
        setError('Не удалось сохранить запись');
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Ошибка при остановке записи');
    }
  };
  
  // Обработчик воспроизведения записи
  const handlePlayRecording = async () => {
    try {
      setError(null);
      
      // Воспроизводим запись
      const success = await voiceRecognitionService.playRecording();
      
      if (!success) {
        setError('Не удалось воспроизвести запись');
      }
    } catch (err) {
      console.error('Error playing recording:', err);
      setError('Ошибка при воспроизведении записи');
    }
  };
  
  // Обработчик преобразования голоса в текст
  const handleTranscribeRecording = async (uri) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Преобразуем голос в текст
      const text = await voiceRecognitionService.transcribeRecording();
      
      if (text) {
        setTranscribedText(text);
        
        // Автоматически распознаем информацию о расходе из текста
        handleRecognizeExpense(text);
      } else {
        setError('Не удалось распознать речь');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error transcribing recording:', err);
      setError('Ошибка при распознавании речи');
      setIsProcessing(false);
    }
  };
  
  // Обработчик распознавания информации о расходе из текста
  const handleRecognizeExpense = async (text) => {
    try {
      // Распознаем информацию о расходе из текста
      const result = await textRecognitionService.recognizeExpense(text);
      
      if (result) {
        setRecognizedData(result);
      } else {
        setError('Не удалось распознать информацию о расходе');
      }
    } catch (err) {
      console.error('Error recognizing expense:', err);
      setError('Ошибка при распознавании информации о расходе');
    } finally {
      setIsProcessing(false);
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
      
      // Сбрасываем состояния
      setRecordingUri(null);
      setTranscribedText('');
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
  
  // Получение названия категории по ID
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
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Голосовой ввод расходов</Text>
        <Text style={styles.description}>
          Запишите голосовое сообщение о вашем расходе, и мы автоматически распознаем детали
        </Text>
      </View>
      
      <View style={styles.recordingSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing || hasPermission === false}
        >
          <View style={styles.recordButtonInner}>
            {isRecording && <View style={styles.recordingIndicator} />}
          </View>
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Остановить запись' : 'Начать запись'}
          </Text>
        </TouchableOpacity>
        
        {hasPermission === false && (
          <Text style={styles.errorText}>
            Нет разрешения на запись аудио. Пожалуйста, предоставьте разрешение в настройках.
          </Text>
        )}
        
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.processingText}>Обработка записи...</Text>
          </View>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
      
      {recordingUri && !isProcessing && (
        <Card style={styles.recordingCard}>
          <View style={styles.recordingActions}>
            <Button
              title="Воспроизвести"
              onPress={handlePlayRecording}
              type="secondary"
              style={styles.actionButton}
            />
          </View>
          
          {transcribedText && (
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionLabel}>Распознанный текст:</Text>
              <Text style={styles.transcriptionText}>{transcribedText}</Text>
            </View>
          )}
        </Card>
      )}
      
      {recognizedData && !isProcessing && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: DIMENSIONS.SPACING.LARGE,
  },
  header: {
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
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingButton: {
    backgroundColor: COLORS.ERROR_LIGHT,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.ERROR,
  },
  recordButtonText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: DIMENSIONS.SPACING.LARGE,
  },
  processingText: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  errorText: {
    color: COLORS.ERROR,
    marginTop: DIMENSIONS.SPACING.MEDIUM,
    textAlign: 'center',
  },
  recordingCard: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  transcriptionContainer: {
    marginTop: DIMENSIONS.SPACING.SMALL,
  },
  transcriptionLabel: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  transcriptionText: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontStyle: 'italic',
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

export default VoiceRecognitionScreen;
