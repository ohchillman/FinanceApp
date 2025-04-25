import React, { createContext, useState, useEffect, useContext } from 'react';
import SQLite from 'react-native-sqlite-storage';
import { v4 as uuidv4 } from 'uuid';

// Включаем обещания для SQLite
SQLite.enablePromise(true);

// Создаем контекст для расходов
const ExpenseContext = createContext();

// Провайдер контекста расходов
export const ExpenseProvider = ({ children }) => {
  // Состояние для хранения расходов
  const [expenses, setExpenses] = useState([]);
  // Состояние для хранения категорий
  const [categories, setCategories] = useState([]);
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(true);
  // Состояние для отслеживания ошибок
  const [error, setError] = useState(null);
  // Состояние для хранения соединения с БД
  const [database, setDatabase] = useState(null);
  
  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase();
    
    // Закрываем соединение с БД при размонтировании компонента
    return () => {
      if (database) {
        database.close()
          .then(() => console.log('Database closed'))
          .catch(err => console.error('Error closing database:', err));
      }
    };
  }, []);
  
  // Функция инициализации базы данных
  const initDatabase = async () => {
    try {
      setLoading(true);
      
      // Открываем или создаем базу данных
      const db = await SQLite.openDatabase({
        name: 'expenses.db',
        location: 'default'
      });
      
      setDatabase(db);
      
      // Создание таблицы категорий
      await db.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          is_default INTEGER DEFAULT 0,
          created_at INTEGER,
          updated_at INTEGER
        );`
      );
      console.log('Categories table created successfully');
      
      // Создание таблицы расходов
      await db.executeSql(
        `CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          currency TEXT,
          category_id TEXT,
          description TEXT,
          date INTEGER,
          created_at INTEGER,
          updated_at INTEGER,
          is_deleted INTEGER DEFAULT 0,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );`
      );
      console.log('Expenses table created successfully');
      
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
  
  // Загрузка категорий из базы данных
  const loadCategories = async () => {
    try {
      if (!database) return;
      
      const [results] = await database.executeSql('SELECT * FROM categories ORDER BY name;');
      const rows = results.rows;
      const loadedCategories = [];
      
      for (let i = 0; i < rows.length; i++) {
        loadedCategories.push(rows.item(i));
      }
      
      setCategories(loadedCategories);
      return loadedCategories;
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      throw err;
    }
  };
  
  // Загрузка расходов из базы данных
  const loadExpenses = async () => {
    try {
      if (!database) return;
      
      const [results] = await database.executeSql(
        'SELECT e.*, c.name as category_name, c.color as category_color FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.is_deleted = 0 ORDER BY e.date DESC;'
      );
      
      const rows = results.rows;
      const loadedExpenses = [];
      
      for (let i = 0; i < rows.length; i++) {
        const expense = rows.item(i);
        loadedExpenses.push({
          ...expense,
          date: new Date(expense.date),
          created_at: new Date(expense.created_at),
          updated_at: new Date(expense.updated_at),
          category: expense.category_id ? {
            id: expense.category_id,
            name: expense.category_name,
            color: expense.category_color
          } : null
        });
      }
      
      setExpenses(loadedExpenses);
      return loadedExpenses;
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
      throw err;
    }
  };
  
  // Добавление нового расхода
  const addExpense = async (expenseData) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      const now = Date.now();
      const newExpense = {
        id: uuidv4(),
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        created_at: now,
        updated_at: now,
        is_deleted: 0
      };
      
      await database.executeSql(
        `INSERT INTO expenses (id, amount, currency, category_id, description, date, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newExpense.id,
          newExpense.amount,
          newExpense.currency || '₽',
          newExpense.category_id,
          newExpense.description || '',
          newExpense.date,
          newExpense.created_at,
          newExpense.updated_at,
          newExpense.is_deleted
        ]
      );
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses();
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    }
  };
  
  // Обновление существующего расхода
  const updateExpense = async (id, expenseData) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      const now = Date.now();
      const updatedExpense = {
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        updated_at: now
      };
      
      await database.executeSql(
        `UPDATE expenses
         SET amount = ?, currency = ?, category_id = ?, description = ?, date = ?, updated_at = ?
         WHERE id = ?;`,
        [
          updatedExpense.amount,
          updatedExpense.currency || '₽',
          updatedExpense.category_id,
          updatedExpense.description || '',
          updatedExpense.date,
          updatedExpense.updated_at,
          id
        ]
      );
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses();
      return updatedExpense;
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
      throw err;
    }
  };
  
  // Удаление расхода (мягкое удаление)
  const deleteExpense = async (id) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      const now = Date.now();
      
      await database.executeSql(
        `UPDATE expenses
         SET is_deleted = 1, updated_at = ?
         WHERE id = ?;`,
        [now, id]
      );
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses();
      return true;
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    }
  };
  
  // Добавление новой категории
  const addCategory = async (categoryData) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      const now = Date.now();
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: now,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      await database.executeSql(
        `INSERT INTO categories (id, name, icon, color, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          newCategory.id,
          newCategory.name,
          newCategory.icon || '',
          newCategory.color || '#CCCCCC',
          newCategory.is_default,
          newCategory.created_at,
          newCategory.updated_at
        ]
      );
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories();
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
      throw err;
    }
  };
  
  // Обновление существующей категории
  const updateCategory = async (id, categoryData) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      const now = Date.now();
      const updatedCategory = {
        ...categoryData,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      await database.executeSql(
        `UPDATE categories
         SET name = ?, icon = ?, color = ?, is_default = ?, updated_at = ?
         WHERE id = ?;`,
        [
          updatedCategory.name,
          updatedCategory.icon || '',
          updatedCategory.color || '#CCCCCC',
          updatedCategory.is_default,
          updatedCategory.updated_at,
          id
        ]
      );
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories();
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
      throw err;
    }
  };
  
  // Удаление категории
  const deleteCategory = async (id) => {
    try {
      if (!database) throw new Error('Database not initialized');
      
      await database.executeSql(
        `DELETE FROM categories WHERE id = ?;`,
        [id]
      );
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories();
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      throw err;
    }
  };
  
  // Получение расходов по категории
  const getExpensesByCategory = (categoryId) => {
    return expenses.filter(expense => expense.category_id === categoryId);
  };
  
  // Получение расходов за период
  const getExpensesByPeriod = (startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };
  
  // Получение суммы расходов по категории
  const getTotalByCategory = (categoryId) => {
    return getExpensesByCategory(categoryId)
      .reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };
  
  // Получение общей суммы расходов за период
  const getTotalByPeriod = (startDate, endDate) => {
    return getExpensesByPeriod(startDate, endDate)
      .reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };
  
  // Значение контекста
  const value = {
    expenses,
    categories,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    getExpensesByCategory,
    getExpensesByPeriod,
    getTotalByCategory,
    getTotalByPeriod,
    refreshData: async () => {
      setLoading(true);
      await loadCategories();
      await loadExpenses();
      setLoading(false);
    }
  };
  
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Хук для использования контекста расходов
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
