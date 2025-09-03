import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { CreditCard, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';

const dummyAccounts = [
  {
    id: 1,
    type: 'Savings Account',
    balance: 4573.89,
    accountNumber: '****7890',
    color: '#007ACC',
    icon: '💰'
  },
  {
    id: 2,
    type: 'Global One',
    balance: 1250.00,
    accountNumber: '****4321',
    color: '#E60000',
    icon: '🌍'
  },
  {
    id: 3,
    type: 'Credit Card',
    balance: -2340.67,
    accountNumber: '****5678',
    color: '#003366',
    icon: '💳',
    creditLimit: 15000
  }
];

export default function AccountsScreen() {
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return `R${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.accountsList}>
          {dummyAccounts.map((account) => (
            <TouchableOpacity 
              key={account.id} 
              style={[styles.accountCard, { borderLeftColor: account.color }]}
              onPress={() => setSelectedAccount(account.id === selectedAccount ? null : account.id)}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountIcon}>{account.icon}</Text>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountType}>{account.type}</Text>
                    <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#666" />
              </View>
              
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>
                  {account.balance < 0 ? 'Outstanding Balance' : 'Available Balance'}
                </Text>
                <Text style={[
                  styles.accountBalance,
                  { color: account.balance < 0 ? '#E60000' : '#333' }
                ]}>
                  {account.balance < 0 ? '-' : ''}{formatCurrency(account.balance)}
                </Text>
                
                {account.creditLimit && (
                  <Text style={styles.creditLimit}>
                    Credit Limit: {formatCurrency(account.creditLimit)}
                  </Text>
                )}
              </View>

              {selectedAccount === account.id && (
                <View style={styles.expandedSection}>
                  <View style={styles.accountActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Statements</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Add New Account */}
        <TouchableOpacity style={styles.addAccountCard}>
          <View style={styles.addAccountContent}>
            <View style={styles.addIcon}>
              <Text style={styles.addIconText}>+</Text>
            </View>
            <Text style={styles.addAccountText}>Add New Account</Text>
          </View>
        </TouchableOpacity>

        {/* Account Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Account Services</Text>
          
          <TouchableOpacity style={styles.serviceItem}>
            <CreditCard size={20} color="#E60000" />
            <Text style={styles.serviceText}>Apply for Credit Card</Text>
            <ChevronRight size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceItem}>
            <CreditCard size={20} color="#E60000" />
            <Text style={styles.serviceText}>Open New Account</Text>
            <ChevronRight size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007ACC',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  accountsList: {
    paddingHorizontal: 20,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  balanceSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 15,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  accountBalance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  creditLimit: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  expandedSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E60000',
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  addAccountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E60000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addAccountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E60000',
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  serviceItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
});