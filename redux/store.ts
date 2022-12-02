import { configureStore } from "@reduxjs/toolkit";
import pitchReducer from "./features/pitchSlice";
import isReducer from "./features/isSlice";
import userReducer from "./features/userSlice";
import transactionReducer from './features/transactionSlice'
import ordersReducer from './features/ordersSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    pitch: pitchReducer,
    is: isReducer,
    orders: ordersReducer,
    transaction: transactionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
