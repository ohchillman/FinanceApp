import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SQLite from 'expo-sqlite';
import { Database, Repository, columnTypes } from 'expo-sqlite-orm';
import { v4 as uuidv4 } from 'uuid';

// Определение маппинга колонок для категорий
const categoryColumnMapping = {
  id: { type: columnTypes.TEXT, primary_key: true },
  name: { type: columnTypes.TEXT, not_null: true },
  icon: { type: columnTypes.TEXT },
  color: { type: columnTypes.TEXT },
  is_default: { type: columnTypes.INTEGER, default: 0 },
  created_at: { type: columnTypes.INTEGER },
  updated_at: { type: columnTypes.INTEGER }
};

// Определение маппинга колонок для расходов
const expenseColumnMapping = {
  id: { type: columnTypes.TEXT, primary_key: true },
  amount: { type: columnTypes.REAL, not_null: true },
  currency: { type: columnTypes.TEXT },
  category_id: { type: columnTypes.TEXT },
  description: { type: columnTypes.TEXT },
  date: { type: columnTypes.INTEGER },
  created_at: { type: columnTypes.INTEGER },
  updated_at: { type: columnTypes.INTEGER },
  is_deleted: { type: columnTypes.INTEGER, default: 0 }
};

// Имя базы данных
const DATABASE_NAME = 'expenses.db';

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
  // Репозитории для работы с данными
  const [categoryRepository, setCategoryRepository] = useState(null);
  const [expenseRepository, setExpenseRepository] = useState(null);
  
  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase();
  }, []);
  
  // Функция инициализации базы данных
  const initDatabase = async () => {
    try {
      setLoading(true);
      
      // Создаем репозитории для работы с данными
      const catRepo = new Repository(DATABASE_NAME, 'categories', categoryColumnMapping);
      const expRepo = new Repository(DATABASE_NAME, 'expenses', expenseColumnMapping);
      
      setCategoryRepository(catRepo);
      setExpenseRepository(expRepo);
      
      // Создание таблиц через выполнение SQL-запросов
      const db = Database.instance(DATABASE_NAME);
      
      db.transaction(
        tx => {
          // Создание таблицы категорий
          tx.executeSql(
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
          
          // Создание таблицы расходов
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS expenses (
              id TEXT PRIMARY KEY,
              amount REAL NOT NULL,
              currency TEXT,
              category_id TEXT,
              description TEXT,
              date INTEGER,
              created_at INTEGER,
              updated_at INTEGER,
              is_deleted INTEGER DEFAULT 0
            );`
          );
        },
        error => {
          console.error('Error creating tables:', error);
          setError('Failed to create database tables');
        },
        async () => {
          console.log('Database tables created successfully');
          
          // Загрузка категорий и расходов
          await loadCategories(catRepo);
          await loadExpenses(expRepo);
          
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Database initialization error:', err);
      setError('Failed to initialize database');
      setLoading(false);
    }
  };
  
  // Загрузка категорий из базы данных
  const loadCategories = async (repo) => {
    try {
      const loadedCategories = await repo.query();
      setCategories(loadedCategories);
      return loadedCategories;
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      throw err;
    }
  };
  
  // Загрузка расходов из базы данных
  const loadExpenses = async (repo) => {
    try {
      // Получаем все расходы, которые не удалены
      const loadedExpenses = await repo.query({
        where: {
          is_deleted: 0
        },
        order: {
          date: 'DESC'
        }
      });
      
      // Для каждого расхода добавляем информацию о категории
      const expensesWithCategories = await Promise.all(
        loadedExpenses.map(async (expense) => {
          if (expense.category_id && categoryRepository) {
            const category = await categoryRepository.find(expense.category_id);
            return {
              ...expense,
              date: new Date(expense.date),
              created_at: new Date(expense.created_at),
              updated_at: new Date(expense.updated_at),
              category: category ? {
                id: category.id,
                name: category.name,
                color: category.color
              } : null
            };
          }
          return {
            ...expense,
            date: new Date(expense.date),
            created_at: new Date(expense.created_at),
            updated_at: new Date(expense.updated_at),
            category: null
          };
        })
      );
      
      setExpenses(expensesWithCategories);
      return expensesWithCategories;
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
      throw err;
    }
  };
  
  // Добавление нового расхода
  const addExpense = async (expenseData) => {
    try {
      if (!expenseRepository) {
        throw new Error('Expense repository not initialized');
      }
      
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
      await expenseRepository.insert(newExpense);
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses(expenseRepository);
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
      if (!expenseRepository) {
        throw new Error('Expense repository not initialized');
      }
      
      // Находим запись в базе данных
      const expense = await expenseRepository.find(id);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      const now = Date.now();
      const updatedExpense = {
        ...expense,
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : expense.date,
        updated_at: now
      };
      
      // Обновляем запись в базе данных
      await expenseRepository.update(updatedExpense);
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses(expenseRepository);
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
      if (!expenseRepository) {
        throw new Error('Expense repository not initialized');
      }
      
      // Находим запись в базе данных
      const expense = await expenseRepository.find(id);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      // Помечаем как удаленную
      const now = Date.now();
      const updatedExpense = {
        ...expense,
        is_deleted: 1,
        updated_at: now
      };
      
      await expenseRepository.update(updatedExpense);
      
      // Перезагружаем расходы для получения актуальных данных
      await loadExpenses(expenseRepository);
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
      if (!categoryRepository) {
        throw new Error('Category repository not initialized');
      }
      
      const now = Date.now();
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: now,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      // Создаем запись в базе данных
      await categoryRepository.insert(newCategory);
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories(categoryRepository);
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
      if (!categoryRepository) {
        throw new Error('Category repository not initialized');
      }
      
      // Находим запись в базе данных
      const category = await categoryRepository.find(id);
      if (!category) {
        throw new Error('Category not found');
      }
      
      const now = Date.now();
      const updatedCategory = {
        ...category,
        ...categoryData,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      // Обновляем запись в базе данных
      await categoryRepository.update(updatedCategory);
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories(categoryRepository);
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
      if (!categoryRepository) {
        throw new Error('Category repository not initialized');
      }
      
      // Находим запись в базе данных
      const category = await categoryRepository.find(id);
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Удаляем категорию
      await categoryRepository.destroy(id);
      
      // Перезагружаем категории для получения актуальных данных
      await loadCategories(categoryRepository);
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
      if (categoryRepository && expenseRepository) {
        await loadCategories(categoryRepository);
        await loadExpenses(expenseRepository);
      }
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
