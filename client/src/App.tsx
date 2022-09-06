import { Route, Routes } from "react-router-dom";

import Homepage from "./Pages/Homepage";
import Room from "./Pages/Room";
import RoomExists from "./components/RoomExists";
import NotFound from "./Pages/NotFound";

const App = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route
        path="/:roomId"
        element={
          <RoomExists>
            <Room />
          </RoomExists>
        }
      />
      <Route path="/404" element={<NotFound />} />
    </Routes>
  );
};

export default App;
