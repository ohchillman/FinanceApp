import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const AmountInput = ({
  value,
  onChangeValue,
  currency = '₽',
  style = {},
}) => {
  // Форматирование суммы для отображения
  const formattedValue = value ? parseFloat(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }) : '0';

  // Обработка нажатия на цифру
  const handleDigitPress = (digit) => {
    let newValue = (value || '0');
    
    // Если текущее значение 0, заменяем его на нажатую цифру
    if (newValue === '0' && digit !== '.') {
      newValue = digit.toString();
    } else {
      // Иначе добавляем цифру к текущему значению
      newValue += digit.toString();
    }
    
    onChangeValue(newValue);
  };

  // Обработка нажатия на кнопку удаления
  const handleDeletePress = () => {
    if (!value || value.length <= 1) {
      onChangeValue('0');
    } else {
      onChangeValue(value.slice(0, -1));
    }
  };

  // Обработка нажатия на кнопку точки
  const handleDotPress = () => {
    if (!value.includes('.')) {
      onChangeValue(value + '.');
    }
  };

  // Рендер кнопки клавиатуры
  const renderKeypadButton = (content, onPress, buttonStyle = {}) => (
    <TouchableOpacity
      style={[styles.keypadButton, buttonStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {typeof content === 'string' ? (
        <Text style={styles.keypadButtonText}>{content}</Text>
      ) : (
        content
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.displayContainer}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <Text style={styles.amountText}>{formattedValue}</Text>
      </View>
      
      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          {renderKeypadButton('1', () => handleDigitPress('1'))}
          {renderKeypadButton('2', () => handleDigitPress('2'))}
          {renderKeypadButton('3', () => handleDigitPress('3'))}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('4', () => handleDigitPress('4'))}
          {renderKeypadButton('5', () => handleDigitPress('5'))}
          {renderKeypadButton('6', () => handleDigitPress('6'))}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('7', () => handleDigitPress('7'))}
          {renderKeypadButton('8', () => handleDigitPress('8'))}
          {renderKeypadButton('9', () => handleDigitPress('9'))}
        </View>
        <View style={styles.keypadRow}>
          {renderKeypadButton('.', handleDotPress)}
          {renderKeypadButton('0', () => handleDigitPress('0'))}
          {renderKeypadButton(
            <Text style={styles.deleteButtonText}>⌫</Text>,
            handleDeletePress
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DIMENSIONS.SPACING.LARGE,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  currencySymbol: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_2,
    color: COLORS.TEXT_SECONDARY,
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  amountText: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_1 * 1.5,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  keypadContainer: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 2,
    backgroundColor: COLORS.GRAY_100,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_3,
    color: COLORS.ERROR,
    fontWeight: '500',
  },
});

export default AmountInput;
