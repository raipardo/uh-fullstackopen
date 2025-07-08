import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';

import Notification from './components/Notification';
import Togglable from './components/Togglable';
import BlogForm from './components/BlogForm';
import Users from './components/Users';
import User from './components/User';
import BlogPage from './components/BlogPage';
import Menu from './components/Menu';

import {
  setNotification,
  clearNotification,
} from './reducers/notificationSlice';

import {
  fetchBlogs,
  createBlog as createBlogAction,
  likeBlog,
  deleteBlog,
} from './reducers/blogSlice';

import { login as loginUser, loadUserFromStorage } from './reducers/userSlice';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const blogs = useSelector(state => state.blogs);
  const notification = useSelector(state => state.notification);
  const user = useSelector(state => state.user);

  const blogFormRef = useRef();

  useEffect(() => {
    dispatch(loadUserFromStorage());
    dispatch(fetchBlogs());
  }, [dispatch]);

  const notify = (message, type = 'success') => {
    dispatch(setNotification({ message, type }));
    setTimeout(() => {
      dispatch(clearNotification());
    }, 5000);
  };

  const handleLogin = async event => {
    event.preventDefault();
    try {
      await dispatch(loginUser({ username, password }));
      setUsername('');
      setPassword('');
    } catch {
      notify('Wrong username or password', 'error');
    }
  };

  const addBlog = async blogObject => {
    try {
      await dispatch(createBlogAction(blogObject)).unwrap();
      notify(`a new blog ${blogObject.title} by ${blogObject.author} added`);
      blogFormRef.current.toggleVisibility();
    } catch {
      notify('Failed to create blog', 'error');
    }
  };

  if (!user) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={notification.message} type={notification.type} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    );
  }

  return (
    <Router>
      <div>
        <Menu />
        <Notification message={notification.message} type={notification.type} />

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>blog app</h2>
                <Togglable buttonLabel="create new" ref={blogFormRef}>
                  <BlogForm createBlog={addBlog} />
                </Togglable>
                {blogs
                  .slice()
                  .sort((a, b) => b.likes - a.likes)
                  .map(blog => (
                    <div
                      key={blog.id}
                      style={{
                        padding: '5px',
                        border: '1px solid black',
                        marginBottom: '5px',
                      }}
                    >
                      <Link to={`/blogs/${blog.id}`}>
                        {blog.title} {blog.author}
                      </Link>
                    </div>
                  ))}
              </div>
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/blogs/:id" element={<BlogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
