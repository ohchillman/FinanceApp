import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const CategorySelector = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  style = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Категория</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategoryId === category.id && styles.selectedCategoryItem,
              { borderColor: category.color }
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Text style={styles.categoryIconText}>{category.name.charAt(0)}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DIMENSIONS.SPACING.LARGE,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    borderWidth: 1,
    margin: DIMENSIONS.SPACING.SMALL,
    padding: DIMENSIONS.SPACING.SMALL,
  },
  selectedCategoryItem: {
    backgroundColor: (color) => `${color}20`,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DIMENSIONS.SPACING.SMALL,
  },
  categoryIconText: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: 'bold',
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
  },
  categoryName: {
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default CategorySelector;
