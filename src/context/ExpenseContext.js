import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SQLite from 'expo-sqlite';
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
  // Состояние для хранения объекта базы данных
  const [db, setDb] = useState(null);
  
  // Инициализация базы данных при первом рендере
  useEffect(() => {
    initDatabase();
  }, []);
  
  // Функция инициализации базы данных
  const initDatabase = () => {
    try {
      setLoading(true);
      
      // Открываем базу данных - используем стандартный метод openDatabase
      const database = SQLite.openDatabase('expenses.db');
      setDb(database);
      
      // Создаем таблицы
      database.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY NOT NULL,
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
            return false;
          }
        );
        
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY NOT NULL,
            amount REAL NOT NULL,
            currency TEXT,
            category_id TEXT,
            description TEXT,
            date INTEGER,
            created_at INTEGER,
            updated_at INTEGER,
            is_deleted INTEGER DEFAULT 0
          );`,
          [],
          () => {
            console.log('Expenses table created successfully');
          },
          (_, error) => {
            console.error('Error creating expenses table:', error);
            return false;
          }
        );
      }, 
      (error) => {
        console.error('Transaction error:', error);
        setError('Failed to initialize database');
        setLoading(false);
      },
      () => {
        console.log('Database initialized successfully');
        // Загрузка категорий и расходов
        loadCategories();
        loadExpenses();
      });
    } catch (err) {
      console.error('Database initialization error:', err);
      setError('Failed to initialize database');
      setLoading(false);
    }
  };
  
  // Загрузка категорий из базы данных
  const loadCategories = () => {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM categories',
          [],
          (_, { rows }) => {
            const categoriesData = rows._array;
            setCategories(categoriesData);
          },
          (_, error) => {
            console.error('Error loading categories:', error);
            setError('Failed to load categories');
            return false;
          }
        );
      });
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  };
  
  // Загрузка расходов из базы данных
  const loadExpenses = () => {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM expenses WHERE is_deleted = 0 ORDER BY date DESC',
          [],
          async (_, { rows }) => {
            const loadedExpenses = rows._array;
            
            // Для каждого расхода добавляем информацию о категории
            const expensesWithCategories = await Promise.all(
              loadedExpenses.map(expense => {
                return new Promise((resolve) => {
                  if (expense.category_id) {
                    tx.executeSql(
                      'SELECT id, name, color FROM categories WHERE id = ?',
                      [expense.category_id],
                      (_, { rows }) => {
                        const category = rows._array[0];
                        
                        resolve({
                          ...expense,
                          date: new Date(expense.date),
                          created_at: new Date(expense.created_at),
                          updated_at: new Date(expense.updated_at),
                          category: category ? {
                            id: category.id,
                            name: category.name,
                            color: category.color
                          } : null
                        });
                      },
                      (_, error) => {
                        console.error('Error loading category for expense:', error);
                        resolve({
                          ...expense,
                          date: new Date(expense.date),
                          created_at: new Date(expense.created_at),
                          updated_at: new Date(expense.updated_at),
                          category: null
                        });
                        return false;
                      }
                    );
                  } else {
                    resolve({
                      ...expense,
                      date: new Date(expense.date),
                      created_at: new Date(expense.created_at),
                      updated_at: new Date(expense.updated_at),
                      category: null
                    });
                  }
                });
              })
            );
            
            setExpenses(expensesWithCategories);
            setLoading(false);
          },
          (_, error) => {
            console.error('Error loading expenses:', error);
            setError('Failed to load expenses');
            setLoading(false);
            return false;
          }
        );
      });
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
      setLoading(false);
    }
  };
  
  // Добавление нового расхода
  const addExpense = async (expenseData) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const now = Date.now();
      const newExpense = {
        id: uuidv4(),
        ...expenseData,
        date: expenseData.date ? expenseData.date.getTime() : now,
        created_at: now,
        updated_at: now,
        is_deleted: 0
      };
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO expenses (id, amount, currency, category_id, description, date, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              newExpense.id,
              newExpense.amount,
              newExpense.currency,
              newExpense.category_id,
              newExpense.description,
              newExpense.date,
              newExpense.created_at,
              newExpense.updated_at,
              newExpense.is_deleted
            ],
            (_, result) => {
              loadExpenses();
              resolve(newExpense);
            },
            (_, error) => {
              console.error('Error adding expense:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    }
  };
  
  // Обновление существующего расхода
  const updateExpense = async (id, expenseData) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM expenses WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length === 0) {
                reject(new Error('Expense not found'));
                return;
              }
              
              const expense = rows._array[0];
              const now = Date.now();
              const updatedExpense = {
                ...expense,
                ...expenseData,
                date: expenseData.date ? expenseData.date.getTime() : expense.date,
                updated_at: now
              };
              
              tx.executeSql(
                'UPDATE expenses SET amount = ?, currency = ?, category_id = ?, description = ?, date = ?, updated_at = ? WHERE id = ?',
                [
                  updatedExpense.amount,
                  updatedExpense.currency,
                  updatedExpense.category_id,
                  updatedExpense.description,
                  updatedExpense.date,
                  updatedExpense.updated_at,
                  id
                ],
                (_, result) => {
                  loadExpenses();
                  resolve(updatedExpense);
                },
                (_, error) => {
                  console.error('Error updating expense:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error('Error finding expense:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
      throw err;
    }
  };
  
  // Удаление расхода (мягкое удаление)
  const deleteExpense = async (id) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM expenses WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length === 0) {
                reject(new Error('Expense not found'));
                return;
              }
              
              const now = Date.now();
              tx.executeSql(
                'UPDATE expenses SET is_deleted = 1, updated_at = ? WHERE id = ?',
                [now, id],
                (_, result) => {
                  loadExpenses();
                  resolve(true);
                },
                (_, error) => {
                  console.error('Error deleting expense:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error('Error finding expense:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    }
  };
  
  // Добавление новой категории
  const addCategory = async (categoryData) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const now = Date.now();
      const newCategory = {
        id: uuidv4(),
        ...categoryData,
        created_at: now,
        updated_at: now,
        is_default: categoryData.is_default ? 1 : 0
      };
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO categories (id, name, icon, color, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              newCategory.id,
              newCategory.name,
              newCategory.icon,
              newCategory.color,
              newCategory.is_default,
              newCategory.created_at,
              newCategory.updated_at
            ],
            (_, result) => {
              loadCategories();
              resolve(newCategory);
            },
            (_, error) => {
              console.error('Error adding category:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
      throw err;
    }
  };
  
  // Обновление существующей категории
  const updateCategory = async (id, categoryData) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM categories WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length === 0) {
                reject(new Error('Category not found'));
                return;
              }
              
              const category = rows._array[0];
              const now = Date.now();
              const updatedCategory = {
                ...category,
                ...categoryData,
                updated_at: now,
                is_default: categoryData.is_default ? 1 : 0
              };
              
              tx.executeSql(
                'UPDATE categories SET name = ?, icon = ?, color = ?, is_default = ?, updated_at = ? WHERE id = ?',
                [
                  updatedCategory.name,
                  updatedCategory.icon,
                  updatedCategory.color,
                  updatedCategory.is_default,
                  updatedCategory.updated_at,
                  id
                ],
                (_, result) => {
                  loadCategories();
                  resolve(updatedCategory);
                },
                (_, error) => {
                  console.error('Error updating category:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error('Error finding category:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
      throw err;
    }
  };
  
  // Удаление категории
  const deleteCategory = async (id) => {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM categories WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length === 0) {
                reject(new Error('Category not found'));
                return;
              }
              
              tx.executeSql(
                'DELETE FROM categories WHERE id = ?',
                [id],
                (_, result) => {
                  loadCategories();
                  resolve(true);
                },
                (_, error) => {
                  console.error('Error deleting category:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error('Error finding category:', error);
              reject(error);
              return false;
            }
          );
        });
      });
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
      loadCategories();
      loadExpenses();
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
