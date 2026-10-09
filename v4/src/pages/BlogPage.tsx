import { useNavigate, useParams } from "react-router-dom";
import Page from "../components/Page";
import type { FullPost } from "../features/post";
import OnWriting from "../components/posts/OnWriting";
import PostCard from "../components/PostCard";
import { useEffect } from "react";
import Background from "../components/Background";

export type BlogPageProps = {};

export default function BlogPage({}: BlogPageProps) {
  const { postName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (postName == null) return;
    for (const post of posts) if (post.name === postName) return;
    navigate("/blog");
  }, [postName]);

  const post = posts.find((post) => post.name === postName);

  return (
    <Page>
      <Background
        background="var(--color-mg)"
        logo={false}
        className="opacity-20"
      />
      <div className="max-w-[40rem] w-full flex flex-col items-stretch justify-start gap-2">
        {postName == null &&
          posts.map((post, i) => <PostCard key={i} post={post} />)}
        {post && <post.post post={post} />}
      </div>
    </Page>
  );
}

const posts: FullPost[] = [OnWriting];
