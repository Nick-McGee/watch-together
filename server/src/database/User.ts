import { Schema, model } from "mongoose";

import { UserType } from "../types";

const userSchema = new Schema<UserType>({
  _id: { type: String, required: true },
  socketId: { type: String, unique: true, required: true },
  roomId: { type: String, required: true },
  name: { type: String, required: true },
});

export default model<UserType>("User", userSchema);
