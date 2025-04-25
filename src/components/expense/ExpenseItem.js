import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const ExpenseItem = ({
  expense,
  onPress,
  style = {},
}) => {
  // Форматирование даты
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Форматирование суммы с учетом валюты
  const formatAmount = (amount, currency) => {
    return `${amount.toFixed(2)} ${currency || '₽'}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(expense)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIndicator, { backgroundColor: expense.category?.color || COLORS.GRAY_400 }]} />
      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description || 'Без описания'}
          </Text>
          <Text style={styles.amount}>
            {formatAmount(expense.amount, expense.currency)}
          </Text>
        </View>
        <View style={styles.secondaryInfo}>
          <Text style={styles.category}>
            {expense.category?.name || 'Без категории'}
          </Text>
          <Text style={styles.date}>
            {formatDate(expense.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.MEDIUM,
    marginBottom: DIMENSIONS.SPACING.SMALL,
    shadowColor: COLORS.GRAY_900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  contentContainer: {
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  amount: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  secondaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  date: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_TERTIARY,
  },
});

export default ExpenseItem;
