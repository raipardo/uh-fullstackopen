import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import styled from 'styled-components';

import { likeBlog, commentOnBlog } from '../reducers/blogSlice';
import {
  setNotification,
  clearNotification,
} from '../reducers/notificationSlice';

const Container = styled.div`
  padding: 1rem;
  max-width: 800px;
`;

const Title = styled.h2`
  font-size: 1.5em;
  margin-bottom: 0.5em;
`;

const Url = styled.a`
  color: #0366d6;
  display: block;
  margin-bottom: 0.5em;
`;

const Likes = styled.div`
  margin-bottom: 0.5em;
`;

const LikeButton = styled.button`
  margin-left: 1em;
  padding: 5px 10px;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const Author = styled.div`
  font-style: italic;
  margin-bottom: 1em;
`;

const SectionHeader = styled.h3`
  margin-top: 2em;
  margin-bottom: 0.5em;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

const SubmitButton = styled.button`
  padding: 6px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;

  &:hover {
    background-color: #0056b3;
  }
`;

const CommentList = styled.ul`
  list-style: disc;
  padding-left: 1.5em;
`;

const BlogPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const blog = useSelector(state => state.blogs.find(b => b.id === id));
  const [commentText, setCommentText] = useState('');

  if (!blog) return <div>Loading blog...</div>;

  const handleLike = () => {
    dispatch(likeBlog(blog));
    dispatch(setNotification({ message: `Liked ${blog.title}` }));
    setTimeout(() => dispatch(clearNotification()), 5000);
  };

  const handleCommentSubmit = async event => {
    event.preventDefault();
    try {
      await dispatch(commentOnBlog({ id: blog.id, comment: commentText }));
      setCommentText('');
    } catch {
      dispatch(
        setNotification({ message: 'Failed to add comment', type: 'error' })
      );
      setTimeout(() => dispatch(clearNotification()), 5000);
    }
  };

  return (
    <Container>
      <Title>
        {blog.title} {blog.author}
      </Title>
      <Url href={blog.url} target="_blank" rel="noopener noreferrer">
        {blog.url}
      </Url>
      <Likes>
        {blog.likes} likes
        <LikeButton onClick={handleLike}>like</LikeButton>
      </Likes>
      <Author>added by {blog.user?.name || 'unknown'}</Author>

      <SectionHeader>comments</SectionHeader>

      <CommentForm onSubmit={handleCommentSubmit}>
        <CommentInput
          value={commentText}
          onChange={({ target }) => setCommentText(target.value)}
          placeholder="Write a comment..."
        />
        <SubmitButton type="submit">add comment</SubmitButton>
      </CommentForm>

      <CommentList>
        {blog.comments.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </CommentList>
    </Container>
  );
};

export default BlogPage;
