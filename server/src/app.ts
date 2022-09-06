import express, {
  Application,
  Request,
  Response,
  NextFunction,
  json,
} from "express";
import { body, validationResult } from "express-validator";
import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import { randomBytes } from "crypto";

import db, {
  addRoom,
  roomExists,
  addUser,
  deleteUser,
  getUsers,
  getRandomUserFromRoom,
  addVideo,
  getVideos,
  getCurVideo,
  setPlaying,
  getOldestVideo,
  getRooms,
  setCurTime,
  setCurVideo,
} from "./database/db";
import { UserType, RoomId } from "./types";
import { getYTVideo } from "./youtube-data";

const app: Application = express();
app.use(json());
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.post("/addRoom", (req: Request, res: Response, next: NextFunction) => {
  const roomId = createRoomId();
  addRoom(roomId)
    .then(() => res.status(201).json({ roomId }))
    .catch((error) => next(error));
});

app.post(
  "/roomExists",
  body("roomId").isString(),
  (req: Request<{}, {}, RoomId>, res: Response, next: NextFunction) => {
    const { valid, errors } = checkValidBody(req);
    if (!valid) return res.status(400).json({ errors });

    const { roomId } = req.body;
    roomExists(roomId)
      .then((exists) => (exists ? res.sendStatus(204) : res.sendStatus(404)))
      .catch((error) => next(error));
  }
);

app.post(
  "/getUsers",
  body("roomId").isString(),
  (req: Request<{}, {}, RoomId>, res: Response, next: NextFunction) => {
    const { valid, errors } = checkValidBody(req);
    if (!valid) return res.status(400).json({ errors });

    const { roomId } = req.body;
    getUsers(roomId)
      .then((users) => res.json(users))
      .catch((error) => next(error));
  }
);

app.post(
  "/getVideos",
  body("roomId").isString(),
  (req: Request<{}, {}, RoomId>, res: Response, next: NextFunction) => {
    const { valid, errors } = checkValidBody(req);
    if (!valid) return res.status(400).json({ errors });

    const { roomId } = req.body;
    getVideos(roomId)
      .then((videos) => res.json(videos))
      .catch((error) => next(error));
  }
);

app.post(
  "/getCurVideo",
  body("roomId").isString(),
  (req: Request<{}, {}, RoomId>, res: Response, next: NextFunction) => {
    const { valid, errors } = checkValidBody(req);
    if (!valid) return res.status(400).json({ errors });

    const { roomId } = req.body;
    getCurVideo(roomId)
      .then((video) => {
        if (video !== null)
          res.json({
            curTime: video["curTime"],
            video: video["curVideo"],
          });
      })
      .catch((error) => next(error));
  }
);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

setInterval(() => {
  getRooms().then((rooms) => {
    rooms.forEach((room) => {
      getRandomUserFromRoom(room["_id"]).then((user) => {
        if (user !== null) io.to(user!["socketId"]!).emit("reqCurTime");
      });
    });
  });
}, 1000);

io.on("connection", (socket: Socket) => {
  const roomId = socket.handshake.query.roomId as string;
  let user = JSON.parse(socket.handshake.query.user as string) as UserType;
  if (!roomId || !user._id || !user.name) return;

  user.socketId = socket.id;
  addUserToRoom(socket, roomId, user);

  socket.on("disconnect", () => {
    removeUserFromRoom(socket, roomId, user);
  });

  socket.on("addVideo", (data: { url: string; user: UserType }) => {
    const { url, user } = data;
    addVideoToRoom(roomId, url, user);
  });

  socket.on("setCurTime", (data: { curTime: number; ended: boolean }) => {
    const { ended, curTime } = data;
    if (ended) getNextVideo(roomId);
    else setCurTime(roomId, curTime).catch((error) => console.log(error));
  });

  socket.on("changedTime", (data: { time: number; user: UserType }) => {
    const { time, user } = data;
    setCurTime(roomId, time)
      .then(() => {
        console.log(`${user.name} (${user._id}) set the time to ${time}`);
        io.sockets.in(roomId).emit("changedTime", { time: time, user: user });
      })
      .catch((error) => console.log(error));
  });

  socket.on("play", (data: { user: UserType }) => {
    const { user } = data;
    play(roomId, user);
  });

  socket.on("paused", (data: { user: UserType }) => {
    const { user } = data;
    pause(roomId, user);
  });

  socket.on("next", (data: { user: UserType }) => {
    const { user } = data;
    getNextVideo(roomId, user);
  });
});

httpServer.listen(3001, () => console.log("Server running on port 3001"));

function createRoomId(): string {
  return randomBytes(3).toString("hex");
}

function checkValidBody(req: Request) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return { valid: true, errors: {} };
  else return { valid: false, errors: errors.array() };
}

function addUserToRoom(socket: Socket, roomId: string, user: UserType) {
  addUser(roomId, user)
    .then((users) => {
      socket.join(roomId);
      io.to(roomId).emit("userJoined", users);
      console.log(`${user.name} (${user._id}) joined room ${roomId}`);
    })
    .catch((error) => {
      socket.disconnect();
      console.log(error);
    });
}

function removeUserFromRoom(socket: Socket, roomId: string, user: UserType) {
  deleteUser(roomId, socket.id)
    .then((users) => {
      io.to(roomId).emit("userDisconnected", users);
      console.log(`${user.name} (${user._id}) left room ${roomId}`);
    })
    .catch((error) => console.log(error));
}

function addVideoToRoom(roomId: string, url: string, user: UserType) {
  getYTVideo(url)
    .then((newVideo) => {
      hasCurVideo(roomId).then((curVideo) => {
        if (!curVideo) {
          setCurVideo(roomId, newVideo).then((video) => {
            console.log(`${user.name} (${user._id}) added and set a new video`);
            io.to(roomId).emit("newVideo", video);
          });
        } else {
          addVideo(roomId, newVideo).then((queue) => {
            console.log(
              `${user.name} (${user._id}) added a new video to the queue`
            );
            io.to(roomId).emit("updatedQueue", queue);
          });
        }
      });
    })
    .catch((error) => console.log(error));
}

function getNextVideo(roomId: string, user?: UserType) {
  getOldestVideo(roomId)
    .then((video) => {
      if (user) {
        console.log(`${user.name} (${user._id}) skipped to next video`);
      }
      setCurVideo(roomId, video).then((video) =>
        io.to(roomId).emit("newVideo", video)
      );

      getVideos(roomId).then((queue) =>
        io.to(roomId).emit("updatedQueue", queue)
      );
    })
    .catch((error) => console.log(error));
}

function hasCurVideo(roomId: string): Promise<boolean> {
  return getCurVideo(roomId)
    .then((video) => {
      if (
        video !== null &&
        (video["curVideo"] === null || video["curVideo"] === undefined)
      )
        return false;
      else return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
}

function play(roomId: string, user: UserType) {
  setPlaying(roomId, false)
    .then(() => {
      console.log(`${user.name} (${user._id}) set video to pause`);
      io.sockets.in(roomId).emit("paused", { user: user });
    })
    .catch((error) => console.log(error));
}

function pause(roomId: string, user: UserType) {
  setPlaying(roomId, false)
    .then(() => {
      console.log(`${user.name} (${user._id}) set video to pause`);
      io.sockets.in(roomId).emit("paused", { user: user });
    })
    .catch((error) => console.log(error));
}
