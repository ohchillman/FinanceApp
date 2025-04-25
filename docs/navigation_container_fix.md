# Исправление проблемы с вложенными NavigationContainer в приложении

## Выявленная проблема

После предыдущих исправлений в приложении возникла новая ошибка:

```
Render Error
Looks like you have nested a 'NavigationContainer' inside another. Normally you need only one container at the root of the app, so this was probably an error. If this was intentional, wrap the container in 'NavigationIndependentTree' explicitly.
```

Эта ошибка указывает на то, что в приложении есть вложенные компоненты NavigationContainer, что не допускается библиотекой React Navigation. Согласно документации React Navigation, должен быть только один NavigationContainer на корневом уровне приложения.

## Причина проблемы

При исправлении проблемы с контекстом в App.js мы добавили NavigationContainer:

```javascript
// В App.js
<ExpenseProvider>
  <SubscriptionProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </SubscriptionProvider>
</ExpenseProvider>
```

Однако в файле AppNavigator.js уже был свой NavigationContainer:

```javascript
// В AppNavigator.js
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {/* ... */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

Это привело к вложению одного NavigationContainer внутрь другого, что вызвало ошибку.

## Решение

Для решения этой проблемы был удален NavigationContainer из компонента AppNavigator, оставив только один контейнер на корневом уровне в App.js:

```javascript
// Было в AppNavigator.js
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {/* ... */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Стало в AppNavigator.js
const AppNavigator = () => {
  return (
    <Tab.Navigator>
      {/* ... */}
    </Tab.Navigator>
  );
};
```

При этом NavigationContainer в App.js был сохранен:

```javascript
// В App.js (без изменений)
<ExpenseProvider>
  <SubscriptionProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </SubscriptionProvider>
</ExpenseProvider>
```

## Результат

После внесения этих изменений приложение должно корректно инициализировать навигацию без ошибок вложенных контейнеров. Теперь в приложении есть только один NavigationContainer на корневом уровне, что соответствует рекомендациям React Navigation.

Эта структура обеспечивает:
1. Правильную инициализацию навигации
2. Доступ к контексту расходов и подписок во всех экранах
3. Корректную работу всех навигационных функций
4. Отсутствие ошибок вложенных контейнеров
