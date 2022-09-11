import { useParams } from "react-router-dom";

import AddVideo from "../components/AddVideo";
import UsernameCheck from "../components/UsernameCheck";
import UsersList from "../components/UsersList";
import VideoPlayer from "../components/VideoPlayer";
import VideoQueue from "../components/VideoQueue";

import RoomContextProvider from "../contexts/RoomContext";

const Room = (): JSX.Element => {
  const { roomId } = useParams();

  return (
    <RoomContextProvider roomId={roomId!}>
      <h1>Room</h1>
      <UsernameCheck roomId={roomId!} />
      <p>{roomId}</p>
      <VideoPlayer roomId={roomId!} />
      <AddVideo roomId={roomId!} />
      <VideoQueue roomId={roomId!} />
      <UsersList />
    </RoomContextProvider>
  );
};

export default Room;
