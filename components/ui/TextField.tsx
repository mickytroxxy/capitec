import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import { Animated, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';

type Props = TextInputProps & {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  rightChevron?: boolean;
  onPressRight?: () => void;
  isDropdown?: boolean;
  error?: string;
  outline?: boolean;
};

export default function TextField({ label, outline=false,isDropdown, value, onChangeText, rightChevron, onPressRight, editable = true, error, ...rest }: Props) {
  const Row: any = !editable && (rightChevron || onPressRight) ? TouchableOpacity : View;
  const rowProps: any = !editable && (rightChevron || onPressRight) ? { onPress: onPressRight, activeOpacity: 0.7 } : {};

  const [focused, setFocused] = React.useState(false);
  const animated = React.useRef(new Animated.Value(((value?.length ?? 0) > 0) ? 1 : 0)).current;
  React.useEffect(() => {
    const to = focused || (value?.length ?? 0) > 0 ? 1 : 0;
    Animated.timing(animated, { toValue: to, duration: 150, useNativeDriver: true }).start();
  }, [focused, value, editable]);

  const translateY = animated.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });

  return (
    <View style={[styles.wrap, outline ? {borderColor: colors.lightGray, borderWidth: 1} : {}]}>
      <Row style={styles.row} {...rowProps}>
        <View style={{flex:1}}>
          <View style={styles.labelWrap} pointerEvents="none">
            <Animated.Text style={[styles.label, { color: focused ? colors.primary : colors.gray, transform: [{ translateY }] }]}>
              {label}
            </Animated.Text>
          </View>

          {editable ? (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? '' : ' '}
              placeholderTextColor={colors.gray}
              editable={editable}
              {...rest}
            />
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}
        </View>
        {rightChevron ? (
          <Icon name="chevron-right" type="Feather" size={18} color={colors.primary} />
        ) : null}
      </Row>
      {(error && (value.length > 0)) ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white,paddingTop:10,borderRadius:10, paddingHorizontal:12 },
  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  labelWrap: { position:'absolute', left: 0, right: 0, top: 14, paddingHorizontal: 2 },
  label: { fontSize: 12, color: colors.gray, fontFamily: Fonts.fontRegular, backgroundColor: colors.white, alignSelf:'flex-start' },
  input: { paddingVertical: 12, fontSize: 14, color: colors.black, fontFamily: Fonts.fontMedium,borderRadius:10,right:2,marginTop:5},
  value: { fontSize: 14, color: '#111', fontFamily: Fonts.fontMedium, paddingVertical: 20,alignSelf:'flex-start',left:2 },
  errorText: { fontSize: 12, color: 'tomato', fontFamily: Fonts.fontRegular, paddingBottom: 8 },
});

