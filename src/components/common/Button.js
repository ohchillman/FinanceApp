import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  size = 'medium',
  disabled = false,
  icon = null,
  style = {}
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${type}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`${type}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText
  ];

  return (
    <View style={buttonStyles}>
      <Text style={textStyles} onPress={disabled ? null : onPress}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: DIMENSIONS.RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  smallButton: {
    paddingVertical: DIMENSIONS.SPACING.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    height: DIMENSIONS.HEIGHT.BUTTON - 8,
  },
  mediumButton: {
    paddingVertical: DIMENSIONS.SPACING.MEDIUM,
    paddingHorizontal: DIMENSIONS.SPACING.LARGE,
    height: DIMENSIONS.HEIGHT.BUTTON,
  },
  largeButton: {
    paddingVertical: DIMENSIONS.SPACING.MEDIUM,
    paddingHorizontal: DIMENSIONS.SPACING.XLARGE,
    height: DIMENSIONS.HEIGHT.BUTTON + 8,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY_300,
    borderColor: COLORS.GRAY_300,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.TEXT_INVERSE,
  },
  secondaryText: {
    color: COLORS.PRIMARY,
  },
  textText: {
    color: COLORS.PRIMARY,
  },
  smallText: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
  },
  mediumText: {
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
  },
  largeText: {
    fontSize: DIMENSIONS.FONT_SIZE.HEADING_4,
  },
  disabledText: {
    color: COLORS.GRAY_500,
  },
  iconContainer: {
    marginRight: DIMENSIONS.SPACING.SMALL,
  },
});

export default Button;
