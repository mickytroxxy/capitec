import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Tabs } from 'expo-router';
import { LucideBinoculars, MessageSquareText } from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { color: '#fff', fontFamily: Fonts.fontMedium,fontSize:16 },
        headerTintColor: '#fff',
        headerTitleAlign:'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Fonts.fontBold,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => <Image source={require('../../assets/images/global.png')} resizeMode="contain" style={{width:130,height:50,alignSelf:'center'}} />,
          headerRight: () => (
            <View style={{paddingRight:10}}><Icon name="phone-call" type="Feather" size={30} color={colors.white} /></View>
          ),
          headerLeft: () => (
            <View style={{paddingLeft:10}}><Icon name="user-circle-o" type="FontAwesome" size={30} color="#fff" /></View>
          ),
          tabBarIcon: ({ size, color }) => (
            <Icon name="home" type="SimpleLineIcons" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Cards',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{}}>
              <Image
                source={require('../../assets/images/cards.png')}
                style={[
                  {width: 32, height: 32},
                  { tintColor: focused ? colors.primary : '#666' }
                ]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Transact',
          headerRight:() => <View style={{paddingRight:10}}><Icon name="lock" type="SimpleLineIcons" size={24} color={colors.white} /></View>,
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.transactIconContainer}>
              <Image
                source={require('../../assets/images/transact.png')}
                style={[
                  styles.transactIcon,
                  { tintColor: focused ? colors.primary : '#666' }
                ]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageSquareText size={size} color={color} />
          ),
          tabBarBadge: '2+',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => (
            <LucideBinoculars size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  transactIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    height:90,
    width:100,
    justifyContent:'center',
    alignItems:'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  transactIcon: {
    width: 55,
    height: 55,
    marginBottom:15
  },
});