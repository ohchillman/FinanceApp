# Исправление проблемы с контекстом React в приложении

## Выявленная проблема

При запуске приложения возникла ошибка контекста React:

```
Render Error
useExpenses must be used within an ExpenseProvider
```

Эта ошибка указывает на то, что компоненты приложения пытаются использовать хук `useExpenses`, но не обернуты в необходимый провайдер контекста `ExpenseProvider`.

## Причина проблемы

В предыдущих исправлениях мы обновили файл App.js, чтобы использовать компонент AppNavigator вместо шаблонного кода React Native. Однако мы не обернули AppNavigator в необходимые провайдеры контекста, которые требуются для работы приложения:

1. `ExpenseProvider` - для доступа к функциям управления расходами
2. `SubscriptionProvider` - для доступа к функциям управления подписками

Кроме того, отсутствовал компонент `NavigationContainer` из библиотеки @react-navigation/native, который необходим для правильной работы навигации.

## Решение

Обновлен файл App.js, чтобы правильно обернуть AppNavigator в необходимые провайдеры контекста:

```javascript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <ExpenseProvider>
        <SubscriptionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SubscriptionProvider>
      </ExpenseProvider>
    </>
  );
}
```

## Внесенные изменения

1. Добавлен импорт `NavigationContainer` из библиотеки @react-navigation/native
2. Добавлен импорт `ExpenseProvider` из ./src/context/ExpenseContext
3. Добавлен импорт `SubscriptionProvider` из ./src/context/SubscriptionContext
4. AppNavigator обернут в следующую структуру провайдеров:
   - ExpenseProvider (внешний)
   - SubscriptionProvider (средний)
   - NavigationContainer (внутренний)

## Результат

После внесения этих изменений приложение должно корректно работать без ошибок контекста. Компоненты теперь имеют доступ к контексту расходов и подписок, что позволяет использовать хуки `useExpenses` и `useSubscription` в любом месте приложения.
