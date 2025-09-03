// Simple API layer to provide bank lists and any future endpoints
import { updateTable } from '@/firebase';
export type BankItem = { name: string; branch: string };

// Source of truth for branch codes
const bankBranchCodes: Record<string, string> = {
  'Capitec Bank': '470010',
  'Capitec Business': '450105',
  'ABSA Bank': '632005',
  'First National Bank': '250655',
  'Nedbank': '198765',
  'Standard Bank': '051001',
  'Access Bank LTD': '410506',
  'African Bank': '430000',
  'African Bank Business': '430001',
  'African Bank Inc Ubank': '431010',
  'Bidvest Bank': '462005',
  'Discovery Bank': '679000',
  'Investec Bank': '580105',
  'Mercantile Bank': '450905',
  'Sasfin Bank': '683000',
  'TymeBank': '678910',
};

const popularBankNames = [
  'Capitec Bank',
  'Capitec Business',
  'ABSA Bank',
  'First National Bank',
  'Nedbank',
  'Standard Bank',
];

const allBankNames = [
  'Access Bank LTD',
  'African Bank',
  'African Bank Business',
  'African Bank Inc Ubank',
  'Bidvest Bank',
  'Discovery Bank',
  'Investec Bank',
  'Mercantile Bank',
  'Sasfin Bank',
  'TymeBank',
  'Standard Bank',
  'Nedbank',
  'ABSA Bank',
  'First National Bank',
  'Capitec Bank',
  'Capitec Business',
];

export function getBanks(): { popular: BankItem[]; all: BankItem[] } {
  const toItems = (names: string[]): BankItem[] =>
    names.map((name) => ({ name, branch: bankBranchCodes[name] ?? '' }));

  return { popular: toItems(popularBankNames), all: toItems(allBankNames) };
}

// ---- Beneficiaries ----
export type AddBeneficiaryPayload = {
  name: string;
  account: string;
  bank: string;
  branch?: string;
  reference?: string;
  notificationType?: 'none' | 'sms' | 'email';
  notificationValue?: string;
  oneTime?: boolean;
  lastPaid?: string;
  id?: number;
  accountNumber:string;
  avatar:any
};

// Mocked API call – replace with real HTTP request later
export async function addBeneficiary(payload: AddBeneficiaryPayload): Promise<{ success: boolean }> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 600));
  console.log('Adding beneficiary', payload);
  return { success: true };
}

// ---- Update beneficiary notification settings (reuses Firebase) ----
export async function updateBeneficiaryNotification(account: string, notificationType: 'none' | 'sms' | 'email', notificationValue: string): Promise<boolean> {
  try {
    // beneficiaries are stored with docId = account
    const ok = await updateTable('beneficiaries', account, {
      notificationType,
      notificationValue,
    });
    return ok;
  } catch (e) {
    console.error('updateBeneficiaryNotification failed', e);
    return false;
  }
}

