import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { showSuccess, successConfigs } from '@/state/slices/successSlice';

export default function BeneficiaryAddedScreen() {
  const { name, account } = useLocalSearchParams<{ name?: string, account?: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    const displayName = (typeof name === 'string' && name.length > 0) ? name : 'The beneficiary';
    const config = successConfigs.beneficiaryAdded(displayName, account || '');

    dispatch(showSuccess(config));
    router.replace('/success-status' as any);
  }, [name, account, dispatch]);

  return null; // This component just redirects
}

