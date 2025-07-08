const loginWith = async (page, username, password) => {
  await page.getByPlaceholder("username").fill(username);
  await page.getByPlaceholder("password").fill(password);
  await page.getByRole("button", { name: "login" }).click();
};

const createBlog = async (request, token, blog) => {
  await request.post("http://localhost:3003/api/blogs", {
    data: blog,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const loginAndGetToken = async (request, username, password) => {
  const response = await request.post("http://localhost:3003/api/login", {
    data: { username, password },
  });
  return response.ok() ? response.json().then((r) => r.token) : null;
};

module.exports = {
  loginWith,
  createBlog,
  loginAndGetToken,
};
