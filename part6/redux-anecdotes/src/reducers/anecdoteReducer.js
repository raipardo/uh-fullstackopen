import { createSlice } from "@reduxjs/toolkit";
import { getAll, createNew, updateAnecdote } from "../services/anecdoteService";

const anecdoteSlice = createSlice({
  name: "anecdotes",
  initialState: [],
  reducers: {
    incrementVote(state, action) {
      const updated = action.payload;
      return state.map((anec) => (anec.id === updated.id ? updated : anec));
    },
    appendAnecdote(state, action) {
      state.push(action.payload);
    },
    setAnecdotes(state, action) {
      return action.payload;
    },
  },
});

export const { incrementVote, appendAnecdote, setAnecdotes } =
  anecdoteSlice.actions;

export const initializeAnecdotes = () => {
  return async (dispatch) => {
    const anecdotes = await getAll();
    dispatch(setAnecdotes(anecdotes));
  };
};

export const createAnecdote = (content) => {
  return async (dispatch) => {
    const newAnecdote = await createNew(content);
    dispatch(appendAnecdote(newAnecdote));
  };
};

export const voteAnecdote = (anecdote) => {
  return async (dispatch) => {
    const updated = { ...anecdote, votes: anecdote.votes + 1 };
    const saved = await updateAnecdote(updated);
    dispatch(incrementVote(saved));
  };
};

export default anecdoteSlice.reducer;
