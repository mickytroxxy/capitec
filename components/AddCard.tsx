import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Fonts } from '@/constants/Fonts';
import Icon from './ui/Icon';

interface AddCardProps {
  onPress?: () => void;
}

export default function AddCard({ onPress }: AddCardProps) {
  return (
    <TouchableOpacity 
      style={styles.addCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name="plus-circle" type="Feather" size={24} color="#007ACC" />
      <Text style={styles.addText}>Add</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#83d2f7ff',
    marginBottom: 12,
    //elevation: 2,
  },
  addText: {
    color: '#007ACC',
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
    marginLeft: 8,
  },
});
