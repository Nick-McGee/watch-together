import { useState, useEffect } from "react";

import { useRoom } from "../contexts/RoomContext";

type User = {
  _id: string;
  name: string;
};

const UsersList = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);
  const { socket } = useRoom();

  useEffect((): (() => void) => {
    if (socket === undefined) {
      return () => {};
    }

    socket.on("userJoined", (users) => {
      console.log(users);
      setUsers(users);
    });

    return () => socket.off("userJoined");
  }, [socket]);

  useEffect((): (() => void) => {
    if (socket === undefined) {
      return () => {};
    }

    socket.on("userDisconnected", (users) => {
      setUsers(users);
    });

    return () => socket.off("userDisconnected");
  }, [socket]);

  return (
    <div>
      <p>Users List</p>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
