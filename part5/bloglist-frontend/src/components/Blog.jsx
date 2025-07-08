import { useState } from "react";

const Blog = ({ blog, onLike, onDelete, currentUser }) => {
  const [visible, setVisible] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const canRemove = blog.user?.username === currentUser?.username;

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-summary">
        {blog.title} {blog.author}
        <button onClick={() => setVisible(!visible)}>
          {visible ? "hide" : "view"}
        </button>
      </div>

      {visible && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{" "}
            <button onClick={() => onLike(blog)}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {canRemove && <button onClick={() => onDelete(blog)}>remove</button>}
        </div>
      )}
    </div>
  );
};

export default Blog;
