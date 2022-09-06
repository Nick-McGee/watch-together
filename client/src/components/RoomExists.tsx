import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const RoomExists = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [roomExists, setRoomExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { roomId } = useParams();

  useEffect(() => {
    checkRoomExists(roomId)
      .then((exists) => {
        if (exists) {
          setIsLoading(false);
          setRoomExists(true);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [roomId]);

  const elements = isLoading ? (
    <p>"Loading"</p>
  ) : roomExists ? (
    children
  ) : (
    <Navigate to="/404" replace />
  );
  return elements;
};

// Check the server
function checkRoomExists(roomId: string | undefined): Promise<boolean> {
  return fetch("http://localhost:3001/roomExists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  })
    .then((response) => {
      return response.ok;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

export default RoomExists;
