import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SQLite from 'expo-sqlite';
import { BaseModel, types } from 'expo-sqlite-orm';
import { v4 as uuidv4 } from 'uuid';

// Create database connection
const database = SQLite.openDatabase('expenses.db');

// Определение модели категории
class Category extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return database;
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

// Определение модели расхода
class Expense extends BaseModel {
  constructor(obj) {
    super(obj);
  }

  static get database() {
    return database;
  }

  static get tableName() {
    return 'expenses';
  }

  static get columnMapping() {
    return {
      id: { type: types.TEXT, primary_key: true },
      amount: { type: types.REAL, not_null: true },
      currency: { type: types.TEXT },
      category_id: { type: types.TEXT },
      description: { type: types.TEXT },
      date: { type: types.INTEGER },
      created_at: { type: types.INTEGER },
      updated_at: { type: types.INTEGER },
      is_deleted: { type: types.INTEGER, default: 0 }
    };
  }
}

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
  
  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase();
  }, []);
  
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
  
  // Загрузка категорий из базы данных
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
  
  // Загрузка расходов из базы данных
  const loadExpenses = async () => {
    try {
      // Получаем все расходы, которые не удалены
      const loadedExpenses = await Expense.query({
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
          if (expense.category_id) {
            const category = await Category.find(expense.category_id);
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
  
  // Обновление существующего расхода
  const updateExpense = async (id, expenseData) => {
    try {
      const now = Date.now();
      const updatedExpense = {
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        updated_at: now
      };
      
      // Находим и обновляем запись в базе данных
      const expense = await Expense.find(id);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      Object.assign(expense, updatedExpense);
      await expense.save();
      
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
      const now = Date.now();
      
      // Находим запись в базе данных
      const expense = await Expense.find(id);
      if (!expense) {
        throw new Error('Expense not found');
      }
      
      // Помечаем как удаленную
      expense.is_deleted = 1;
      expense.updated_at = now;
      await expense.save();
      
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
      const now = Date.now();
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: now,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      // Создаем запись в базе данных
      const category = new Category(newCategory);
      await category.save();
      
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
      const now = Date.now();
      const updatedCategory = {
        ...categoryData,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      // Находим и обновляем запись в базе данных
      const category = await Category.find(id);
      if (!category) {
        throw new Error('Category not found');
      }
      
      Object.assign(category, updatedCategory);
      await category.save();
      
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
      // Находим запись в базе данных
      const category = await Category.find(id);
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Удаляем категорию
      await category.destroy();
      
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
