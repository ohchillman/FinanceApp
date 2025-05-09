# Исправление зависимостей в FinanceApp

## Выявленные проблемы

После предыдущих исправлений возникла новая ошибка при запуске приложения:

```
Unable to resolve module react-native-chart-kit from /Users/ohchillman/Documents/FinanceApp/src/screens/analytics/AnalyticsScreen.js: react-native-chart-kit could not be found within the project or in these directories:
  node_modules
```

При анализе кода приложения были обнаружены и другие отсутствующие зависимости, которые необходимы для корректной работы различных компонентов.

## Установленные зависимости

Были установлены следующие пакеты:

1. **react-native-chart-kit** - библиотека для создания графиков и диаграмм, используется в компоненте AnalyticsScreen для отображения линейных и круговых диаграмм.

2. **expo-sqlite** - библиотека для работы с SQLite базой данных, используется в ExpenseContext для хранения данных о расходах и категориях.

3. **uuid** - библиотека для генерации уникальных идентификаторов, используется в ExpenseContext при создании новых записей.

4. **expo-secure-store** - библиотека для безопасного хранения данных, используется в SubscriptionContext для хранения информации о подписке пользователя.

## Команды установки

```bash
# Установка библиотеки для графиков
npm install react-native-chart-kit

# Установка библиотек для работы с данными
npm install expo-sqlite uuid

# Установка библиотеки для безопасного хранения
npm install expo-secure-store
```

## Затронутые компоненты

Эти зависимости используются в следующих компонентах приложения:

1. **AnalyticsScreen.js** - использует react-native-chart-kit для отображения графиков расходов.

2. **ExpenseContext.js** - использует expo-sqlite для хранения данных о расходах и uuid для генерации идентификаторов.

3. **SubscriptionContext.js** - использует expo-secure-store для хранения информации о подписке пользователя.

## Результат

После установки всех необходимых зависимостей приложение должно запускаться без ошибок и корректно отображать все экраны, включая экран аналитики с графиками.
