import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import userService from '../services/users';

const User = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await userService.getAll();
        const foundUser = users.find(u => u.id === id);
        setUser(foundUser);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map(blog => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default User;
