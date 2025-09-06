import { RootState } from "@/state/store";
import { useSelector } from "react-redux";

export const useAuth = () => {
    const { accountInfo } = useSelector((state: RootState) => state.accountInfo);

    return {
        accountInfo,
        isLoading: false,
        isAuthenticated: !!accountInfo,
        login: () => {},
        logout: () => {},
    };
};
