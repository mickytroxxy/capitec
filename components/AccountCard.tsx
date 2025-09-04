import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ArrowUpDown, X } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './ui/Icon';

export type AccountCardType = 'main' | 'insure' | 'live' | 'connect';

interface AccountCardProps {
  type: AccountCardType;
  title: string;
  subtitle: string;
  amount?: string;
  onClose?: () => void;
  onPress?: () => void;
}

const getCardConfig = (type: AccountCardType) => {
  switch (type) {
    case 'main':
      return {
        iconColor: colors.primary,
        icon: () => <Image source={require('../assets/images/main.png')} style={{width:30,height:40}} />,
        showClose: false,
        showAmount: true,
        titleColor:colors.primary
      };
    case 'insure':
      return {
        iconColor: '#6B7280',
        icon: () => <Icon name="shield-alt" type="FontAwesome5" size={30} color="#fff" />,
        showClose: true,
        showAmount: false,
        titleColor:'#6B7280'
      };
    case 'live':
      return {
        iconColor: '#fff',
        icon: () => <Image source={require('../assets/images/live.png')} style={{width:40,height:40}} />,
        emoji: '🎁',
        showClose: false,
        showAmount: false,
        titleColor:'#5A32FA'
      };
    case 'connect':
      return {
        iconColor: '#fff',
        icon: () => <Image source={require('../assets/images/connect.png')} style={{width:40,height:50}} />,
        emoji: '📱',
        showClose: true,
        showAmount: false,
        titleColor:'#374974ff'
      };
    default:
      return {
        iconColor: '#374974ff',
        icon: ArrowUpDown,
        showClose: false,
        showAmount: false,
      };
  }
};

export default function AccountCard({ 
  type, 
  title, 
  subtitle, 
  amount, 
  onClose, 
  onPress 
}: AccountCardProps) {
  const config = getCardConfig(type);
  const IconComponent = config.icon;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: config.iconColor }]}>
          {config?.icon && config.icon()}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        
        {config.showAmount && amount && (
          <Text style={styles.amount}>{amount}</Text>
        )}
        
        {config.showClose && onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    height: 70,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius:5,
    justifyContent: 'center',
    paddingHorizontal:10,
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap:2
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.fontBold,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.fontLight,
    color: '#4f4d4dff',
  },
  amount: {
    fontSize: 14,
    fontFamily: Fonts.fontMedium,
    color: '#333',
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
    position:'absolute',
    right:0,
    top:0,
  },
});
