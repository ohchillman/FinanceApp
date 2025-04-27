import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Ключи для AsyncStorage
const EXPENSES_STORAGE_KEY = '@expenses';
const CATEGORIES_STORAGE_KEY = '@categories';

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
  
  // Инициализация хранилища при первом рендере
  useEffect(() => {
    initStorage();
  }, []);
  
  // Функция инициализации хранилища
  const initStorage = async () => {
    try {
      setLoading(true);
      
      // Проверяем, инициализировано ли хранилище
      const storageInitialized = await AsyncStorage.getItem('@storage_initialized');
      
      if (!storageInitialized) {
        // Если хранилище не инициализировано, создаем начальные данные
        await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify([]));
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify([]));
        await AsyncStorage.setItem('@storage_initialized', 'true');
      }
      
      // Загружаем категории и расходы
      await loadCategories();
      await loadExpenses();
      
      console.log('Storage initialized successfully');
    } catch (err) {
      console.error('Storage initialization error:', err);
      setError('Failed to initialize storage');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка категорий из хранилища
  const loadCategories = async () => {
    try {
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesData) {
        const parsedCategories = JSON.parse(categoriesData);
        setCategories(parsedCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  };
  
  // Загрузка расходов из хранилища
  const loadExpenses = async () => {
    try {
      const expensesData = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      
      if (expensesData && categoriesData) {
        const parsedExpenses = JSON.parse(expensesData);
        const parsedCategories = JSON.parse(categoriesData);
        
        // Фильтруем только неудаленные расходы
        const activeExpenses = parsedExpenses.filter(expense => !expense.is_deleted);
        
        // Для каждого расхода добавляем информацию о категории
        const expensesWithCategories = activeExpenses.map(expense => {
          // Находим категорию для расхода
          const category = parsedCategories.find(cat => cat.id === expense.category_id);
          
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
        });
        
        // Сортируем расходы по дате (от новых к старым)
        expensesWithCategories.sort((a, b) => b.date - a.date);
        
        setExpenses(expensesWithCategories);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
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
        is_deleted: false
      };
      
      // Получаем текущие расходы из хранилища
      const expensesData = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      const currentExpenses = expensesData ? JSON.parse(expensesData) : [];
      
      // Добавляем новый расход
      const updatedExpenses = [...currentExpenses, newExpense];
      
      // Сохраняем обновленный список расходов
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
      
      // Обновляем состояние
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
      // Получаем текущие расходы из хранилища
      const expensesData = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      const currentExpenses = expensesData ? JSON.parse(expensesData) : [];
      
      // Находим индекс расхода для обновления
      const expenseIndex = currentExpenses.findIndex(expense => expense.id === id);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      const expense = currentExpenses[expenseIndex];
      const now = Date.now();
      const updatedExpense = {
        ...expense,
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : expense.date,
        updated_at: now
      };
      
      // Обновляем расход в списке
      currentExpenses[expenseIndex] = updatedExpense;
      
      // Сохраняем обновленный список расходов
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(currentExpenses));
      
      // Обновляем состояние
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
      // Получаем текущие расходы из хранилища
      const expensesData = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      const currentExpenses = expensesData ? JSON.parse(expensesData) : [];
      
      // Находим индекс расхода для удаления
      const expenseIndex = currentExpenses.findIndex(expense => expense.id === id);
      
      if (expenseIndex === -1) {
        throw new Error('Expense not found');
      }
      
      // Помечаем расход как удаленный
      const now = Date.now();
      currentExpenses[expenseIndex] = {
        ...currentExpenses[expenseIndex],
        is_deleted: true,
        updated_at: now
      };
      
      // Сохраняем обновленный список расходов
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(currentExpenses));
      
      // Обновляем состояние
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
        is_default: categoryData.is_default || false
      };
      
      // Получаем текущие категории из хранилища
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      const currentCategories = categoriesData ? JSON.parse(categoriesData) : [];
      
      // Добавляем новую категорию
      const updatedCategories = [...currentCategories, newCategory];
      
      // Сохраняем обновленный список категорий
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      
      // Обновляем состояние
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
      // Получаем текущие категории из хранилища
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      const currentCategories = categoriesData ? JSON.parse(categoriesData) : [];
      
      // Находим индекс категории для обновления
      const categoryIndex = currentCategories.findIndex(category => category.id === id);
      
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      const category = currentCategories[categoryIndex];
      const now = Date.now();
      const updatedCategory = {
        ...category,
        ...categoryData,
        updated_at: now,
        is_default: categoryData.is_default || category.is_default
      };
      
      // Обновляем категорию в списке
      currentCategories[categoryIndex] = updatedCategory;
      
      // Сохраняем обновленный список категорий
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(currentCategories));
      
      // Обновляем состояние
      await loadCategories();
      // Также обновляем расходы, так как они содержат информацию о категориях
      await loadExpenses();
      
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
      // Получаем текущие категории из хранилища
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      const currentCategories = categoriesData ? JSON.parse(categoriesData) : [];
      
      // Находим индекс категории для удаления
      const categoryIndex = currentCategories.findIndex(category => category.id === id);
      
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      // Удаляем категорию из списка
      const updatedCategories = currentCategories.filter(category => category.id !== id);
      
      // Сохраняем обновленный список категорий
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      
      // Обновляем состояние
      await loadCategories();
      // Также обновляем расходы, так как они содержат информацию о категориях
      await loadExpenses();
      
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      throw err;
    }
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
    refreshData: async () => {
      await loadCategories();
      await loadExpenses();
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
