import { createSlice } from '@reduxjs/toolkit';

const initialState = { message: null, type: null };

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      const { message, type } = action.payload;
      return { message, type };
    },
    clearNotification() {
      return { message: null, type: null };
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
