import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import BlogForm from "./BlogForm";

describe("<Blog />", () => {
  const blog = {
    title: "Test Blog",
    author: "Test Author",
    url: "https://example.com",
    likes: 10,
    user: {
      username: "tester",
      name: "Test User",
    },
  };

  const currentUser = { username: "tester", name: "Test User" };

  test("renders title and author but not url or likes by default", () => {
    render(<Blog blog={blog} currentUser={currentUser} />);

    // ✅ title and author are visible
    const summary = screen.getByText(/Test Blog Test Author/i);
    expect(summary).toBeInTheDocument();

    // ❌ url and likes should not be visible by default
    const url = screen.queryByText("https://example.com");
    expect(url).not.toBeInTheDocument();

    const likes = screen.queryByText(/likes/i);
    expect(likes).not.toBeInTheDocument();
  });

  test("shows url and likes when view button is clicked", async () => {
    const { container } = render(
      <Blog blog={blog} currentUser={currentUser} />
    );

    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);

    // Now the url and likes should be visible
    expect(container).toHaveTextContent("https://example.com");
    expect(container).toHaveTextContent("likes 10");
  });

  test("calls onLike handler twice when like button is clicked twice", async () => {
    const mockLikeHandler = vi.fn(); // Use jest.fn() if using Jest instead of Vitest

    render(
      <Blog blog={blog} currentUser={currentUser} onLike={mockLikeHandler} />
    );

    const user = userEvent.setup();

    // Reveal the like button
    const viewButton = screen.getByText("view");
    await user.click(viewButton);

    const likeButton = screen.getByText("like");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(mockLikeHandler).toHaveBeenCalledTimes(2);
  });

  test("calls createBlog with correct details when form is submitted", async () => {
    const mockCreateBlog = vi.fn(); // or jest.fn() if you're using Jest
    const user = userEvent.setup();

    render(<BlogForm createBlog={mockCreateBlog} />);

    const titleInput = screen.getByLabelText(/title:/i);
    const authorInput = screen.getByLabelText(/author:/i);
    const urlInput = screen.getByLabelText(/url:/i);
    const createButton = screen.getByText("create");

    await user.type(titleInput, "Test Title");
    await user.type(authorInput, "Test Author");
    await user.type(urlInput, "http://example.com");
    await user.click(createButton);

    expect(mockCreateBlog).toHaveBeenCalledTimes(1);
    expect(mockCreateBlog).toHaveBeenCalledWith({
      title: "Test Title",
      author: "Test Author",
      url: "http://example.com",
    });
  });
});
