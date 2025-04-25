import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { DIMENSIONS } from '../constants/dimensions';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error = null,
  multiline = false,
  numberOfLines = 1,
  style = {},
  labelStyle = {},
  inputStyle = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          multiline && styles.multilineInput,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.GRAY_400}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DIMENSIONS.SPACING.MEDIUM,
    width: '100%',
  },
  label: {
    fontSize: DIMENSIONS.FONT_SIZE.SECONDARY,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.SPACING.TINY,
  },
  input: {
    backgroundColor: COLORS.GRAY_100,
    borderRadius: DIMENSIONS.RADIUS.SMALL,
    paddingHorizontal: DIMENSIONS.SPACING.MEDIUM,
    paddingVertical: DIMENSIONS.SPACING.MEDIUM,
    fontSize: DIMENSIONS.FONT_SIZE.BODY,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    height: DIMENSIONS.HEIGHT.INPUT,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  multilineInput: {
    height: 'auto',
    minHeight: DIMENSIONS.HEIGHT.INPUT,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: DIMENSIONS.FONT_SIZE.SMALL,
    marginTop: DIMENSIONS.SPACING.TINY,
  },
});

export default Input;
