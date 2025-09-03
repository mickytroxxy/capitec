import LinearButton from '@/components/ui/LinearButton';
import Nothing from '@/components/ui/Nothing';
import { colors } from '@/constants/Colors';
import { Stack, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Error() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Stack.Screen options={{ title: 'Error',headerLeft:() => <></> }} />
        <View style={styles.errorCard}>
            <Nothing hasX message='Unable to process your transaction. We are aware of the issue and aim to have it resolved.' />
        </View>
        <View style={{marginTop:15,paddingHorizontal:16}}>
            <LinearButton title="OK" onPress={() => router.back()} />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#f5f6f8',
    marginTop:0,
    
  },
  scroll: { backgroundColor: '#f5f6f8',paddingBottom:10},
  errorCard: { 
    shadowColor: '#000',
    backgroundColor:colors.white,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    overflow: 'hidden',
   },
});