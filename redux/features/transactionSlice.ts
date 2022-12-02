import { createSlice } from '@reduxjs/toolkit'

export interface TransactionState {
  action: string
  idTransaction: string
}

const initialState: TransactionState = {
    action: "",
    idTransaction: ""
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setAction: (state, action) => {
       state.action = action.payload
    },
    setIdTransaction: (state, action) => {
       state.idTransaction = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setAction , setIdTransaction } = transactionSlice.actions

export default transactionSlice.reducer