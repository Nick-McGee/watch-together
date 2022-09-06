import youtubedl from "youtube-dl-exec";

import { VideoType } from "./types";

export const getYTVideo = async (url: string): Promise<VideoType> => {
  try {
    const info = await youtubedl(url, { dumpSingleJson: true });
    if (!info.duration) {
      throw new Error("Unable to add song");
    }
    return {
      url: url,
      title: info.fulltitle,
      length: info.duration,
      thumbnail: info.thumbnail,
    };
  } catch (err) {
    throw new Error("Unable to add song");
  }
};
