import axios from 'axios';

// Конфигурация для OpenRouter API
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY'; // Будет заменено на реальный ключ

// Модель Gemini для использования через OpenRouter
const MODEL = 'google/gemini-pro';

/**
 * Сервис для распознавания текста расходов с использованием OpenRouter и моделей Gemini
 */
class TextRecognitionService {
  /**
   * Распознает информацию о расходе из текстового описания
   * @param {string} text - Текстовое описание расхода
   * @param {string} language - Язык текста (по умолчанию 'ru')
   * @returns {Promise<Object>} - Распознанная информация о расходе
   */
  async recognizeExpense(text, language = 'ru') {
    try {
      // Формируем промпт для модели
      const prompt = this._createPrompt(text, language);
      
      // Отправляем запрос к OpenRouter API
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'Ты - финансовый ассистент, который помогает распознавать информацию о расходах из текстовых описаний.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-expense-logger.app', // Заменить на реальный домен
            'X-Title': 'AI Expense Logger'
          }
        }
      );
      
      // Извлекаем и парсим ответ модели
      const aiResponse = response.data.choices[0].message.content;
      const parsedResponse = JSON.parse(aiResponse);
      
      return this._processAIResponse(parsedResponse);
    } catch (error) {
      console.error('Error recognizing expense:', error);
      
      // В случае ошибки используем базовый парсер как запасной вариант
      return this._fallbackParser(text);
    }
  }
  
  /**
   * Создает промпт для модели на основе текста и языка
   * @private
   */
  _createPrompt(text, language) {
    return `
      Проанализируй следующий текст о расходе и извлеки из него структурированную информацию:
      
      "${text}"
      
      Верни результат в формате JSON со следующими полями:
      - amount: числовое значение суммы расхода (без символа валюты)
      - currency: валюта расхода (например, "RUB", "USD", "EUR")
      - category: категория расхода (одна из: "food", "transport", "home", "health", "subscriptions", "entertainment", "family", "business")
      - description: краткое описание расхода
      - date: дата расхода в формате ISO (если указана в тексте, иначе null)
      
      Если какая-то информация отсутствует в тексте, верни соответствующее поле как null.
    `;
  }
  
  /**
   * Обрабатывает ответ AI и приводит его к нужному формату
   * @private
   */
  _processAIResponse(response) {
    // Проверяем наличие необходимых полей
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid AI response format');
    }
    
    // Приводим ответ к стандартному формату
    return {
      amount: response.amount || 0,
      currency: this._normalizeCurrency(response.currency),
      category_id: this._mapCategoryToId(response.category),
      description: response.description || '',
      date: response.date ? new Date(response.date) : new Date()
    };
  }
  
  /**
   * Нормализует код валюты
   * @private
   */
  _normalizeCurrency(currency) {
    if (!currency) return '₽';
    
    const currencyMap = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'рубль': '₽',
      'рубли': '₽',
      'руб': '₽',
      'р': '₽',
      'доллар': '$',
      'долларов': '$',
      'долл': '$',
      'евро': '€',
      'фунт': '£',
      'фунтов': '£',
      'иена': '¥',
      'иен': '¥',
      'юань': '¥',
      'юаней': '¥'
    };
    
    return currencyMap[currency.toUpperCase()] || currency;
  }
  
  /**
   * Сопоставляет категорию с ID
   * @private
   */
  _mapCategoryToId(category) {
    if (!category) return null;
    
    // Предполагаем, что ID категории совпадает с её названием на английском
    return category.toLowerCase();
  }
  
  /**
   * Запасной парсер для базового распознавания в случае ошибки AI
   * @private
   */
  _fallbackParser(text) {
    // Ищем числа, которые могут быть суммой
    const amountMatch = text.match(/\d+(\s*[.,]\s*\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 0;
    
    // Определяем валюту по символам или словам
    let currency = '₽';
    if (text.includes('$') || text.toLowerCase().includes('доллар')) {
      currency = '$';
    } else if (text.includes('€') || text.toLowerCase().includes('евро')) {
      currency = '€';
    }
    
    // Пытаемся определить категорию по ключевым словам
    const categoryKeywords = {
      'food': ['еда', 'продукты', 'ресторан', 'кафе', 'обед', 'ужин', 'завтрак'],
      'transport': ['транспорт', 'такси', 'метро', 'автобус', 'бензин', 'проезд'],
      'home': ['дом', 'квартира', 'аренда', 'ремонт', 'мебель', 'коммунальные'],
      'health': ['здоровье', 'лекарства', 'врач', 'больница', 'аптека'],
      'subscriptions': ['подписка', 'netflix', 'spotify', 'apple', 'google'],
      'entertainment': ['развлечения', 'кино', 'театр', 'концерт', 'игры'],
      'family': ['семья', 'дети', 'подарок', 'школа', 'детский сад'],
      'business': ['бизнес', 'работа', 'офис', 'командировка', 'клиент']
    };
    
    let category_id = null;
    const lowerText = text.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category_id = cat;
        break;
      }
    }
    
    // Извлекаем описание (все, что не сумма)
    let description = text;
    if (amountMatch) {
      description = description.replace(amountMatch[0], '').trim();
    }
    
    return {
      amount,
      currency,
      category_id,
      description,
      date: new Date()
    };
  }
}

export default new TextRecognitionService();
