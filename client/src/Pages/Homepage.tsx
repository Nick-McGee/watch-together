import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createRoomHandler = () => {
    setIsLoading(true);

    fetch("http://localhost:3001/addRoom", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        navigate(`/${data.roomId}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  return (
    <>
      {isLoading && <p>Loading...</p>}
      <h1>Homepage</h1>
      <h2>About</h2>
      <button onClick={createRoomHandler}>Create Room</button>
    </>
  );
};

export default Homepage;
