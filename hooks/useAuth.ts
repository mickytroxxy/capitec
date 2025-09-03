import { loginApi } from "@/firebase";
import { setAccountInfo } from "@/state/slices/accountInfo";
import { RootState } from "@/state/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const dummyUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    accountNumber: '1234567890',
    email: 'john.doe@example.com',
    phone: '072 123 4567',
    balance: 625000,
    pin: '762456',
    active:true,
    notificationToken:''
}
export const useAuth = () => {
    const { accountInfo } = useSelector((state: RootState) => state.accountInfo);
    const dispatch = useDispatch();

    useEffect(() => {
        //dispatch(setAccountInfo(dummyUser));   
        (async () =>{
            const user = await loginApi(dummyUser?.accountNumber, dummyUser?.pin);
            if(user.length > 0){
                dispatch(setAccountInfo(user[0]));
            }
        })()
    }, [])

    return {
        accountInfo,
        isLoading: false,
        isAuthenticated: false,
        login: () => {},
        logout: () => {},
    };
};
