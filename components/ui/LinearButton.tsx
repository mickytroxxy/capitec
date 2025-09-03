import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
};

export default function LinearButton({ title, onPress, disabled, style, variant = 'primary' }: Props) {
  const opacity = disabled ? 0.6 : 1;
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled} style={[{ borderRadius: 5, overflow: 'hidden',borderColor: colors.primary,borderWidth:1 }, style]}>
      <LinearGradient colors={variant === 'primary' ? [colors.primary, '#0a87d6'] : [colors.white, '#ffffff']} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.btn, { opacity }]}>
        <Text style={[styles.text, { color: variant === 'primary' ? '#fff' : colors.primary }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 16, fontFamily: Fonts.fontRegular },
});

