const Notification = ({ message, type }) => {
  if (!message) return null;

  const style = {
    color: type === "error" ? "red" : "green",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderColor: type === "error" ? "red" : "green",
  };

  return <div style={style}>{message}</div>;
};

export default Notification;
