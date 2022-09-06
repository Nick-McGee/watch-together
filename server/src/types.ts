import { Types } from "mongoose";

export interface ResponseError extends Error {
  status?: number;
}

export type RoomId = {
  roomId: string;
};

export type UserType = {
  _id: string;
  name: string;
  socketId?: string;
  roomId?: string;
};

export type VideoType = {
  url: string;
  title: string;
  thumbnail: string;
  length: number;
  date?: Date;
  roomId?: string;
};

export type RoomType = {
  _id: string;
  curVideo?: VideoType;
  curTime?: number;
  playing?: boolean;
  expiry?: Date;
};
