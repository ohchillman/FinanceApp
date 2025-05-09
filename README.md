# AI Expense Logger

Умное приложение для учета расходов с использованием искусственного интеллекта, разработанное на React Native с EXPO.

## Особенности приложения

- **Умное распознавание расходов** — просто введите текст о вашей трате, и приложение автоматически определит сумму, категорию и другие детали
- **Голосовой ввод** — надиктуйте информацию о расходе, и приложение мгновенно распознает все необходимые данные (Premium)
- **Автоматическое определение валюты** — приложение определяет валюту в зависимости от языка и контекста (Premium)
- **Детальная аналитика** — наглядные графики и отчеты помогут понять, на что вы тратите больше всего
- **Персонализированные рекомендации** — получайте советы по оптимизации расходов на основе вашего финансового поведения
- **Напоминания о платежах** — не пропустите важные регулярные платежи и подписки (Premium)
- **Современный дизайн** — интуитивно понятный интерфейс и приятная цветовая схема

## Инструкция по запуску проекта с использованием QR-кода и публичного туннеля

### Предварительные требования

1. Node.js (рекомендуется версия 16 или выше)
2. npm или yarn
3. Expo CLI
4. Expo Go на вашем iOS устройстве

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/ohchillman/FinanceApp.git
cd FinanceApp
```

### Шаг 2: Установка зависимостей

```bash
npm install
# или
yarn install
```

### Шаг 3: Настройка API-ключей

Создайте файл `.env` в корневой директории проекта и добавьте следующие переменные:

```
OPENROUTER_API_KEY=ваш_ключ_openrouter
```

### Шаг 4: Запуск проекта с Expo

```bash
npx expo start
```

### Шаг 5: Создание публичного туннеля

Для создания публичного туннеля и доступа к приложению через интернет, вы можете использовать ngrok или встроенный туннель Expo.

#### Вариант 1: Использование встроенного туннеля Expo

1. Остановите текущий процесс Expo (Ctrl+C)
2. Запустите Expo с флагом туннеля:

```bash
npx expo start --tunnel
```

3. Expo автоматически создаст публичный URL и отобразит QR-код в терминале

#### Вариант 2: Использование ngrok

1. Установите ngrok, если он еще не установлен:

```bash
npm install -g ngrok
# или
yarn global add ngrok
```

2. В отдельном терминале запустите ngrok для проксирования порта Expo (по умолчанию 19000):

```bash
ngrok http 19000
```

3. Ngrok предоставит публичный URL, который вы можете использовать для доступа к вашему приложению

### Шаг 6: Сканирование QR-кода

1. Откройте приложение Expo Go на вашем iOS устройстве
2. Нажмите на "Scan QR Code" и отсканируйте QR-код, отображаемый в терминале
3. Приложение будет загружено и запущено на вашем устройстве

### Шаг 7: Тестирование приложения

После запуска приложения вы можете протестировать следующие функции:

1. Добавление расходов через текстовый ввод
2. Просмотр аналитики и отчетов
3. Изучение персонализированных рекомендаций
4. Настройка валюты по умолчанию

Премиум-функции (голосовой ввод, автоматическое определение валюты и напоминания о платежах) доступны после активации пробного периода или оформления подписки.

## Структура проекта

```
ai-expense-logger/
├── assets/                  # Изображения и ресурсы
├── docs/                    # Документация проекта
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── common/          # Общие UI компоненты
│   │   └── expense/         # Компоненты для работы с расходами
│   ├── constants/           # Константы приложения
│   ├── context/             # React контексты
│   ├── navigation/          # Навигация приложения
│   ├── screens/             # Экраны приложения
│   │   ├── analytics/       # Экраны аналитики
│   │   ├── expense/         # Экраны управления расходами
│   │   ├── home/            # Главный экран
│   │   ├── onboarding/      # Экраны онбординга
│   │   ├── recommendations/ # Экраны рекомендаций
│   │   ├── reminders/       # Экраны напоминаний
│   │   ├── settings/        # Экраны настроек
│   │   ├── submission/      # Экраны подготовки к публикации
│   │   └── testing/         # Экраны тестирования
│   └── services/            # Сервисы приложения
│       ├── ai/              # Сервисы для работы с ИИ
│       └── currency/        # Сервисы для работы с валютами
├── App.js                   # Корневой компонент приложения
├── app.json                 # Конфигурация Expo
└── package.json             # Зависимости проекта
```

## Технологии

- React Native
- Expo
- OpenRouter API (для интеграции с моделями Gemini)
- SQLite (для локального хранения данных)
- React Navigation (для навигации)
- React Native Chart Kit (для графиков и диаграмм)

## Лицензия

MIT
