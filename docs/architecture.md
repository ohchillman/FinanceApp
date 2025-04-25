# AI Expense Logger - Архитектура приложения

## Общая архитектура

Приложение AI Expense Logger будет построено на основе архитектуры React Native с использованием EXPO, что обеспечит кроссплатформенную совместимость и упрощенную разработку. Архитектура приложения будет следовать принципам чистой архитектуры с разделением на следующие слои:

### 1. Слой представления (UI Layer)
- Компоненты React Native
- Навигация (React Navigation)
- Экраны и модальные окна
- Стили и темы

### 2. Слой бизнес-логики (Business Logic Layer)
- Контекст состояния приложения (React Context API)
- Хуки для управления состоянием
- Сервисы для работы с AI и распознаванием
- Логика обработки и категоризации расходов

### 3. Слой данных (Data Layer)
- Локальное хранилище (AsyncStorage/SQLite)
- API-клиенты для внешних сервисов
- Репозитории для доступа к данным
- Модели данных

### 4. Инфраструктурный слой (Infrastructure Layer)
- Конфигурация приложения
- Утилиты и хелперы
- Интеграция с нативными функциями
- Логирование и аналитика

## Структура базы данных

Для хранения данных будет использоваться SQLite через библиотеку expo-sqlite, что обеспечит надежное локальное хранение данных пользователя. Структура базы данных будет включать следующие основные таблицы:

### 1. Таблица пользователей (Users)
```
users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at INTEGER,
  default_currency TEXT,
  subscription_status TEXT,
  subscription_expiry INTEGER,
  settings TEXT
)
```

### 2. Таблица расходов (Expenses)
```
expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount REAL,
  currency TEXT,
  category_id TEXT,
  description TEXT,
  date INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

### 3. Таблица категорий (Categories)
```
categories (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  icon TEXT,
  color TEXT,
  is_default INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### 4. Таблица меток (Tags)
```
tags (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### 5. Таблица связей расходов и меток (ExpenseTags)
```
expense_tags (
  expense_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (expense_id, tag_id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
)
```

### 6. Таблица финансовых целей (Goals)
```
goals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  target_amount REAL,
  current_amount REAL,
  currency TEXT,
  deadline INTEGER,
  category_id TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

### 7. Таблица напоминаний (Reminders)
```
reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  amount REAL,
  currency TEXT,
  category_id TEXT,
  frequency TEXT,
  next_date INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
)
```

## Структура директорий проекта

```
/src
  /assets
    /fonts
    /images
    /icons
  /components
    /common
    /expense
    /analytics
    /subscription
    /settings
  /screens
    /auth
    /home
    /expense
    /analytics
    /goals
    /settings
    /subscription
  /navigation
    AppNavigator.js
    AuthNavigator.js
    TabNavigator.js
  /services
    /ai
      openRouterService.js
      textRecognitionService.js
      voiceRecognitionService.js
    /database
      databaseService.js
      migrations.js
    /subscription
      subscriptionService.js
    /currency
      currencyService.js
  /hooks
    useExpenses.js
    useCategories.js
    useSubscription.js
    useAI.js
  /context
    AppContext.js
    AuthContext.js
    ExpenseContext.js
  /models
    Expense.js
    Category.js
    User.js
    Goal.js
  /utils
    dateUtils.js
    currencyUtils.js
    validationUtils.js
    analyticsUtils.js
  /constants
    colors.js
    dimensions.js
    categories.js
    subscriptionPlans.js
  /config
    config.js
    env.js
```

## Интеграция с внешними сервисами

### 1. OpenRouter API для AI-функциональности
- Интеграция с моделями Gemini для распознавания текста
- Обработка и категоризация расходов
- Генерация персонализированных рекомендаций

### 2. Сервисы распознавания голоса
- Использование нативных API для распознавания голоса
- Интеграция с expo-speech для преобразования голоса в текст

### 3. Система In-App Purchases для подписок
- Интеграция с Apple StoreKit для iOS
- Управление подписками и пробными периодами
- Проверка статуса подписки

### 4. API для работы с валютами
- Получение актуальных курсов валют
- Конвертация между различными валютами
- Определение валюты по языку ввода

## Система монетизации

Приложение будет использовать модель Freemium с базовыми функциями, доступными бесплатно, и расширенными функциями, доступными по подписке.

### Бесплатные функции
- Ручной ввод расходов с базовым распознаванием категорий
- Основная аналитика расходов
- Ограниченное количество категорий и меток
- Базовая валюта по умолчанию

### Премиум функции (по подписке)
- Голосовой ввод расходов
- Автоматическое распознавание валюты
- Расширенная аналитика и отчеты
- Экспорт данных в различные форматы
- Неограниченное количество категорий и меток
- Финансовые цели и отслеживание прогресса
- Персонализированные рекомендации
- Напоминания о регулярных платежах

### Планы подписки
- Месячная подписка
- Годовая подписка (со скидкой)
- Пробный период (7 дней)

## Механизмы удержания пользователей

- Персонализированные уведомления о тенденциях расходов
- Еженедельные и месячные отчеты о финансовом состоянии
- Геймификация через достижение финансовых целей
- Напоминания о внесении регулярных расходов
- Персонализированные советы по экономии
- Система наград за регулярное использование приложения
