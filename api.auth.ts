import { createData, loginApi } from '@/firebase';
import { AccountType } from '@/state/slices/accountInfo';

export type RegisterPayload = Pick<AccountType, 'title' | 'firstName' | 'lastName' | 'email' | 'phone' | 'accountNumber' | 'pin'>;

export async function registerUser(p: RegisterPayload) {
  const data: AccountType = {
    id: Date.now(),
    title: p.title,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    accountNumber: p.accountNumber,
    pin: p.pin,
    balance: 0,
    active: true,
    notificationToken: '',
  } as any;
  const ok = await createData('users', String(data.id), data);
  return ok ? data : null;
}

export async function loginUser(accountNumber: string, pin: string) {
  const users = await loginApi(accountNumber, pin);
  return users?.[0] ?? null;
}

