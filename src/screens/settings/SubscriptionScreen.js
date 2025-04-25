import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import { SUBSCRIPTION_PLANS } from '../../constants/subscriptionPlans';
import { useSubscription } from '../../context/SubscriptionContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const SubscriptionScreen = ({ navigation }) => {
  const { 
    subscription, 
    loading, 
    error, 
    activateTrial, 
    purchaseSubscription, 
    isPremium,
    getTrialDaysLeft
  } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS.MONTHLY.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  
  // Обработчик активации пробного периода
  const handleActivateTrial = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);
      
      const success = await activateTrial();
      
      if (!success) {
        setProcessingError('Не удалось активировать пробный период');
      }
    } catch (err) {
      console.error('Error activating trial:', err);
      setProcessingError('Произошла ошибка при активации пробного периода');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Обработчик покупки подписки
  const handlePurchaseSubscription = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);
      
      const success = await purchaseSubscription(selectedPlan);
      
      if (!success) {
        setProcessingError('Не удалось оформить подписку');
      }
    } catch (err) {
      console.error('Error purchasing subscription:', err);
      setProcessingError('Произошла ошибка при оформлении подписки');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Рендер карточки плана подписки
  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    const isPlanActive = subscription.plan && subscription.plan.id === plan.id;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPlanActive && styles.activePlanCard
        ]}
        onPress={() => setSelectedPlan(plan.id)}
        disabled={isPremium() || isProcessing}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{plan.discount}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.planPrice}>
          <Text style={styles.priceAmount}>{plan.price} ₽</Text>
          {plan.period && (
            <Text style={styles.pricePeriod}>
              / {plan.period === 'month' ? 'месяц' : 'год'}
            </Text>
          )}
        </View>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>✓ {feature}</Text>
            </View>
          ))}
        </View>
        
        {isPlanActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Активен</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Подписка</Text>
        <Text style={styles.description}>
          Получите доступ к премиум-функциям для более удобного учета расходов
        </Text>
      </View>
      
      {isPremium() ? (
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {subscription.status === 'trial' ? 'Пробный период активен' : 'Премиум подписка активна'}
          </Text>
          
          {subscription.status === 'trial' && (
            <Text style={styles.statusDescription}>
              Осталось дней: {getTrialDaysLeft()}
            </Text>
          )}
          
          {subscription.expiryDate && (
            <Text style={styles.statusDescription}>
              Действует до: {new Date(subscription.expiryDate).toLocaleDateString('ru-RU')}
            </Text>
          )}
          
          <View style={styles.premiumFeaturesContainer}>
            <Text style={styles.premiumFeaturesTitle}>Доступные функции:</Text>
            {subscription.features.map((feature, index) => (
              <View key={index} style={styles.premiumFeatureItem}>
                <Text style={styles.premiumFeatureText}>✓ {feature}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <>
          <View style={styles.plansContainer}>
            {renderPlanCard(SUBSCRIPTION_PLANS.MONTHLY)}
            {renderPlanCard(SUBSCRIPTION_PLANS.YEARLY)}
          </View>
          
          <View style={styles.actionsContainer}>
            <Button
              title={isProcessing ? "Обработка..." : "Оформить подписку"}
              onPress={handlePurchaseSubscription}
              disabled={isProcessing}
              style={styles.actionButton}
            />
            
            <Text style={styles.orText}>или</Text>
            
            <Button
              title={isProcessing ? "Обработка..." : "Попробовать бесплатно 7 дней"}
              onPress={handleActivateTrial}
              type="secondary"
              disabled={isProcessing}
              style={styles.actionButton}
            />
          </View>
          
          {processingError && (
            <Text style={styles.errorText}>{processingError}</Text>
          )}
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Что включено в премиум-подписку:</Text>
            
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🎤</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Голосовой ввод расходов</Text>
                <Text style={styles.featureDescription}>
                  Просто надиктуйте информацию о расходе, и приложение автоматически распознает детали
                </Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>💱</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Автоматическое определение валюты</Text>
                <Text style={styles.featureDescription}>
                  Приложение определит валюту в зависимости от языка и контекста ввода
                </Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>📊</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Расширенная аналитика</Text>
                <Text style={styles.featureDescription}>
                  Детальные отчеты и графики для анализа ваших расходов
                </Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🔔</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Напоминания о платежах</Text>
                <Text style={styles.featureDescription}>
                  Получайте уведомления о регулярных платежах и подписках
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.termsText}>
            Оформляя подписку, вы соглашаетесь с условиями использования и политикой конфиденциальности.
            Подписка будет автоматически продлеваться, пока вы не отмените её.
          </Text>
        </>
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
  statusCard: {
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  statusTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  statusDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  premiumFeaturesContainer: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  premiumFeaturesTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  premiumFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  premiumFeatureText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_PRIMARY,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  planCard: {
    width: '48%',
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.LARGE,
    padding: DIMENSIONS.SPACING.MEDIUM,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  activePlanCard: {
    borderColor: COLORS.SUCCESS,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  planName: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  discountBadge: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.SMALL,
    paddingVertical: DIMENSIONS.SPACING.TINY,
  },
  discountText: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    fontWeight: 'bold',
    color: COLORS.TEXT_INVERSE,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  priceAmount: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  pricePeriod: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: DIMENSIONS.SPACING.TINY,
  },
  featuresContainer: {
    marginTop: DIMENSIONS.SPACING.SMALL,
  },
  featureItem: {
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  featureText: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.SMALL,
    paddingVertical: DIMENSIONS.SPACING.TINY,
  },
  activeBadgeText: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    fontWeight: 'bold',
    color: COLORS.TEXT_INVERSE,
  },
  actionsContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  actionButton: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  orText: {
    textAlign: 'center',
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginVertical: DIMENSIONS.SPACING.SMALL,
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  infoTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  featureDescription: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  termsText: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
});

export default SubscriptionScreen;
