import React, { useRef, useState, useEffect } from "react";

import ReactPlayer from "react-player";

import { useRoom } from "../contexts/RoomContext";

const VideoPlayer = ({ roomId }: { roomId: string }): JSX.Element => {
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(
    undefined
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [playing, setPlaying] = useState<boolean>(true);
  const [ended, setEnded] = useState<boolean>(false);
  const [seeking, setSeeking] = useState<boolean>(false);

  const playerRef = useRef<ReactPlayer>(null);
  const { users, socket } = useRoom();

  useEffect(() => {
    if (socket !== undefined) {
      getCurVideo(roomId).then((video) => {
        console.log(video);
        setCurrentTime(video["curTime"]);
        setCurrentVideo(video["video"]["url"]);
        setDuration(video["video"]["length"]);
      });
    }
  }, [socket, roomId]);

  useEffect((): (() => void) => {
    if (socket === undefined) {
      return () => {};
    }

    socket.on("play", () => setPlaying(true));
    socket.on("paused", () => setPlaying(false));
    socket.on("changedTime", (data) => {
      setCurrentTime(data.time);
      playerRef.current?.seekTo(data.time, "seconds");
    });
    socket.on("reqCurTime", () => {
      socket.emit("setCurTime", { curTime: currentTime, ended: ended });
      console.log("Req");
    });
    socket.on("newVideo", (data) => {
      setEnded(false);
      setCurrentTime(0);
      if (data.curVideo) {
        setCurrentVideo(undefined);
        setTimeout(() => setCurrentVideo(data.curVideo["url"]), 100);
        setDuration(data.curVideo["length"]);
      } else {
        setCurrentVideo(undefined);
        setDuration(0);
      }
    });

    return () => {
      socket.off("play");
      socket.off("paused");
      socket.off("changedTime");
      socket.off("reqCurTime");
      socket.off("newVideo");
    };
  }, [socket, currentTime, ended]);

  const handleProgress = (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    if (!seeking) {
      setCurrentTime(progress.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(true);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    console.log(event.currentTarget.value);
    socket?.emit("changedTime", {
      time: event.currentTarget.value,
      user: users[roomId],
    });
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.currentTarget.value);
    setCurrentTime(time);
  };

  const handlePause = () => {
    socket?.emit("paused", {
      user: users[roomId],
    });
  };

  const handlePlay = () => {
    socket?.emit("play", {
      user: users[roomId],
    });
  };

  const handleEnded = () => {
    console.log("ended");
    setEnded(true);
  };

  const handleNext = () => {
    socket?.emit("next", {
      user: users[roomId],
    });
  };

  return (
    <>
      <ReactPlayer
        ref={playerRef}
        url={currentVideo}
        playing={playing}
        volume={0}
        controls={false}
        onPause={handlePause}
        onPlay={handlePlay}
        onProgress={handleProgress}
        progressInterval={100}
        onDuration={handleDuration}
        onEnded={handleEnded}
        onReady={() => playerRef.current?.seekTo(currentTime, "seconds")}
        config={{
          youtube: {
            playerVars: { showinfo: 0, disablekb: 1, modestbranding: 1 },
          },
        }}
      />

      <button
        onClick={() => {
          setPlaying(!playing);
        }}>
        {playing ? "Pause" : "Play"}
      </button>

      <button onClick={handleNext}>Next</button>

      <label htmlFor="progress">progress</label>
      <input
        type="range"
        min="1"
        max={duration}
        value={currentTime}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onChange={handleSeek}
        defaultValue={0}
        id="progress"
      />

      <p>Video duration: {duration}</p>
      <p>Current time: {currentTime}</p>
    </>
  );
};

function getCurVideo(roomId: string | undefined): Promise<any> {
  return fetch("http://localhost:3001/getCurVideo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId }),
  })
    .then((response) => response.json())
    .then((video) => {
      return video;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

export default VideoPlayer;
