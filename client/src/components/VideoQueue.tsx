import { useEffect, useState } from "react";

import { useRoom } from "../contexts/RoomContext";

type Video = {
  _id: number;
  url: string;
  title: string;
  thumbnail: string;
  length: number;
  date?: Date;
};

const VideoQueue = ({ roomId }: { roomId: string }): JSX.Element => {
  const [videoQueue, setVideoQueue] = useState<Video[]>([]);
  const { socket } = useRoom();

  useEffect(() => {
    if (socket !== undefined) {
      getVideoQueue(roomId).then((videos) => {
        setVideoQueue(videos);
      });
    }
  }, [socket, roomId]);

  useEffect((): (() => void) => {
    if (socket === undefined) {
      return () => {};
    }

    socket.on("updatedQueue", (queue: Video[]) => {
      setVideoQueue(queue);
    });

    return () => socket.off("updatedQueue");
  }, [socket]);

  return (
    <>
      <p>Video Queue</p>
      <ul>
        {videoQueue.map((video) => (
          <li key={video._id}>
            <h3>{video.title}</h3>
            <p>{video.length} seconds</p>
            <img src={video.thumbnail} alt={video.title} width="250px" />
          </li>
        ))}
      </ul>
    </>
  );
};

function getVideoQueue(roomId: string | undefined): Promise<Video[]> {
  return fetch("http://localhost:3001/getVideos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  })
    .then((response) => response.json())
    .then((videos) => {
      return videos;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

export default VideoQueue;
