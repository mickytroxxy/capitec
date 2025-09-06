import { RootState } from '@/state/store';
import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

export default function AuthGate() {
  const { accountInfo } = useSelector((s: RootState) => s.accountInfo);

  useEffect(() => {
    if (accountInfo) {
     router.replace('/sign-in');
    } else {
      router.replace('/register');
    }
  }, [accountInfo]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
    </View>
  );
}

