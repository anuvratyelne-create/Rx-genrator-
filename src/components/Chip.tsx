import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning';
  style?: ViewStyle;
}

export function Chip({
  label,
  selected = false,
  onPress,
  size = 'md',
  variant = 'default',
  style,
}: ChipProps) {
  const chipStyles = [
    styles.chip,
    styles[`size_${size}`],
    selected ? styles[`${variant}Selected`] : styles[variant],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`textSize_${size}`],
    selected ? styles[`text_${variant}Selected`] : styles[`text_${variant}`],
  ];

  return (
    <TouchableOpacity
      style={chipStyles}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={textStyles}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    borderWidth: 1,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  size_md: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  size_lg: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  // Variants - Unselected
  default: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  primary: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },

  // Variants - Selected
  defaultSelected: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  primarySelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  successSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  warningSelected: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },

  // Text
  text: {
    fontWeight: '500',
  },
  textSize_sm: {
    fontSize: 12,
  },
  textSize_md: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
  },

  // Text colors - Unselected
  text_default: {
    color: '#4b5563',
  },
  text_primary: {
    color: '#2563eb',
  },
  text_success: {
    color: '#16a34a',
  },
  text_warning: {
    color: '#d97706',
  },

  // Text colors - Selected
  text_defaultSelected: {
    color: '#ffffff',
  },
  text_primarySelected: {
    color: '#ffffff',
  },
  text_successSelected: {
    color: '#ffffff',
  },
  text_warningSelected: {
    color: '#ffffff',
  },
});
