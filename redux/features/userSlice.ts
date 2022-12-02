import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../Models";

export interface UserInitialization {
  user: User | unknown;
  idEditing: string
  idProfile: string
  idNotification : string
  contentSnackBar: string
}

const initialState: UserInitialization = {
  user: {},
  idEditing: "",
  idProfile: "",
  idNotification: "",
  contentSnackBar: ""
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIdEditing: (state, action) => {
      state.idEditing = action.payload;
    },
    setIdProfile: (state, action) => {
      state.idProfile = action.payload;
    },
    setIdNotification : (state, action) => {
      state.idNotification = action.payload;
    },
    setContentSnackBar : (state, action) => {
      state.contentSnackBar = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { setUser, setIdEditing  , setIdProfile , setIdNotification , setContentSnackBar} = userSlice.actions;

export default userSlice.reducer;
