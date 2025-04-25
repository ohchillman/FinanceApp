# Инструкция по установке зависимостей

После обновления кода из GitHub необходимо установить все зависимости проекта локально. Это важный шаг, который нужно выполнить перед запуском приложения.

## Шаги для установки зависимостей

1. Убедитесь, что вы находитесь в директории проекта:
   ```bash
   cd FinanceApp
   ```

2. Установите все зависимости, указанные в package.json:
   ```bash
   npm install
   ```
   или, если вы используете Yarn:
   ```bash
   yarn install
   ```

3. После успешной установки всех зависимостей вы можете запустить приложение:
   ```bash
   npx expo start
   ```
   
   Для запуска с туннелем (чтобы открыть на устройстве):
   ```bash
   npx expo start --tunnel
   ```

## Решение распространенных проблем

### Ошибка "X is added as a dependency but doesn't seem to be installed"

Если вы видите ошибку вида:
```
CommandError: "expo-secure-store" is added as a dependency in your project's package.json but it doesn't seem to be installed.
```

Это означает, что зависимость добавлена в package.json, но не установлена локально. Выполните `npm install` для решения проблемы.

### Ошибка "Unable to resolve module X"

Если вы видите ошибку вида:
```
Unable to resolve module react-native-chart-kit
```

Это означает, что модуль не найден. Убедитесь, что вы выполнили `npm install` после получения последних изменений из репозитория.

## Установленные зависимости

В проект были добавлены следующие зависимости:

1. Навигация:
   - @react-navigation/native
   - @react-navigation/bottom-tabs
   - @react-navigation/stack
   - react-native-screens
   - react-native-safe-area-context

2. Функциональность:
   - react-native-chart-kit (для графиков)
   - expo-sqlite (для базы данных)
   - uuid (для генерации ID)
   - expo-secure-store (для хранения данных подписки)
