import axios from 'axios';

/**
 * Сервис для определения и конвертации валют
 */
class CurrencyService {
  constructor() {
    // Базовые символы валют
    this.currencySymbols = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'Fr',
      'INR': '₹',
      'KRW': '₩',
      'TRY': '₺',
      'BRL': 'R$',
      'MXN': 'Mex$',
      'PLN': 'zł',
      'SEK': 'kr',
      'ZAR': 'R'
    };
    
    // Соответствие языков и валют по умолчанию
    this.languageToCurrency = {
      'ru': 'RUB',
      'en': 'USD',
      'gb': 'GBP',
      'us': 'USD',
      'de': 'EUR',
      'fr': 'EUR',
      'it': 'EUR',
      'es': 'EUR',
      'jp': 'JPY',
      'cn': 'CNY',
      'au': 'AUD',
      'ca': 'CAD',
      'ch': 'CHF',
      'in': 'INR',
      'kr': 'KRW',
      'tr': 'TRY',
      'br': 'BRL',
      'mx': 'MXN',
      'pl': 'PLN',
      'se': 'SEK',
      'za': 'ZAR'
    };
    
    // Кэш для курсов валют
    this.exchangeRatesCache = {
      timestamp: 0,
      base: '',
      rates: {}
    };
    
    // Время жизни кэша (1 час)
    this.cacheTTL = 60 * 60 * 1000;
  }
  
  /**
   * Определяет валюту по языку
   * @param {string} language - Код языка (например, 'ru', 'en-US')
   * @returns {string} - Код валюты (например, 'RUB', 'USD')
   */
  detectCurrencyByLanguage(language) {
    if (!language) return 'USD';
    
    // Извлекаем основной код языка и код страны
    const parts = language.toLowerCase().split(/[-_]/);
    const langCode = parts[0];
    const countryCode = parts.length > 1 ? parts[1] : langCode;
    
    // Сначала проверяем по коду страны
    if (this.languageToCurrency[countryCode]) {
      return this.languageToCurrency[countryCode];
    }
    
    // Затем по коду языка
    if (this.languageToCurrency[langCode]) {
      return this.languageToCurrency[langCode];
    }
    
    // По умолчанию возвращаем USD
    return 'USD';
  }
  
  /**
   * Получает символ валюты по её коду
   * @param {string} currencyCode - Код валюты (например, 'RUB', 'USD')
   * @returns {string} - Символ валюты (например, '₽', '$')
   */
  getCurrencySymbol(currencyCode) {
    if (!currencyCode) return '$';
    
    const code = currencyCode.toUpperCase();
    return this.currencySymbols[code] || code;
  }
  
  /**
   * Определяет валюту из текста
   * @param {string} text - Текст для анализа
   * @returns {string|null} - Код определенной валюты или null, если валюта не найдена
   */
  detectCurrencyFromText(text) {
    if (!text) return null;
    
    // Словарь ключевых слов валют
    const currencyKeywords = {
      'RUB': ['рубл', 'руб', '₽', 'рос', 'рур'],
      'USD': ['доллар', '$', 'usd', 'долл', 'бакс'],
      'EUR': ['евро', '€', 'eur'],
      'GBP': ['фунт', '£', 'gbp', 'стерлинг'],
      'JPY': ['иен', '¥', 'jpy', 'япон'],
      'CNY': ['юан', '¥', 'cny', 'китай'],
      'AUD': ['австрал', 'aud'],
      'CAD': ['канад', 'cad'],
      'CHF': ['франк', 'chf', 'швейцар'],
      'INR': ['рупи', '₹', 'inr', 'инди'],
      'KRW': ['вон', '₩', 'krw', 'корей'],
      'TRY': ['лир', '₺', 'try', 'турец']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [code, keywords] of Object.entries(currencyKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return code;
      }
    }
    
    return null;
  }
  
  /**
   * Получает актуальные курсы валют
   * @param {string} baseCurrency - Базовая валюта для конвертации (по умолчанию 'USD')
   * @returns {Promise<Object>} - Объект с курсами валют
   */
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const now = Date.now();
      
      // Проверяем кэш
      if (
        this.exchangeRatesCache.base === baseCurrency &&
        now - this.exchangeRatesCache.timestamp < this.cacheTTL
      ) {
        return this.exchangeRatesCache.rates;
      }
      
      // Получаем актуальные курсы валют
      const response = await axios.get(
        `https://open.er-api.com/v6/latest/${baseCurrency}`
      );
      
      if (response.data && response.data.rates) {
        // Обновляем кэш
        this.exchangeRatesCache = {
          timestamp: now,
          base: baseCurrency,
          rates: response.data.rates
        };
        
        return response.data.rates;
      } else {
        throw new Error('Invalid exchange rates response');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // В случае ошибки возвращаем кэшированные данные, если они есть
      if (this.exchangeRatesCache.rates && Object.keys(this.exchangeRatesCache.rates).length > 0) {
        return this.exchangeRatesCache.rates;
      }
      
      // Или возвращаем базовые курсы для основных валют
      return {
        'USD': 1,
        'EUR': 0.92,
        'RUB': 91.5,
        'GBP': 0.79,
        'JPY': 154.5,
        'CNY': 7.24,
        'AUD': 1.52,
        'CAD': 1.37,
        'CHF': 0.91,
        'INR': 83.5,
        'KRW': 1370,
        'TRY': 32.1
      };
    }
  }
  
  /**
   * Конвертирует сумму из одной валюты в другую
   * @param {number} amount - Сумма для конвертации
   * @param {string} fromCurrency - Исходная валюта
   * @param {string} toCurrency - Целевая валюта
   * @returns {Promise<number>} - Сконвертированная сумма
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    try {
      // Получаем курсы валют относительно USD
      const rates = await this.getExchangeRates('USD');
      
      // Если исходная валюта не USD, конвертируем сначала в USD
      let amountInUSD = amount;
      if (fromCurrency !== 'USD') {
        if (!rates[fromCurrency]) {
          throw new Error(`Exchange rate not available for ${fromCurrency}`);
        }
        amountInUSD = amount / rates[fromCurrency];
      }
      
      // Затем конвертируем из USD в целевую валюту
      if (toCurrency === 'USD') {
        return amountInUSD;
      } else {
        if (!rates[toCurrency]) {
          throw new Error(`Exchange rate not available for ${toCurrency}`);
        }
        return amountInUSD * rates[toCurrency];
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }
  
  /**
   * Форматирует сумму с учетом валюты
   * @param {number} amount - Сумма для форматирования
   * @param {string} currencyCode - Код валюты
   * @returns {string} - Отформатированная сумма с символом валюты
   */
  formatCurrency(amount, currencyCode) {
    if (isNaN(amount)) {
      return '0';
    }
    
    const symbol = this.getCurrencySymbol(currencyCode);
    
    // Определяем формат в зависимости от валюты
    let formattedAmount;
    switch (currencyCode) {
      case 'JPY':
      case 'KRW':
        // Для иены и воны не используем десятичные знаки
        formattedAmount = Math.round(amount).toLocaleString();
        break;
      default:
        // Для остальных валют используем до 2 десятичных знаков
        formattedAmount = amount.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
    }
    
    // Размещаем символ валюты в зависимости от её типа
    if (['$', '₩', '₺', 'R$', 'Mex$', 'A$', 'C$', 'R'].includes(symbol)) {
      return `${symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${symbol}`;
    }
  }
}

export default new CurrencyService();
