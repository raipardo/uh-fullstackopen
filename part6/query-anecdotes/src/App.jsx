import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnecdotes, createAnecdote, voteAnecdote } from "./requests";
import Notification from "./components/Notification";
import { useNotification } from "./NotificationContext";
import { useState } from "react";

const App = () => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [, dispatch] = useNotification();

  const notify = (message) => {
    dispatch({ type: "SET", payload: message });
    setTimeout(() => {
      dispatch({ type: "CLEAR" });
    }, 5000);
  };

  const result = useQuery({
    queryKey: ["anecdotes"],
    queryFn: getAnecdotes,
    retry: 1,
  });

  const createAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anecdotes"] });
    },
    onError: (error) => {
      // This works if your backend responds with a useful error message
      const errorMessage =
        error?.response?.data?.error || "Failed to create anecdote";
      notify(errorMessage);
    },
  });

  const voteAnecdoteMutation = useMutation({
    mutationFn: voteAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anecdotes"] });
    },
  });

  const handleVote = (anecdote) => {
    voteAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 });
    notify(`anecdote '${anecdote.content}' voted`);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createAnecdoteMutation.mutate({ content, votes: 0 });
    notify(`Anecdote '${content}' created`);
    setContent("");
  };

  if (result.isLoading) {
    return <div>loading data...</div>;
  }

  if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>;
  }

  const anecdotes = result.data;

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />

      <form onSubmit={handleCreate}>
        <input value={content} onChange={(e) => setContent(e.target.value)} />
        <button type="submit">create</button>
      </form>

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
