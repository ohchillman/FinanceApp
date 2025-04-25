import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import Button from '../../components/common/Button';
import { useSubscription } from '../../context/SubscriptionContext';

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { activateTrial } = useSubscription();
  
  // Шаги онбординга
  const onboardingSteps = [
    {
      title: 'Добро пожаловать в AI Expense Logger',
      description: 'Умный помощник для учета ваших расходов с использованием искусственного интеллекта',
      image: require('../../assets/onboarding/welcome.png'), // Заглушка, в реальном приложении будут настоящие изображения
    },
    {
      title: 'Умное распознавание расходов',
      description: 'Просто введите текст о вашей трате, и приложение автоматически определит сумму, категорию и другие детали',
      image: require('../../assets/onboarding/text-recognition.png'),
    },
    {
      title: 'Голосовой ввод',
      description: 'Надиктуйте информацию о расходе, и приложение мгновенно распознает все необходимые данные',
      image: require('../../assets/onboarding/voice-input.png'),
    },
    {
      title: 'Детальная аналитика',
      description: 'Наглядные графики и отчеты помогут понять, на что вы тратите больше всего',
      image: require('../../assets/onboarding/analytics.png'),
    },
    {
      title: 'Персонализированные рекомендации',
      description: 'Получайте советы по оптимизации расходов на основе вашего финансового поведения',
      image: require('../../assets/onboarding/recommendations.png'),
    },
  ];
  
  // Обработчик перехода к следующему шагу
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };
  
  // Обработчик перехода к предыдущему шагу
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Обработчик пропуска онбординга
  const handleSkip = () => {
    handleFinish();
  };
  
  // Обработчик завершения онбординга
  const handleFinish = () => {
    // Сохраняем информацию о прохождении онбординга
    // В реальном приложении здесь будет сохранение в AsyncStorage
    
    // Переходим на главный экран
    navigation.replace('MainApp');
  };
  
  // Обработчик активации пробного периода
  const handleActivateTrial = async () => {
    try {
      const success = await activateTrial();
      
      if (success) {
        // Показываем сообщение об успешной активации
        // В реальном приложении здесь будет Toast или Alert
        
        // Переходим на главный экран
        navigation.replace('MainApp');
      } else {
        // Показываем сообщение об ошибке
        console.error('Failed to activate trial');
      }
    } catch (err) {
      console.error('Error activating trial:', err);
    }
  };
  
  // Текущий шаг онбординга
  const currentStepData = onboardingSteps[currentStep];
  
  // Индикаторы прогресса
  const renderProgressIndicators = () => {
    return (
      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressIndicator,
              index === currentStep && styles.activeProgressIndicator
            ]}
          />
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Кнопка пропуска */}
      {currentStep < onboardingSteps.length - 1 && (
        <View style={styles.skipContainer}>
          <Button
            title="Пропустить"
            onPress={handleSkip}
            type="text"
            style={styles.skipButton}
          />
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Изображение */}
        <View style={styles.imageContainer}>
          <Image
            source={currentStepData.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        {/* Текстовый контент */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>
        
        {/* Индикаторы прогресса */}
        {renderProgressIndicators()}
        
        {/* Кнопки навигации */}
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <Button
              title="Назад"
              onPress={handlePrevious}
              type="secondary"
              style={styles.navigationButton}
            />
          )}
          
          {currentStep < onboardingSteps.length - 1 ? (
            <Button
              title="Далее"
              onPress={handleNext}
              style={[
                styles.navigationButton,
                currentStep === 0 && styles.fullWidthButton
              ]}
            />
          ) : (
            <Button
              title="Начать"
              onPress={handleFinish}
              style={styles.navigationButton}
            />
          )}
        </View>
        
        {/* Кнопка активации пробного периода */}
        {currentStep === onboardingSteps.length - 1 && (
          <Button
            title="Активировать 7-дневный пробный период"
            onPress={handleActivateTrial}
            type="secondary"
            style={styles.trialButton}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: DIMENSIONS.SPACING.LARGE,
    zIndex: 10,
  },
  skipButton: {
    minWidth: 0,
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 100,
    paddingBottom: DIMENSIONS.SPACING.XLARGE,
    paddingHorizontal: DIMENSIONS.SPACING.LARGE,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.SPACING.XLARGE,
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.XLARGE,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_2,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.SPACING.XLARGE,
  },
  progressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.GRAY_300,
    marginHorizontal: DIMENSIONS.SPACING.TINY,
  },
  activeProgressIndicator: {
    backgroundColor: COLORS.PRIMARY,
    width: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: DIMENSIONS.SPACING.SMALL,
  },
  fullWidthButton: {
    flex: 1,
  },
  trialButton: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
});

export default OnboardingScreen;
