import { createSlice } from "@reduxjs/toolkit";

export interface State {
  isLoading: boolean;
  isUpdated: boolean;
  isOpenProfileModal: boolean,
  isOpenFormEditUser: boolean
  isOpenFormTransaction: boolean
  isOpenTransactionDetail: boolean
  isOpenBackdropModal: boolean
  isOpenPaymentModal: boolean
  isOpenNotificationDetail: boolean
  isOpenSnackbar: boolean
  isOpenCartDetail : boolean
  isOpenOrderProduct : boolean
  isOpenDashboard : boolean
  isOpenChatBox : boolean
}

const initialState: State = {
  isLoading: true,
  isUpdated: false,
  isOpenProfileModal: false,
  isOpenFormEditUser: false,
  isOpenFormTransaction: false,
  isOpenTransactionDetail: false,
  isOpenBackdropModal: false,
  isOpenPaymentModal: false,
  isOpenNotificationDetail : false,
  isOpenSnackbar : false,
  isOpenCartDetail: false,
  isOpenOrderProduct : false,
  isOpenDashboard: false,
  isOpenChatBox : false
};

export const isSlice = createSlice({
  name: "isSlice",
  initialState,
  reducers: {
    setIsLoading: (state: any, action: any) => {
      state.isLoading = action.payload;
    },
    setOpenProfileModal: (state: any, action: any) => {
      state.isOpenProfileModal = action.payload;
    },
    setIsUpdate: (state: any, action: any) => {
      state.isUpdated = action.payload;
    },
    setOpenFormEditUser: (state: any, action: any) => {
      state.isOpenFormEditUser = action.payload
    },
    setOpenFormTransaction: (state: any, action: any) => {
      state.isOpenFormTransaction = action.payload
    },
    setOpenTransactionDetail: (state: any, action: any) => {
      state.isOpenTransactionDetail = action.payload
    },
    setOpenBackdropModal: (state: any, action: any) => {
      state.isOpenBackdropModal = action.payload
    },
     setOpenPaymentModal: (state: any, action: any) => {
      state.isOpenPaymentModal = action.payload
    },
    setOpenNotificationDetail : (state: any, action: any) => {
      state.isOpenNotificationDetail = action.payload
    },
    setOpenSnackBar : (state: any, action: any) => {
      state.isOpenSnackbar = action.payload
    },
     setOpenCartDetail : (state: any, action: any) => {
      state.isOpenCartDetail = action.payload
    },
      setOpenOrderProduct : (state: any, action: any) => {
      state.isOpenOrderProduct = action.payload
    },
    setOpenDashboard : (state: any, action: any) => {
      state.isOpenDashboard = action.payload
    },
     setOpenChatBox : (state: any, action: any) => {
      state.isOpenChatBox = action.payload
    }
  },
});

// Action creators are generated for each case reducer function
export const { setIsLoading, setIsUpdate, setOpenFormEditUser , setOpenFormTransaction , setOpenTransactionDetail , setOpenBackdropModal , setOpenProfileModal , setOpenPaymentModal ,setOpenNotificationDetail ,setOpenSnackBar , setOpenCartDetail , setOpenOrderProduct , setOpenDashboard , setOpenChatBox} = isSlice.actions;

export default isSlice.reducer;
