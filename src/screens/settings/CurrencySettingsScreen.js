import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';
import currencyService from '../../services/currency/currencyService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const CurrencySettingsScreen = ({ navigation, route }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('RUB');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Загрузка списка валют при монтировании компонента
  useEffect(() => {
    loadCurrencies();
  }, []);
  
  // Загрузка списка валют
  const loadCurrencies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Получаем курсы валют для формирования списка
      const rates = await currencyService.getExchangeRates();
      
      // Формируем список валют с символами
      const currencyList = Object.keys(rates).map(code => ({
        code,
        symbol: currencyService.getCurrencySymbol(code),
        rate: rates[code]
      }));
      
      // Сортируем по коду валюты
      currencyList.sort((a, b) => a.code.localeCompare(b.code));
      
      setCurrencies(currencyList);
      
      // Определяем валюту по языку устройства, если не выбрана
      if (!selectedCurrency) {
        const deviceLanguage = 'ru'; // В реальном приложении будет использоваться Localization.locale
        const detectedCurrency = currencyService.detectCurrencyByLanguage(deviceLanguage);
        setSelectedCurrency(detectedCurrency);
      }
    } catch (err) {
      console.error('Error loading currencies:', err);
      setError('Не удалось загрузить список валют');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик выбора валюты
  const handleSelectCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    
    // Сохраняем выбранную валюту и возвращаемся назад
    // В реальном приложении здесь будет сохранение в настройки
    navigation.goBack();
  };
  
  // Фильтрация валют по поисковому запросу
  const filteredCurrencies = searchQuery
    ? currencies.filter(currency => 
        currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCurrencyName(currency.code).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currencies;
  
  // Получение названия валюты по коду
  const getCurrencyName = (code) => {
    const currencyNames = {
      'RUB': 'Российский рубль',
      'USD': 'Доллар США',
      'EUR': 'Евро',
      'GBP': 'Британский фунт',
      'JPY': 'Японская иена',
      'CNY': 'Китайский юань',
      'AUD': 'Австралийский доллар',
      'CAD': 'Канадский доллар',
      'CHF': 'Швейцарский франк',
      'INR': 'Индийская рупия',
      'KRW': 'Южнокорейская вона',
      'TRY': 'Турецкая лира',
      'BRL': 'Бразильский реал',
      'MXN': 'Мексиканский песо',
      'PLN': 'Польский злотый',
      'SEK': 'Шведская крона',
      'ZAR': 'Южноафриканский рэнд'
    };
    
    return currencyNames[code] || code;
  };
  
  // Рендер элемента списка валют
  const renderCurrencyItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        selectedCurrency === item.code && styles.selectedCurrencyItem
      ]}
      onPress={() => handleSelectCurrency(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
        <View style={styles.currencyDetails}>
          <Text style={styles.currencyCode}>{item.code}</Text>
          <Text style={styles.currencyName}>{getCurrencyName(item.code)}</Text>
        </View>
      </View>
      {selectedCurrency === item.code && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Выбор валюты</Text>
        <Text style={styles.description}>
          Выберите валюту по умолчанию для отображения расходов
        </Text>
      </View>
      
      <Input
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Поиск валюты"
        style={styles.searchInput}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Загрузка валют...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Повторить"
            onPress={loadCurrencies}
            type="secondary"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          renderItem={renderCurrencyItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Валюты не найдены</Text>
          }
        />
      )}
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Автоматическое определение валюты</Text>
        <Text style={styles.infoText}>
          В премиум-версии приложение автоматически определяет валюту в зависимости от языка ввода и контекста.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: DIMENSIONS.SPACING.LARGE,
  },
  header: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
  searchInput: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.ERROR,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  retryButton: {
    marginTop: DIMENSIONS.SPACING.MEDIUM,
  },
  listContent: {
    paddingBottom: DIMENSIONS.SPACING.LARGE,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.SPACING.XLARGE,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DIMENSIONS.SPACING.MEDIUM,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  selectedCurrencyItem: {
    backgroundColor: `${COLORS.PRIMARY}10`,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    width: 40,
    textAlign: 'center',
  },
  currencyDetails: {
    marginLeft: DIMENSIONS.SPACING.MEDIUM,
  },
  currencyCode: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  currencyName: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: 'bold',
  },
  infoSection: {
    marginTop: DIMENSIONS.SPACING.LARGE,
    padding: DIMENSIONS.SPACING.MEDIUM,
    backgroundColor: COLORS.INFO_LIGHT,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.INFO,
  },
  infoTitle: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  infoText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default CurrencySettingsScreen;
