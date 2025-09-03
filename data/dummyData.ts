export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  category: string;
  accountId?: number;
}

export interface Account {
  id: number;
  type: string;
  balance: number;
  accountNumber: string;
  color: string;
  icon: string;
  creditLimit?: number;
}

export interface Beneficiary {
  id: number;
  name: string;
  bank: string;
  accountNumber: string;
  lastPaid: string;
  avatar: string;
}

export const dummyAccounts: Account[] = [
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

export const dummyTransactions: Transaction[] = [
  {
    id: 1,
    description: 'Pick n Pay',
    amount: -234.50,
    date: '2025-01-20',
    type: 'debit',
    category: 'Groceries',
    accountId: 1
  },
  {
    id: 2,
    description: 'Salary Deposit',
    amount: 15000.00,
    date: '2025-01-20',
    type: 'credit',
    category: 'Income',
    accountId: 1
  },
  {
    id: 3,
    description: 'Netflix',
    amount: -199.00,
    date: '2025-01-19',
    type: 'debit',
    category: 'Entertainment',
    accountId: 1
  },
  {
    id: 4,
    description: 'Uber',
    amount: -87.30,
    date: '2025-01-19',
    type: 'debit',
    category: 'Transport',
    accountId: 2
  },
  {
    id: 5,
    description: 'Transfer from John',
    amount: 500.00,
    date: '2025-01-18',
    type: 'credit',
    category: 'Transfer',
    accountId: 2
  },
  {
    id: 6,
    description: 'Woolworths',
    amount: -456.78,
    date: '2025-01-18',
    type: 'debit',
    category: 'Groceries',
    accountId: 1
  },
  {
    id: 7,
    description: 'MTN Airtime',
    amount: -50.00,
    date: '2025-01-17',
    type: 'debit',
    category: 'Airtime',
    accountId: 1
  },
  {
    id: 8,
    description: 'Credit Card Payment',
    amount: -1000.00,
    date: '2025-01-16',
    type: 'debit',
    category: 'Payment',
    accountId: 1
  }
];

export const dummyBeneficiaries: Beneficiary[] = [
  {
    id: 1,
    name: 'A Wagenaar',
    bank: 'Capitec Bank',
    accountNumber: '****1234',
    lastPaid: '23 Nov 2020',
    avatar: 'AW'
  },
  {
    id: 2,
    name: 'Airport Inn and suites',
    bank: 'Standard Bank',
    accountNumber: '****5678',
    lastPaid: '31 Aug 2023',
    avatar: 'AI'
  },
  {
    id: 3,
    name: 'Angela Masondo',
    bank: 'FNB',
    accountNumber: '****9012',
    lastPaid: '31 Oct 2022',
    avatar: 'AM'
  },
  {
    id: 4,
    name: 'BA Ludidi',
    bank: 'ABSA',
    accountNumber: '****3456',
    lastPaid: '30 Jan 2022',
    avatar: 'BL'
  },
  {
    id: 5,
    name: 'Backdoor Thrift',
    bank: 'Nedbank',
    accountNumber: '****7890',
    lastPaid: '19 Sep 2022',
    avatar: 'BT'
  },
  {
    id: 6,
    name: 'Benny S',
    bank: 'Capitec Bank',
    accountNumber: '****2345',
    lastPaid: '14 Dec 2023',
    avatar: 'BS'
  },
  {
    id: 7,
    name: 'Backdoor Thrift',
    bank: 'Nedbank',
    accountNumber: '****7890',
    lastPaid: '19 Sep 2022',
    avatar: 'BT'
  },
  {
    id: 8,
    name: 'Benny S',
    bank: 'Capitec Bank',
    accountNumber: '****2345',
    lastPaid: '14 Dec 2023',
    avatar: 'BS'
  },
  {
    id: 9,
    name: 'Backdoor Thrift',
    bank: 'Nedbank',
    accountNumber: '****7890',
    lastPaid: '19 Sep 2022',
    avatar: 'BT'
  },
  {
    id: 10,
    name: 'Benny S',
    bank: 'Capitec Bank',
    accountNumber: '****2345',
    lastPaid: '14 Dec 2023',
    avatar: 'BS'
  }
];