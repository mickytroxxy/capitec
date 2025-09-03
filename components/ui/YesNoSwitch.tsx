import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

export type YesNoSwitchProps = {
  value: boolean;
  onChange?: (val: boolean) => void;
  style?: ViewStyle;
  // Optional labels (default YES/NO)
  yesLabel?: string;
  noLabel?: string;
};

export default function YesNoSwitch({ value, onChange, style, yesLabel = 'YES', noLabel = 'NO' }: YesNoSwitchProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value]);

  // Track/knob dimensions
  const TRACK_WIDTH = 76;
  const TRACK_HEIGHT = 34;
  const PADDING = 4;
  const KNOB_SIZE = TRACK_HEIGHT - PADDING * 2; // 26

  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.gray, colors.darkGreen] });
  const knobX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRACK_WIDTH - KNOB_SIZE - PADDING * 2] });

  const label = value ? yesLabel : noLabel;
  const iconName = value ? 'circle' : 'circle-thin';
  return (
    <Animated.View style={[styles.track, style, { width: TRACK_WIDTH, height: TRACK_HEIGHT, backgroundColor: bg }]}>
      <TouchableOpacity style={styles.touch} activeOpacity={0.85} onPress={() => onChange?.(!value)}>
        {/* Centered label */}
        <Text style={styles.text}>{label}</Text>

        {/* Moving knob with icon */}
        <Animated.View style={[styles.knob, { width: KNOB_SIZE, height: KNOB_SIZE, borderRadius: KNOB_SIZE / 2, transform: [{ translateX: knobX }] }]}>
          <Icon name={iconName} type="FontAwesome" size={18} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  touch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.white, fontFamily: Fonts.fontBold },
  knob: {
    position: 'absolute',
    left: 4,
    top: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

