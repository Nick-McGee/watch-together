import { Schema, model } from "mongoose";

import { videoSchema } from "./Video";
import { RoomType } from "../types";

const roomSchema = new Schema<RoomType>({
  _id: { type: String, required: true },
  curVideo: { type: videoSchema, required: false },
  curTime: { type: Number, required: false, default: 0 },
  playing: { type: Boolean, required: false, default: true },
  expiry: { type: Date, expires: "60m", default: Date.now },
});

export default model<RoomType>("Room", roomSchema);
