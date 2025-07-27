import { useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { BOOK_ADDED, ALL_BOOKS } from "./queries";

const updateCacheWith = (client, addedBook) => {
  client.cache.updateQuery({ query: ALL_BOOKS }, (data) => {
    if (!data) return { allBooks: [addedBook] };
    if (data.allBooks.find((b) => b.id === addedBook.id)) {
      return data;
    }
    return {
      allBooks: data.allBooks.concat(addedBook),
    };
  });
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(
    localStorage.getItem("library-user-token")
  );
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      window.alert(
        `New book added: ${addedBook.title} by ${addedBook.author.name}`
      );
      updateCacheWith(client, addedBook);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem("library-user-token");
    client.resetStore();
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recommend")}>recommend</button>
        )}
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      {page === "authors" && <Authors show={page === "authors"} />}
      {page === "books" && <Books show={page === "books"} />}
      {page === "add" && <NewBook show={page === "add"} />}
      {page === "recommend" && <Recommendations show={page === "recommend"} />}
      {page === "login" && (
        <LoginForm
          show={page === "login"}
          setToken={setToken}
          setPage={setPage}
        />
      )}
    </div>
  );
};

export default App;
