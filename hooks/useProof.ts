import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import useFetch, { BASE_URL } from "./useFetch";
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
        const notificationValue = data?.notificationValue;
        const notificationType = data?.notificationType;
        if(notificationType === 'SMS'){
            const phoneNo = phoneNoValidation(notificationValue,'+27');
            if(phoneNo){
                data = {...data,notificationValue:phoneNo}
            }
        }
        console.log(data, '----->')
        try {
            const response = await fetchData({endPoint:'/proof',method:'POST',data});
            console.log(response)
            if(response?.url){
                if(data.notificationType === 'SHARE'){
                    const url = BASE_URL + response?.url;
                    await sharePDF(url);
                }
            }
        } catch (error) {
            console.error('Error generating proof of payment:', error);
        }
    }

    const sharePDF = async (pdfUrl: string) => {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on this device');
                return;
            }

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

    const shareTextMessage = async (message: string) => {
        try {
            const { Share } = await import('react-native');
            await Share.share({
                message: message,
                title: 'Share Payment Notification',
            });
        } catch (error) {
            console.error('Error sharing text:', error);
            Alert.alert('Error', 'Failed to share message');
        }
    }

    return {
        generateProofOfPayment,
        sharePDF,
        shareTextMessage
    }
}