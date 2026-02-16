import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../types';

interface IAuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState: IAuthState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ user: IUser; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
