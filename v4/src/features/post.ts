import { type FC } from "react";
import type { UsedPostProps } from "../components/Post";

export type FullPost = {
  name: string;
  title: string;
  date: [number, number, number]; // Y M D
  post: FC<UsedPostProps>;
};
