import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const ExpenseForm = ({
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  categories,
  date,
  onDateChange,
  onSave,
  currency = '₽',
  style = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.amountSection}>
        <View style={styles.currencyDisplay}>
          <Text style={styles.currencySymbol}>{currency}</Text>
          <Text style={styles.amountText}>
            {parseFloat(amount || 0).toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })}
          </Text>
        </View>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Что вы купили?"
            placeholderTextColor={COLORS.GRAY_400}
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Категория</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => {
              // Здесь будет открываться модальное окно выбора категории
              // Для простоты сейчас просто отображаем выбранную категорию
            }}
          >
            {category ? (
              <View style={styles.selectedCategory}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Выберите категорию</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Дата</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => {
              // Здесь будет открываться выбор даты
            }}
          >
            <Text style={styles.dateText}>
              {date ? date.toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  amountSection: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: DIMENSIONS.SPACING.XLARGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_2,
    color: COLORS.TEXT_INVERSE,
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  amountText: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_1 * 1.5,
    fontWeight: 'bold',
    color: COLORS.TEXT_INVERSE,
  },
  formSection: {
    padding: DIMENSIONS.SPACING.LARGE,
  },
  inputRow: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  label: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.MEDIUM,
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  categorySelector: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DIMENSIONS.SPACING.MEDIUM,
  },
  categoryIconText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: 'bold',
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
  },
  categoryName: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  placeholderText: {
    color: COLORS.GRAY_400,
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
  },
  dateSelector: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  dateText: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    padding: DIMENSIONS.SPACING.MEDIUM,
    alignItems: 'center',
    marginTop: DIMENSIONS.SPACING.LARGE,
  },
  saveButtonText: {
    color: COLORS.TEXT_INVERSE,
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: 'bold',
  },
});

export default ExpenseForm;
