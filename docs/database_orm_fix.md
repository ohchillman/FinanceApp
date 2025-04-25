# Исправление проблемы инициализации базы данных в приложении

## Выявленная проблема

После предыдущих исправлений приложение начало запускаться и отображать главный экран, но возникла новая ошибка:

```
Failed to initialize database
```

Эта ошибка указывает на то, что библиотека react-native-sqlite-storage, которую мы использовали для замены expo-sqlite, не работает корректно в среде Expo. Хотя react-native-sqlite-storage является мощной библиотекой для работы с SQLite в React Native, она требует дополнительной нативной настройки, которая сложна в проектах Expo без ejection.

## Решение

Для решения этой проблемы мы заменили react-native-sqlite-storage на expo-sqlite-orm - библиотеку, которая специально разработана для работы с SQLite в проектах Expo и предоставляет удобный ORM (Object-Relational Mapping) интерфейс.

### Шаги, выполненные для исправления:

1. Установлена библиотека expo-sqlite-orm:
   ```bash
   npm install expo-sqlite-orm --legacy-peer-deps
   ```
   
   Флаг `--legacy-peer-deps` был необходим из-за несоответствия версий между expo-sqlite-orm (требует expo-sqlite ^14.0.3) и текущей версией expo-sqlite в проекте (15.1.4).

2. Полностью переработан код в ExpenseContext.js:
   - Заменен импорт с `import SQLite from 'react-native-sqlite-storage'` на `import * as SQLite from 'expo-sqlite'` и `import { BaseModel, types } from 'expo-sqlite-orm'`
   - Созданы модели данных с использованием ORM подхода
   - Определены схемы таблиц с помощью columnMapping
   - Переработаны все функции для работы с базой данных с использованием ORM методов

### Ключевые изменения в коде:

#### 1. Определение моделей данных

```javascript
// Определение модели категории
class Category extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return SQLite.openDatabase('expenses.db');
  }

  static get tableName() {
    return 'categories';
  }

  static get columnMapping() {
    return {
      id: { type: types.TEXT, primary_key: true },
      name: { type: types.TEXT, not_null: true },
      icon: { type: types.TEXT },
      color: { type: types.TEXT },
      is_default: { type: types.INTEGER, default: 0 },
      created_at: { type: types.INTEGER },
      updated_at: { type: types.INTEGER }
    };
  }
}

// Аналогично для модели Expense
```

#### 2. Инициализация базы данных

```javascript
// Функция инициализации базы данных
const initDatabase = async () => {
  try {
    setLoading(true);
    
    // Создание таблиц через ORM
    await Category.createTable();
    await Expense.createTable();
    
    console.log('Database tables created successfully');
    
    // Загрузка категорий и расходов
    await loadCategories();
    await loadExpenses();
    
    setLoading(false);
  } catch (err) {
    console.error('Database initialization error:', err);
    setError('Failed to initialize database');
    setLoading(false);
  }
};
```

#### 3. Операции с данными

```javascript
// Загрузка категорий
const loadCategories = async () => {
  try {
    const loadedCategories = await Category.query();
    setCategories(loadedCategories);
    return loadedCategories;
  } catch (err) {
    console.error('Error loading categories:', err);
    setError('Failed to load categories');
    throw err;
  }
};

// Добавление расхода
const addExpense = async (expenseData) => {
  try {
    const now = Date.now();
    const newExpense = {
      id: uuidv4(),
      ...expenseData,
      date: expenseData.date ? expenseData.date.getTime() : now,
      created_at: now,
      updated_at: now,
      is_deleted: 0
    };
    
    // Создаем запись в базе данных
    const expense = new Expense(newExpense);
    await expense.save();
    
    // Перезагружаем расходы для получения актуальных данных
    await loadExpenses();
    return newExpense;
  } catch (err) {
    console.error('Error adding expense:', err);
    setError('Failed to add expense');
    throw err;
  }
};
```

## Преимущества нового решения

1. **Совместимость с Expo**: expo-sqlite-orm специально разработан для работы в среде Expo без необходимости ejection
2. **Простота использования**: ORM подход упрощает работу с базой данных, предоставляя объектно-ориентированный интерфейс
3. **Типизация данных**: Библиотека обеспечивает типизацию данных и валидацию схемы
4. **Меньше кода**: Меньше шаблонного кода для выполнения стандартных операций CRUD
5. **Лучшая поддержка**: Библиотека хорошо интегрируется с экосистемой Expo

## Результат

После внесения этих изменений приложение должно корректно инициализировать базу данных SQLite и работать без ошибок. Все функции для работы с расходами и категориями теперь используют ORM подход, что делает код более надежным, читаемым и поддерживаемым.
