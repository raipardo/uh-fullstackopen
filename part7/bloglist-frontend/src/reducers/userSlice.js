import { createSlice } from '@reduxjs/toolkit';
import loginService from '../services/login';
import blogService from '../services/blogs';

const initialState = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
    clearUser() {
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const login = credentials => async dispatch => {
  const user = await loginService.login(credentials);
  window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
  blogService.setToken(user.token);
  dispatch(setUser(user));
};

export const logout = () => dispatch => {
  window.localStorage.removeItem('loggedBlogappUser');
  dispatch(clearUser());
};

export const loadUserFromStorage = () => dispatch => {
  const userJSON = window.localStorage.getItem('loggedBlogappUser');
  if (userJSON) {
    const user = JSON.parse(userJSON);
    blogService.setToken(user.token);
    dispatch(setUser(user));
  }
};

export default userSlice.reducer;
