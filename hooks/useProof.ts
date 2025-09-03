import useFetch, { BASE_URL } from "./useFetch";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
export const phoneNoValidation = (phone: string, countryCode: string): string | false => {
    countryCode = countryCode.slice(1, countryCode.length);
    let phoneNumber = phone.replace(/ /g, '');

    if (phoneNumber.length < 16 && phoneNumber.length > 7) {
        if (phoneNumber[0] === "0" && phoneNumber[1] !== "0") {
        phoneNumber = phoneNumber.slice(1);
        } else if (phoneNumber[0] !== '0') {
        phoneNumber = phoneNumber;
        }

        if (countryCode !== "") {
        if (countryCode[0] === "+") {
            countryCode = countryCode.slice(1);
        } else {
            if (countryCode[0] === "0" && countryCode[1] === "0") {
            countryCode = countryCode.slice(2);
            }
        }
        return countryCode + phoneNumber;
        } else {
        return false;
        }
    } else {
        return false;
    }
};
export interface ProofOfPayment {
    amount: string;
    date: number;
    beneficiary: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    paymentType: string;
    paymentReference: string;
    senderName: string;
    title: string;
    notificationType: 'EMAIL' | 'SMS' | 'SHARE';
    notificationValue: string;// scale factor applied to topOffset and lineGap (default 1)
    isImmediate: boolean;
}
export const useProof = () => {
    const {fetchData} = useFetch();

    
    const generateProofOfPayment = async (data:ProofOfPayment) => {
        try {
            const response = await fetchData({endPoint:'/proof',method:'POST',data});
            console.log(response)
            if(response?.url){
                if(data.notificationType === 'SHARE'){
                    const url = BASE_URL + response?.url;
                    await sharePDF(url);
                }
            } else {
                Alert.alert('Error', 'Failed to generate proof of payment');
            }
        } catch (error) {
            console.error('Error generating proof of payment:', error);
            Alert.alert('Error', 'Failed to generate proof of payment');
        }
    }

    const sharePDF = async (pdfUrl: string) => {
        try {
            // Check if sharing is available
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }

            // Download the PDF to local storage first
            const fileName = `proof_of_payment_${Date.now()}.pdf`;
            const localUri = `${FileSystem.documentDirectory}${fileName}`;

            const downloadResult = await FileSystem.downloadAsync(pdfUrl, localUri);

            if (downloadResult.status === 200) {
                // Share the downloaded PDF
                await Sharing.shareAsync(downloadResult.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Proof of Payment',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Error', 'Failed to download PDF');
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert('Error', 'Failed to share PDF');
        }
    }

    return {
        generateProofOfPayment,
        sharePDF
    }
}