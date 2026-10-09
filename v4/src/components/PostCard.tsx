import { Link } from "react-router-dom";
import type { FullPost } from "../features/post";

export type PostCardProps = { post: FullPost };

export default function PostCard({ post }: PostCardProps) {
  const {
    name,
    title,
    date: [y, m, d],
  } = post;
  return (
    <div>
      <Link
        to={name}
        className="w-full py-1 my-2 flex flex-row items-center justify-start group"
      >
        <h2 className="flex-1 text-fg1 text-xl font-bold group-hover:text-a1 transition-colors duration-300">
          {title}
        </h2>
        <p className="text-fg2 text-sm font-light group-hover:text-a1 transition-colors duration-300">
          {y}{" "}
          {
            [
              "JAN",
              "FEB",
              "MAR",
              "APR",
              "MAY",
              "JUN",
              "JUL",
              "AUG",
              "SEP",
              "OCT",
              "NOV",
              "DEC",
            ][m - 1]
          }{" "}
          {d}
        </p>
      </Link>
    </div>
  );
}
