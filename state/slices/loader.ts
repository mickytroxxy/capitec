import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export type LoaderType = {
  isloading:boolean,
  type:'lock' | 'spinner'
}
const initialState: {
  state:LoaderType
} = {
  state:{
    isloading:false,
    type:'lock'
  }
};

const loaderSlice = createSlice({
  name: "loaderSlice",
  initialState,
  reducers: {
    setLoadingState: (statie, action: PayloadAction<LoaderType>) => {
      statie.state = action.payload;
    }
  },
});

export const { setLoadingState } = loaderSlice.actions;
export default loaderSlice.reducer;
