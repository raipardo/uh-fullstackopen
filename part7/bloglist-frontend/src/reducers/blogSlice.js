import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../services/blogs';

export const fetchBlogs = createAsyncThunk('blogs/fetchAll', async () => {
  const blogs = await blogService.getAll();
  return blogs;
});

export const createBlog = createAsyncThunk(
  'blogs/create',
  async (blogData, { rejectWithValue }) => {
    try {
      const newBlog = await blogService.create(blogData);
      return newBlog;
    } catch (err) {
      return rejectWithValue('Failed to create blog');
    }
  }
);

export const likeBlog = createAsyncThunk('blogs/like', async blog => {
  const updatedBlog = {
    ...blog,
    user: blog.user.id || blog.user,
    likes: blog.likes + 1,
  };
  const returned = await blogService.update(blog.id, updatedBlog);
  return returned;
});

export const deleteBlog = createAsyncThunk('blogs/delete', async id => {
  await blogService.remove(id);
  return id;
});

export const commentOnBlog = createAsyncThunk(
  'blogs/comment',
  async ({ id, comment }) => {
    const updatedBlog = await blogService.createComment(id, comment);
    return updatedBlog;
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBlogs.fulfilled, (_, action) => action.payload)
      .addCase(createBlog.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(likeBlog.fulfilled, (state, action) => {
        return state.map(blog =>
          blog.id === action.payload.id ? action.payload : blog
        );
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        return state.filter(blog => blog.id !== action.payload);
      })
      .addCase(commentOnBlog.fulfilled, (state, action) => {
        return state.map(blog =>
          blog.id === action.payload.id ? action.payload : blog
        );
      });
  },
});

export default blogSlice.reducer;
