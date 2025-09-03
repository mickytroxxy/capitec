import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type DropdownOption<T extends string | number = string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string | number = string> = {
  label?: string;
  title?: string; // bottom sheet title
  value: T | null;
  options: DropdownOption<T>[];
  placeholder?: string;
  onChange: (value: T) => void;
};

export default function Dropdown<T extends string | number = string>({
  label,
  title,
  value,
  options,
  placeholder = 'Select',
  onChange,
}: DropdownProps<T>) {
  const [visible, setVisible] = useState(false);
  const [temp, setTemp] = useState<T | null>(value);

  const selectedLabel = useMemo(() => {
    const found = options.find(o => o.value === value);
    return found?.label ?? placeholder;
  }, [options, value, placeholder]);

  const apply = () => {
    if (temp != null && temp !== value) {
      onChange(temp);
    }
    setVisible(false);
  };

  return (
    <>
      <View>
        {label ? <View><Text style={styles.smallLabel}>{label}</Text></View> : null}
        <TouchableOpacity style={styles.chip} onPress={() => { setTemp(value); setVisible(true); }} activeOpacity={0.7}>
          <Text style={styles.chipText}>{selectedLabel}</Text>
          <Icon name="chevron-down" type="Feather" size={16} color={colors.gray} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title || label || 'Select'}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Icon name="x" type="Feather" size={22} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const selected = temp === item.value;
              return (
                <TouchableOpacity style={styles.optionRow} onPress={() => setTemp(item.value)}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.8}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  smallLabel: {
    fontSize: 12,
    color: colors.black,
    fontFamily: Fonts.fontLight,
    position:'absolute',
    top:-7,
    left:0,
    zIndex:1,
    backgroundColor:colors.white,
    marginLeft:10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 13,
    color: colors.gray,
    fontFamily: Fonts.fontRegular,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  sheetContainer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    color: '#111',
    fontFamily: Fonts.fontBold,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionLabel: {
    fontSize: 15,
    color: '#111',
    fontFamily: Fonts.fontLight,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  applyBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.fontBold,
  }
});

