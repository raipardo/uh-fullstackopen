import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutUser } from '../reducers/userSlice';

const NavBar = styled.div`
  background: #eee;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledLink = styled(Link)`
  padding: 6px 10px;
  text-decoration: none;
  color: #0366d6;

  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  margin-left: auto;
  padding: 5px 10px;
  background: #ff5555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #e22;
  }
`;

const Menu = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <NavBar>
      <StyledLink to="/">blogs</StyledLink>
      <StyledLink to="/users">users</StyledLink>
      {user && (
        <>
          <span>{user.name} logged in</span>
          <LogoutButton onClick={handleLogout}>logout</LogoutButton>
        </>
      )}
    </NavBar>
  );
};

export default Menu;
