// RUN: sudo mongod --dbpath ~/data/db
import { connect } from "mongoose";

import Room from "./Room";
import User from "./User";
import Video from "./Video";
import { UserType, VideoType } from "../types";

const db = connect("mongodb://localhost/testdb", () =>
  console.log("Connected to MongoDB")
);

setInterval(() => {
  getExpiredRooms().then((rooms) => {
    rooms.forEach((room) => {
      console.log(`Deleting room ${room["_id"]}`);
      deleteExpiredRoomData(room["_id"]);
    });
  });
}, 60 * 1000);

export const addRoom = async (roomId: string) => {
  return await Room.create({ _id: roomId });
};

export const roomExists = async (roomId: string) => {
  return await Room.exists({ _id: roomId }).lean();
};

export const getRooms = async () => {
  return await Room.find().select("_id").lean();
};

const getExpiredRooms = async () => {
  return await Room.find({ expireAt: { $lt: Date.now() } })
    .select("_id")
    .lean();
};

const deleteExpiredRoomData = async (roomId: string) => {
  await Room.deleteMany({ _id: roomId });
  await User.deleteMany({ roomId: roomId });
  await Video.deleteMany({ roomId: roomId });
};

export const getUsers = async (roomId: string) => {
  return await User.find({ roomId: roomId }).lean();
};

export const getRandomUserFromRoom = async (roomId: string) => {
  return await User.findOne({ roomId: roomId }).lean();
};

export const addUser = async (roomId: string, user: UserType) => {
  // Look at this error handling later
  try {
    await User.create({
      _id: user._id,
      name: user.name,
      socketId: user.socketId,
      roomId: roomId,
    });
  } catch (error) {
    console.log(error);
  }
  await updateExpireAt(roomId);
  return await getUsers(roomId);
};

export const deleteUser = async (roomId: string, socketId: string) => {
  await User.deleteOne({ socketId: socketId });
  return await getUsers(roomId);
};

export const getVideos = async (roomId: string) => {
  return await Video.find({ roomId: roomId }).sort({ date: "asc" }).lean();
};

export const addVideo = async (roomId: string, video: VideoType) => {
  await Video.create({
    url: video.url,
    title: video.title,
    thumbnail: video.thumbnail,
    length: video.length,
    date: Date.now(),
    roomId: roomId,
  });
  await updateExpireAt(roomId);
  return await getVideos(roomId);
};

export const getCurVideo = async (roomId: string) => {
  return await Room.findOne({ _id: roomId })
    .select("curVideo curTime paused -_id")
    .lean();
};

export const setCurVideo = async (roomId: string, video: VideoType | null) => {
  await updateExpireAt(roomId);
  return await Room.findOneAndUpdate(
    { _id: roomId },
    { curVideo: video, curTime: 0, paused: false },
    { new: true }
  )
    .select("curVideo curTime paused -_id")
    .lean();
};

export const getOldestVideo = async (roomId: string) => {
  return await Video.findOneAndDelete({ roomId: roomId })
    .sort({ date: "asc" })
    .lean();
};

export const setCurTime = async (roomId: string, time: number) => {
  await Room.findOneAndUpdate({ _id: roomId }, { curTime: time });
  await updateExpireAt(roomId);
};

export const setPlaying = async (roomId: string, playing: boolean) => {
  await Room.findOneAndUpdate({ _id: roomId }, { playing: playing });
  await updateExpireAt(roomId);
};

const updateExpireAt = async (roomId: string) => {
  await Room.findOneAndUpdate(
    { _id: roomId },
    { expireAt: Date.now() + 30 * 60 * 1000 }
  );
};

export default db;
