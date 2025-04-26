import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { DIMENSIONS } from '../../constants/dimensions';

const CategoryItem = ({
  category,
  onPress,
  selected = false,
  style = {},
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: category.color },
        selected && { backgroundColor: `${category.color}20` },
        style,
      ]}
      onPress={() => onPress && onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <Ionicons name={category.icon} size={20} color={COLORS.TEXT_INVERSE} />
      </View>
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DIMENSIONS.SPACING.SMALL,
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    borderWidth: 1,
    marginBottom: DIMENSIONS.SPACING.SMALL,
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
  iconPlaceholder: {
    color: COLORS.TEXT_INVERSE,
    fontWeight: 'bold',
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
  },
  name: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
});

export default CategoryItem;
