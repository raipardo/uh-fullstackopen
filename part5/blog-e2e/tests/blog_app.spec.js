const { test, expect, beforeEach, describe } = require("@playwright/test");
const { loginWith } = require("./helper");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:3003/api/testing/reset");
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Matti Luukkainen",
        username: "mluukkai",
        password: "mluukkai",
      },
    });

    await page.goto("http://localhost:5173");
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, "mluukkai", "mluukkai");
    });

    test("a new blog can be created", async ({ page }) => {
      await page.getByRole("button", { name: "create new blog" }).click();

      await page.getByLabel("title:").fill("Playwright Blog Title");
      await page.getByLabel("author:").fill("Playwright Author");
      await page.getByLabel("url:").fill("https://playwright.dev");

      await page.getByRole("button", { name: "create" }).click();

      await expect(page.getByText("Playwright Blog Title")).toBeVisible();
      await expect(page.getByText("Playwright Author")).toBeVisible();
    });

    test("a blog can be liked", async ({ page }) => {
      await page.getByRole("button", { name: "create new blog" }).click();
      await page.getByLabel("title:").fill("Likeable Blog");
      await page.getByLabel("author:").fill("Test Author");
      await page.getByLabel("url:").fill("https://example.com");
      await page.getByRole("button", { name: "create" }).click();

      const blog = await page.getByText("Likeable Blog");
      await blog.locator("..").getByRole("button", { name: "view" }).click();

      const likeText = await page.getByText(/likes 0/);
      const likeButton = await page.getByRole("button", { name: "like" });

      await likeButton.click();

      await expect(page.getByText(/likes 1/)).toBeVisible();
    });

    test("a blog can be deleted by its creator", async ({ page }) => {
      await page.getByRole("button", { name: "create new blog" }).click();
      await page.getByLabel("title:").fill("Blog to delete");
      await page.getByLabel("author:").fill("Author");
      await page.getByLabel("url:").fill("https://delete.me");
      await page.getByRole("button", { name: "create" }).click();

      const blogItem = await page.getByText("Blog to delete");
      await blogItem
        .locator("..")
        .getByRole("button", { name: "view" })
        .click();

      page.on("dialog", (dialog) => dialog.accept());

      await page.getByRole("button", { name: "remove" }).click();

      await expect(page.queryByText("Blog to delete")).not.toBeVisible();
    });
  });

  test("only the user who created the blog sees the delete button", async ({
    page,
    request,
  }) => {
    await request.post("http://localhost:3003/api/testing/reset");

    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Creator User",
        username: "creator",
        password: "secret1",
      },
    });

    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "Other User",
        username: "otheruser",
        password: "secret2",
      },
    });

    await page.goto("http://localhost:5173");

    await page.getByPlaceholder("username").fill("creator");
    await page.getByPlaceholder("password").fill("secret1");
    await page.getByRole("button", { name: "login" }).click();

    await page.getByRole("button", { name: "create new blog" }).click();
    await page.getByLabel("title:").fill("Blog by Creator");
    await page.getByLabel("author:").fill("Author");
    await page.getByLabel("url:").fill("https://only-creator.com");
    await page.getByRole("button", { name: "create" }).click();

    await page.getByRole("button", { name: "logout" }).click();

    await page.getByPlaceholder("username").fill("otheruser");
    await page.getByPlaceholder("password").fill("secret2");
    await page.getByRole("button", { name: "login" }).click();

    const blogItem = await page.getByText("Blog by Creator");
    await blogItem.locator("..").getByRole("button", { name: "view" }).click();

    const removeButton = page.getByRole("button", { name: "remove" });
    await expect(removeButton).not.toBeVisible();
  });

  test("blogs are ordered by likes, descending", async ({ page, request }) => {
    await request.post("http://localhost:3003/api/testing/reset");

    await request.post("http://localhost:3003/api/users", {
      data: {
        username: "orderuser",
        name: "Ordering Tester",
        password: "pass123",
      },
    });

    const token = await loginAndGetToken(request, "orderuser", "pass123");

    const blogs = [
      {
        title: "Least liked blog",
        author: "Low",
        url: "http://low.com",
        likes: 1,
      },
      {
        title: "Medium liked blog",
        author: "Medium",
        url: "http://medium.com",
        likes: 5,
      },
      {
        title: "Most liked blog",
        author: "High",
        url: "http://high.com",
        likes: 100,
      },
    ];

    for (const blog of blogs) {
      await createBlog(request, token, blog);
    }

    await page.goto("http://localhost:5173");
    await page.getByPlaceholder("username").fill("orderuser");
    await page.getByPlaceholder("password").fill("pass123");
    await page.getByRole("button", { name: "login" }).click();

    const viewButtons = await page.getByRole("button", { name: "view" }).all();
    for (const button of viewButtons) {
      await button.click();
    }

    const likeDivs = await page.locator("text=/likes \\d+/").allTextContents();
    const likeCounts = likeDivs.map((text) => parseInt(text.match(/\d+/)[0]));

    const sorted = [...likeCounts].sort((a, b) => b - a);
    expect(likeCounts).toEqual(sorted);
  });
});
