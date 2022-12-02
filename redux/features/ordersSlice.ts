import { createSlice } from "@reduxjs/toolkit";

export interface OrdersInitialization {
    order: any
    idOrder : string
    totalPrice: number
}

const initialState: OrdersInitialization = {
    order: {},
    idOrder: "",
    totalPrice: 0
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    setIdOrder: (state, action) => {
      state.idOrder = action.payload;
    },
    setTotalPrice : (state, action) => {
      state.totalPrice = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { setOrder , setIdOrder , setTotalPrice} = ordersSlice.actions;

export default ordersSlice.reducer;
