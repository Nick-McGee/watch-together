import {
  ReactNode,
  useContext,
  createContext,
  useState,
  useEffect,
} from "react";
import io, { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import useLocalStorage from "../hooks/useLocalStorage";

type RoomContextObj = {
  socket: Socket | undefined;
  users: {
    [roomId: string]: { name: string; _id: string };
  };
  setUsers: (newUsername: string) => void;
};

export const RoomContext = createContext<RoomContextObj>({
  socket: undefined,
  users: {},
  setUsers: (newUsername: string) => {},
});

export const useRoom = () => useContext(RoomContext);

const RoomContextProvider = ({
  roomId,
  children,
}: {
  roomId: string;
  children?: ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | undefined>();
  const [users, setUsers] = useLocalStorage("users", {});

  const setUsersHandler = (newUsername: string): void => {
    setUsers((prevUsernames: object) => {
      return {
        ...prevUsernames,
        [roomId]: { name: newUsername, _id: uuidv4() },
      };
    });
  };

  useEffect((): (() => void) => {
    if (users[roomId] !== undefined) {
      const newSocket = io("http://localhost:3001", {
        query: {
          roomId,
          user: JSON.stringify(users[roomId]),
        },
      });
      setSocket(newSocket);
      console.log("Connected to socket.");

      return () => {
        newSocket.close();
      };
    } else {
      console.log("roomId and username needed to connect to socket");
      return () => {};
    }
  }, [users, roomId]);

  const contextValue: RoomContextObj = {
    socket: socket,
    users: users,
    setUsers: setUsersHandler,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};

export default RoomContextProvider;
