import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = () => {
  const { loading: loadingUser, data: userData } = useQuery(ME);
  const { loading: loadingBooks, data: booksData } = useQuery(ALL_BOOKS);

  if (loadingUser || loadingBooks) return <div>loading...</div>;
  if (!userData?.me) return <div>Login required</div>;

  const favoriteGenre = userData.me.favoriteGenre;
  const books = booksData.allBooks.filter((b) =>
    b.genres.includes(favoriteGenre)
  );

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
