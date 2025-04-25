# Исправление конфликта версий зависимостей в приложении

## Выявленная проблема

После внедрения решения с использованием expo-sqlite-orm возникла проблема с конфликтом версий зависимостей при установке пакетов:

```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: expo-sqlite-orm@2.2.0
npm error Found: expo-sqlite@15.1.4
npm error node_modules/expo-sqlite
npm error   expo-sqlite@"^15.1.4" from the root project
npm error
npm error Could not resolve dependency:
npm error peer expo-sqlite@"^14.0.3" from expo-sqlite-orm@2.2.0
```

Эта ошибка указывает на то, что библиотека expo-sqlite-orm 2.2.0 требует expo-sqlite версии ^14.0.3, но в проекте установлена версия 15.1.4, что вызывает конфликт зависимостей.

## Решение

Для решения этой проблемы мы обновили файл package.json, чтобы обеспечить совместимость между пакетами:

1. Понизили версию expo-sqlite с 15.1.4 до 14.0.6, что соответствует требованиям expo-sqlite-orm:
   ```json
   "expo-sqlite": "^14.0.6"
   ```

2. Удалили неиспользуемую зависимость react-native-sqlite-storage, так как мы полностью перешли на expo-sqlite-orm:
   ```diff
   - "react-native-sqlite-storage": "^6.0.1"
   ```

## Изменения в package.json

```diff
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/stack": "^7.2.10",
    "axios": "^1.9.0",
    "expo": "~52.0.46",
    "expo-secure-store": "^14.0.1",
-   "expo-sqlite": "^15.1.4",
+   "expo-sqlite": "^14.0.6",
    "expo-sqlite-orm": "^2.2.0",
    "expo-status-bar": "~2.0.1",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-chart-kit": "^6.12.0",
    "react-native-safe-area-context": "^5.4.0",
    "react-native-screens": "^4.10.0",
-   "react-native-sqlite-storage": "^6.0.1",
    "uuid": "^11.1.0"
  }
}
```

## Инструкции по установке

После обновления package.json, вы можете установить зависимости без ошибок, используя стандартную команду:

```bash
npm install
```

Теперь все зависимости будут установлены корректно, без конфликтов версий, и приложение должно работать без ошибок инициализации базы данных.

## Преимущества этого решения

1. **Устранение конфликта версий**: Обеспечивает совместимость между expo-sqlite и expo-sqlite-orm
2. **Упрощение зависимостей**: Удаление неиспользуемых пакетов уменьшает размер проекта
3. **Стандартная установка**: Позволяет использовать обычную команду npm install без дополнительных флагов
4. **Стабильность**: Использование совместимых версий повышает стабильность приложения

## Результат

После внесения этих изменений в package.json, установка зависимостей должна проходить без ошибок, и приложение должно корректно инициализировать базу данных SQLite и работать без сбоев.
