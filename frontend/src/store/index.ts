import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import walletReducer from './walletSlice';
import themeReducer from './themeSlice';
import { setAuthTokenGetter } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    theme: themeReducer,
  },
});

setAuthTokenGetter(() => store.getState().auth.accessToken);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
