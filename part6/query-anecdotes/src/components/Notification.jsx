import React from "react";
import { useNotification } from "../NotificationContext";

const Notification = () => {
  const [notification] = useNotification();

  if (!notification) return null;

  return (
    <div style={{ border: "1px solid black", padding: 10, margin: 10 }}>
      {notification}
    </div>
  );
};

export default Notification;
