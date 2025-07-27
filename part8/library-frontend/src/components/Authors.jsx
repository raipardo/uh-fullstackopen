import { useQuery } from "@apollo/client";
import { ALL_AUTHORS } from "../queries";

const Authors = ({ show }) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);

  if (!show) return null;
  if (loading) return <div>Loading authors...</div>;
  if (error) return <div>Error fetching authors: {error.message}</div>;

  const authors = data?.allAuthors || [];

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born || "N/A"}</td>
              <td>{a.bookCount ?? "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
