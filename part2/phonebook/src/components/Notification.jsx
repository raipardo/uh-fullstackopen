
const Notification = ({ message, type }) => {
  if (!message) return null

  const notificationStyle = {
    color: type === 'error' ? 'red' : 'green',
    background: '#ddd',
    fontSize: 20,
    border: `3px solid ${type === 'error' ? 'red' : 'green'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

export default Notification
