import { router, Stack } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BeneficiaryListItem from '@/components/BeneficiaryListItem';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import Nothing from '@/components/ui/Nothing';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getBeneficiaries } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { setBeneficiaries } from '@/state/slices/beneficiaries';
import { setLoadingState } from '@/state/slices/loader';
import { RootState } from '@/state/store';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

export default function PayBeneficiaryScreen() {
  const [searchText, setSearchText] = useState('');
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'za'>('recent');
  const [filterBy, setFilterBy] = useState<'6m' | '12m' | 'never' | 'all'>('all');
  const [tab, setTab] = useState<'frequent' | 'one'>('frequent');
  const beneficiaries = useSelector((s: RootState) => {
    // Ensure we always return an array, even if beneficiaries is undefined
    return Array.isArray(s.beneficiaries?.beneficiaries) ? s.beneficiaries.beneficiaries : [];
  });
  const {accountInfo} = useAuth();
  const isFocused = useIsFocused();
  const sortOptions: DropdownOption[] = [
    { label: 'Recently paid', value: 'recent' },
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' },
  ];
  const filterOptions: DropdownOption[] = [
    { label: 'Last 6 months', value: '6m' },
    { label: 'Last 12 months', value: '12m' },
    { label: 'Never paid', value: 'never' },
    { label: 'Show all', value: 'all' },
  ];

  const parseDate = (d: string | number | undefined | null) => {
    if (typeof d === 'number') return d;
    if (typeof d === 'string') {
      // Handle different date formats
      if (d === 'Not paid' || d === 'Never paid') return 0;

      // Try parsing as timestamp string first
      const timestamp = parseInt(d);
      if (!isNaN(timestamp) && timestamp > 0) {
        return timestamp;
      }

      // Try to parse the date string
      const t = new Date(d).getTime();
      if (!isNaN(t)) return t;

      // Try parsing DD MMM YYYY format (e.g., "26 Jul 2025")
      const parts = d.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
      if (parts) {
        const [, day, month, year] = parts;
        const monthMap: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const date = new Date(parseInt(year), monthMap[month] || 0, parseInt(day));
        return date.getTime();
      }

      return 0;
    }
    return 0;
  };

  const now = Date.now();
  const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
  const twelveMonths = 1000 * 60 * 60 * 24 * 30 * 12;

  const filteredBeneficiaries = useMemo(() => {
    // Base list by tab
    let list = (beneficiaries || []).filter(b =>
      (tab === 'frequent' ? !b.oneTime : !!b.oneTime)
    ).filter(b => b.name.toLowerCase().includes(searchText.toLowerCase()));

    // Filter by date
    if (filterBy === '6m') {
      list = list.filter(b => now - parseDate(b.lastPaid) <= sixMonths);
    } else if (filterBy === '12m') {
      list = list.filter(b => now - parseDate(b.lastPaid) <= twelveMonths);
    } else if (filterBy === 'never') {
      list = list.filter(b => !b.lastPaid || parseDate(b.lastPaid) === 0);
    }
    // For 'all' case, we don't filter by date - show all beneficiaries

    // Sort - default to latest date first (most recent payments at top)
    list = list.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      // For 'recent' or default, sort by latest date first
      const dateA = parseDate(a.lastPaid);
      const dateB = parseDate(b.lastPaid);

      // If both have dates, sort by most recent first
      if (dateA > 0 && dateB > 0) {
        return dateB - dateA;
      }
      // If only one has a date, prioritize the one with a date
      if (dateA > 0 && dateB === 0) return -1;
      if (dateB > 0 && dateA === 0) return 1;
      // If neither has a date, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [beneficiaries, searchText, sortBy, filterBy, tab]);

  useEffect(() => {
    (async() => {
      dispatch(setLoadingState({isloading:true,type:'spinner'}))
      const response = await getBeneficiaries(accountInfo?.id as any || '');
      if(response?.length > 0){
        // Transform the data to include required properties for the UI
        const transformedBeneficiaries = response.map((beneficiary, index) => {
          let formattedLastPaid = 'Not paid';

          if (beneficiary.lastPaid) {
            try {
              let date;

              // Handle both timestamp (number) and date string formats
              if (typeof beneficiary.lastPaid === 'number') {
                date = new Date(beneficiary.lastPaid);
              } else if (typeof beneficiary.lastPaid === 'string') {
                // Try parsing as timestamp first
                const timestamp = parseInt(beneficiary.lastPaid);
                if (!isNaN(timestamp) && timestamp > 0) {
                  date = new Date(timestamp);
                } else {
                  // Fallback to parsing as date string
                  date = new Date(beneficiary.lastPaid);
                }
              }

              if (date && !isNaN(date.getTime())) {
                formattedLastPaid = date.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
              }
            } catch (error) {
              console.warn('Error formatting date:', beneficiary.lastPaid, error);
              formattedLastPaid = 'Not paid';
            }
          }

          return {
            ...beneficiary,
            id: index + 1, // Use index as numeric ID
            avatar: beneficiary.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'XX', // Generate avatar from initials
            accountNumber: beneficiary.account ? `****${beneficiary.account.slice(-4)}` : '****0000', // Format account number
            lastPaid: formattedLastPaid,
          };
        });
        dispatch(setBeneficiaries(transformedBeneficiaries));
        
      }
      dispatch(setLoadingState({isloading:false,type:'spinner'}))
    })()
  },[isFocused])
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen options={{headerTitle:'Pay Beneficiary'}} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{backgroundColor:colors.white,borderRadius:10,paddingVertical:12,margin:8}}>
          {/* Search + Add */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Search size={18} color={colors.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search beneficiaries"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => router.push('/add-beneficiary')}>
              <Plus size={22} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Controls chips */}
          <View style={styles.controlsRow}>
            <View>
              <Dropdown
                label="Sort by"
                title="Sort by"
                value={sortBy}
                options={sortOptions}
                onChange={(v) => setSortBy(v as any)}
              />
            </View>
            
            <View>
              <Dropdown
                label=""
                title="Filter by"
                value={filterBy}
                options={filterOptions}
                placeholder="Show all"
                onChange={(v) => setFilterBy(v as any)}
              />
            </View>
          </View>
        </View>
        <View style={styles.beneficiariesContainer}>
          {/* Segmented control */}
          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segmentBtn, tab === 'frequent' && styles.segmentBtnActive]}
              onPress={() => setTab('frequent')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, tab === 'frequent' && styles.segmentTextActive]}>Frequent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, tab === 'one' && styles.segmentBtnActive]}
              onPress={() => setTab('one')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, tab === 'one' && styles.segmentTextActive]}>One time</Text>
            </TouchableOpacity>
          </View>

          {/* List - Takes remaining space */}
          {filteredBeneficiaries.length > 0 ? (
            <ScrollView style={styles.beneficiariesScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.beneficiariesSection}>
                {filteredBeneficiaries.map((beneficiary) => (
                  <BeneficiaryListItem
                    key={beneficiary.id}
                    beneficiary={beneficiary}
                    onPress={() => router.push({ pathname: '/payment-form', params: { account: beneficiary?.account } })}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Nothing message={'You have no beneficiaries.'} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  content: { flex: 1, paddingTop: 10 },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 10 },
  searchContainer: {
    flex: 1,
    backgroundColor: colors.faintGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 55,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111', fontFamily: Fonts.fontLight },
  addBtn: {
    width: 55,
    height: 55,
    backgroundColor: colors.primary,
    marginLeft: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 12, fontFamily: Fonts.fontBold },

  controlsRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 10,gap:10,marginTop:5 },

  segment: {
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: colors.faintGray,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { color: '#37474F', fontSize: 14, fontFamily: Fonts.fontLight },
  segmentTextActive: { color: '#fff', fontFamily: Fonts.fontBold },

  beneficiariesContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 20,
    margin: 8,
    marginTop: 3,
    paddingHorizontal: 10,
    paddingBottom:400
  },
  beneficiariesScroll: {
    flex: 1,
  },
  beneficiariesSection: {
    paddingBottom: 20,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});