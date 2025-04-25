import React, { createContext, useState, useEffect, useContext } from 'react';
import { openDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Инициализация базы данных
  const db = openDatabase('expenses.db');
  
  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase();
  }, []);
  
  // Функция инициализации базы данных
  const initDatabase = async () => {
    try {
      setLoading(true);
      
      // Создание таблицы категорий
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            color TEXT,
            is_default INTEGER DEFAULT 0,
            created_at INTEGER,
            updated_at INTEGER
          );`,
          [],
          () => {
            console.log('Categories table created successfully');
          },
          (_, error) => {
            console.error('Error creating categories table:', error);
            setError('Failed to initialize database');
            return false;
          }
        );
      });
      
      // Создание таблицы расходов
      db.transaction(tx => {
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
            is_deleted INTEGER DEFAULT 0,
            FOREIGN KEY (category_id) REFERENCES categories(id)
          );`,
          [],
          () => {
            console.log('Expenses table created successfully');
          },
          (_, error) => {
            console.error('Error creating expenses table:', error);
            setError('Failed to initialize database');
            return false;
          }
        );
      });
      
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
  const loadCategories = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM categories ORDER BY name;',
          [],
          (_, { rows }) => {
            const loadedCategories = rows._array;
            setCategories(loadedCategories);
            resolve(loadedCategories);
          },
          (_, error) => {
            console.error('Error loading categories:', error);
            setError('Failed to load categories');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Загрузка расходов из базы данных
  const loadExpenses = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT e.*, c.name as category_name, c.color as category_color FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.is_deleted = 0 ORDER BY e.date DESC;',
          [],
          (_, { rows }) => {
            const loadedExpenses = rows._array.map(expense => ({
              ...expense,
              date: new Date(expense.date),
              created_at: new Date(expense.created_at),
              updated_at: new Date(expense.updated_at),
              category: expense.category_id ? {
                id: expense.category_id,
                name: expense.category_name,
                color: expense.category_color
              } : null
            }));
            setExpenses(loadedExpenses);
            resolve(loadedExpenses);
          },
          (_, error) => {
            console.error('Error loading expenses:', error);
            setError('Failed to load expenses');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Добавление нового расхода
  const addExpense = (expenseData) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const newExpense = {
        id: uuidv4(),
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        created_at: now,
        updated_at: now,
        is_deleted: 0
      };
      
      db.transaction(tx => {
        tx.executeSql(
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
          ],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем расходы для получения актуальных данных
              await loadExpenses();
              resolve(newExpense);
            } else {
              reject(new Error('Failed to add expense'));
            }
          },
          (_, error) => {
            console.error('Error adding expense:', error);
            setError('Failed to add expense');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Обновление существующего расхода
  const updateExpense = (id, expenseData) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const updatedExpense = {
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        updated_at: now
      };
      
      db.transaction(tx => {
        tx.executeSql(
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
          ],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем расходы для получения актуальных данных
              await loadExpenses();
              resolve(updatedExpense);
            } else {
              reject(new Error('Failed to update expense'));
            }
          },
          (_, error) => {
            console.error('Error updating expense:', error);
            setError('Failed to update expense');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Удаление расхода (мягкое удаление)
  const deleteExpense = (id) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE expenses
           SET is_deleted = 1, updated_at = ?
           WHERE id = ?;`,
          [now, id],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем расходы для получения актуальных данных
              await loadExpenses();
              resolve(true);
            } else {
              reject(new Error('Failed to delete expense'));
            }
          },
          (_, error) => {
            console.error('Error deleting expense:', error);
            setError('Failed to delete expense');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Добавление новой категории
  const addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: now,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      db.transaction(tx => {
        tx.executeSql(
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
          ],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем категории для получения актуальных данных
              await loadCategories();
              resolve(newCategory);
            } else {
              reject(new Error('Failed to add category'));
            }
          },
          (_, error) => {
            console.error('Error adding category:', error);
            setError('Failed to add category');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Обновление существующей категории
  const updateCategory = (id, categoryData) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const updatedCategory = {
        ...categoryData,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      db.transaction(tx => {
        tx.executeSql(
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
          ],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем категории для получения актуальных данных
              await loadCategories();
              resolve(updatedCategory);
            } else {
              reject(new Error('Failed to update category'));
            }
          },
          (_, error) => {
            console.error('Error updating category:', error);
            setError('Failed to update category');
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Удаление категории
  const deleteCategory = (id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM categories WHERE id = ?;`,
          [id],
          async (_, result) => {
            if (result.rowsAffected > 0) {
              // Перезагружаем категории для получения актуальных данных
              await loadCategories();
              resolve(true);
            } else {
              reject(new Error('Failed to delete category'));
            }
          },
          (_, error) => {
            console.error('Error deleting category:', error);
            setError('Failed to delete category');
            reject(error);
            return false;
          }
        );
      });
    });
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
