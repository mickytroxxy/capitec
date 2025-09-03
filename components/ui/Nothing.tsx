import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';

export default function Nothing({ message, hasX }: { message: string, hasX?:boolean }) {
  return (
    <View style={styles.wrap}>
      {/* Placeholder illustration: 3 bars */}
      <View style={styles.illus}>
        {/* Row 1 */}
        <View style={[styles.row,{borderColor:'rgba(18, 21, 61, 1)'}]}> 
          <View style={[styles.circle, { backgroundColor: 'rgba(18, 21, 61, 1)' }]} />
          <View style={[styles.bar]} />
          <View style={styles.dotRed} />
        </View>
        {/* Row 2 */}
        <View style={styles.row}> 
          <View style={styles.circle} />
          <View style={[styles.bar]} />
          <View style={styles.dot} />
        </View>
        {/* Row 3 */}
        <View style={styles.row}> 
          <View style={styles.circle} />
          <View style={[styles.bar]} />
          <View style={styles.dot} />
        </View>
        {hasX && <View style={{position:'absolute',top:'44%',right:'44%',backgroundColor:colors.white}}>
          <Icon name="x-circle" type="Feather" size={36} color={'#202d49ff'} />  
        </View>}
      </View>

      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const SIZE = 42;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 32 },
  illus: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    borderWidth:1,
    padding:10,
    borderColor:colors.faintGray
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.faintGray,
  },
  bar: {
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.faintGray,
    marginHorizontal: 8,
    flexGrow: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#e55',
  },
  text: {
    color: colors.gray,
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    textAlign:'center',
    paddingHorizontal:16,
  },
});

