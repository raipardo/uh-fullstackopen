import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: null },
  });

  if (!props.show) return null;
  if (loading) return <div>loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const books = data.allBooks;

  const genres = Array.from(
    new Set(books.flatMap((b) => b.genres).filter(Boolean))
  );

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    refetch({ genre });
  };

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "1em" }}>
        {genres.map((g, idx) => (
          <button key={`genre-${g}-${idx}`} onClick={() => handleGenreClick(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => handleGenreClick(null)}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
