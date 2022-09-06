import { useRef } from "react";

import { useRoom } from "../contexts/RoomContext";

const AddVideo = (): JSX.Element => {
  const urlRef = useRef<HTMLInputElement | null>(null);
  const { socket } = useRoom();

  const addVideoHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(urlRef.current!.value);
    socket?.emit("addVideo", {
      url: urlRef.current!.value,
    });
    urlRef.current!.value = "";
  };

  return (
    <form onSubmit={addVideoHandler}>
      <label htmlFor="URL">URL</label>
      <input type="text" id="URL" ref={urlRef} />
      <button type="submit">Add to Queue</button>
    </form>
  );
};

export default AddVideo;
