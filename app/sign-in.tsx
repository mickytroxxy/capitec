import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import { SafeAreaView } from 'react-native-safe-area-context';


const {width} = Dimensions.get('screen')
export default function SignInScreen() {
  const {accountInfo} = useAuth();

  const renderTabBar = () => null;

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.topToggle}>
            <Text style={styles.toggleText}>For me</Text>
          </View>
          <View style={{position:'absolute',alignSelf:'center',marginTop:16,zIndex:11,right:10}}>
            <TouchableOpacity><Icon name='more-vertical' type="Feather" size={30} color={colors.primary} /></TouchableOpacity>
          </View>
          <View style={{width:width,backgroundColor:'orange'}}>
            <Image source={require('../assets/images/signinimage.png')} style={styles.hero} resizeMode="cover" />
          </View>
          <View style={{position:'absolute',alignSelf:'center',bottom:48}}>
            <Text style={{ fontFamily: Fonts.fontRegular, fontSize: 16, color: colors.black}}>{accountInfo?.firstName?.toUpperCase()}</Text>
            <View style={{flexDirection:'row',gap:4,alignItems:'center',alignContent:'center',justifyContent:'center'}}>
              <Icon type='FontAwesome' name='circle' color={colors.primary} size={16} />
              <Icon type='FontAwesome' name='circle-o' color={colors.gray} size={16} />
            </View>
          </View>
        </View>
        <View style={{alignItems:'center', justifyContent:'center',alignContent:'center'}}>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.tile}>
              <Icon name="smartphone" type="Feather" size={24} color={colors.primary} />
              <Text style={styles.tileLabel}>Buy airtime and data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile}>
              <Icon name="zap" type="Feather" size={24} color={colors.primary} />
              <Text style={styles.tileLabel}>Buy electricity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile}>
              <Icon name="compare-arrows" type="MaterialIcons" size={24} color={colors.primary} />
              <Text style={styles.tileLabel}>Transfer money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile}>
              <Icon name="qr-code" type="MaterialIcons" size={24} color={colors.primary} />
              <Text style={styles.tileLabel}>Pay me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tile,]}>
              <Icon name="file-text" type="Feather" size={24} color={colors.primary} />
              <Text style={styles.tileLabel}>Pay bills</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ width: '100%', paddingHorizontal: 16, marginTop: 10,paddingBottom:400 }}>
          <LinearButton title="Sign In" onPress={() => router.push({pathname:'/enter-pin',params:{action:'old'}})} />
        </View>
      </ScrollView>

      <View>
        <CurvedBottomBarExpo.Navigator
          type="UP"
          style={styles.bottomBar}
          shadowStyle={styles.shawdow}
          height={55}
          circleWidth={50}
          
          bgColor="white"
          initialRouteName="title1"
          renderCircle={() => (
            <View>
              <Animated.View style={styles.btnCircleUp}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {}}
              >
                <FontAwesome name={'qrcode'} color={colors.white} size={24} />
              </TouchableOpacity>
              
            </Animated.View>
            <Text style={{marginTop:-15,fontFamily:Fonts.fontRegular}}>Scan to pay</Text>
            </View>
          )}
          tabBar={renderTabBar}
        >
        <CurvedBottomBarExpo.Screen name="title1" position="LEFT" component={() => <View />} />
        <CurvedBottomBarExpo.Screen name="title2" component={() => <View />}/>
      </CurvedBottomBarExpo.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f8ff' },
  content: { paddingBottom: 24, alignItems: 'center' },
  topToggle: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, position:'absolute',alignSelf:'center',zIndex:10 },
  toggleText: { color: colors.white, fontFamily: Fonts.fontBold },
  hero: { width: width, height: 320},
  pill: { backgroundColor: '#e6f4fd', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  pillText: { color: colors.primary, fontFamily: Fonts.fontBold },
  name: { color: '#333', marginTop: 8, fontFamily: Fonts.fontBold, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop:-35,paddingHorizontal:'2%' },
  tile: { 
    width: '48%', 
    backgroundColor: '#fff', 
    padding: 16, borderRadius: 3, alignItems: 'center', gap: 10 ,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    shadowColor: '#000',
  },
  tileLabel: { fontFamily: Fonts.fontLight, color: '#111', textAlign: 'center' },

  shawdow: {
    shadowColor: '#292626ff',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 100,
    shadowRadius: 500,
    elevation:10
  },
  button: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {},
  btnCircleUp: {
    width: 45,
    height: 45,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:15,
    backgroundColor: colors.primary,
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 100,
  },
  imgCircle: {
    width: 30,
    height: 30,
    tintColor: 'gray',
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 30,
    height: 30,
  },
  screen1: {
    flex: 1,
    backgroundColor: '#BFEFFF',
  },
  screen2: {
    flex: 1,
    backgroundColor: '#FFEBCD',
  },
});

