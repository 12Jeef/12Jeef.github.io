import type { FullPost } from "../features/post";

export type PostProps = { post: FullPost; children?: any };

export type UsedPostProps = Omit<PostProps, "children">;

export default function Post({ post, children }: PostProps) {
  const {
    title,
    date: [y, m, d],
  } = post;
  return (
    <div className="w-full py-64">
      <h1 className="w-full mb-16 flex flex-row items-end justify-start">
        <span
          className="flex-1 text-a1 text-5xl font-blob1"
          style={{ filter: "drop-shadow(0 0 2.5rem var(--color-a1a))" }}
        >
          {title}
        </span>
        <span className="text-fg2 text-sm font-light">
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
        </span>
      </h1>
      <div className="w-full flex flex-col items-stretch justify-stretch gap-4 text-fg2 text-base">
        {children}
        <svg
          className="self-end w-[25px] h-[12.5px] mt-16 mr-0.5"
          viewBox="0 0 50 25"
        >
          <polyline
            className="fill-none stroke-2 stroke-a1"
            points="1,24 1,1 13,12 25,1 37,12 49,1 49,24"
          />
        </svg>
        <p className="-mt-4 text-a1 text-sm font-light tracking-widest italic text-right select-none">
          —jeef
        </p>
      </div>
    </div>
  );
}
