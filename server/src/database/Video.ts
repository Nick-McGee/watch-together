import { Schema, model } from "mongoose";
import { VideoType } from "../types";

export const videoSchema = new Schema<VideoType>({
  url: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  length: { type: Number, required: true },
  date: { type: Date, required: true, defualt: Date.now() },
  roomId: { type: String, required: true },
});

export default model<VideoType>("Video", videoSchema);
