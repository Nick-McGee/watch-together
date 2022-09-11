import { Schema, model } from "mongoose";

import { videoSchema } from "./Video";
import { RoomType } from "../types";

const roomSchema = new Schema<RoomType>({
  _id: { type: String, required: true },
  curVideo: { type: videoSchema, required: false },
  curTime: { type: Number, required: false, default: 0 },
  playing: { type: Boolean, required: false, default: true },
  expireAt: {
    type: Date,
    default: () => Date.now() + 30 * 60 * 1000,
  },
});

export default model<RoomType>("Room", roomSchema);
