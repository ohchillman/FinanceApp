export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    features: [
      'Ручной ввод расходов',
      'Базовое распознавание категорий',
      'Основная аналитика расходов',
      'Ограниченное количество категорий',
      'Базовая валюта по умолчанию'
    ]
  },
  MONTHLY: {
    id: 'premium_monthly',
    name: 'Премиум (месячный)',
    price: 299,
    period: 'month',
    features: [
      'Голосовой ввод расходов',
      'Автоматическое распознавание валюты',
      'Расширенная аналитика и отчеты',
      'Экспорт данных в различные форматы',
      'Неограниченное количество категорий и меток',
      'Финансовые цели и отслеживание прогресса',
      'Персонализированные рекомендации',
      'Напоминания о регулярных платежах'
    ]
  },
  YEARLY: {
    id: 'premium_yearly',
    name: 'Премиум (годовой)',
    price: 2490,
    period: 'year',
    discount: 30,
    features: [
      'Голосовой ввод расходов',
      'Автоматическое распознавание валюты',
      'Расширенная аналитика и отчеты',
      'Экспорт данных в различные форматы',
      'Неограниченное количество категорий и меток',
      'Финансовые цели и отслеживание прогресса',
      'Персонализированные рекомендации',
      'Напоминания о регулярных платежах',
      'Приоритетная поддержка'
    ]
  },
  TRIAL: {
    id: 'trial',
    name: 'Пробный период',
    price: 0,
    duration: 7, // дней
    features: [
      'Все премиум-функции',
      'Доступно в течение 7 дней'
    ]
  }
};
