import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, initializeFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBCXXMJhi7f1eBWP29UsEPXFqj2bmQI1Sw",
  authDomain: "isafetech-d8503.firebaseapp.com",
  projectId: "isafetech-d8503",
  storageBucket: "isafetech-d8503.firebasestorage.app",
  messagingSenderId: "532788827111",
  appId: "1:532788827111:web:2fcb7c9807886d857be342"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });

export const loginApi = async (accountNumber: string, pin: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("accountNumber", "==", accountNumber), where("pin", "==", pin), where("active", "==", true)));
    // Ensure the Firestore document ID is preserved on the returned object.
    // If the document also contains an `id` field, spreading the data first prevents it from overwriting the doc ID.
    const data = querySnapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const createData = async (tableName: string, docId: string, data: any): Promise<boolean> => {
  try {
    await setDoc(doc(db, tableName, docId), data);
    console.log('Data created');
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getBeneficiaries = async (userId: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "beneficiaries"), where("userId", "==", parseFloat(userId))));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getPaymentHistoryByBeneficiary = async (accountsMerged: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "payments"), where("accountsMerged", "array-contains-any", [accountsMerged] )));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};
export const updateTable = async (tableName: string, docId: string, obj:any): Promise<boolean> => {
  try {
    const docRef = doc(db, tableName, docId);
    await updateDoc(docRef, obj);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getPaymentsForAccount = async (accountNumber: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'payments'), where('accounts', 'array-contains-any', [accountNumber]));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => d.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};