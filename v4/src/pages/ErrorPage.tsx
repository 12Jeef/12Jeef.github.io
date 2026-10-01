import { Link } from "react-router-dom";
import Page from "../components/Page";

export type ErrorPageProps = {};

export default function ErrorPage({}: ErrorPageProps) {
  return (
    <Page innerClassName="max-w-[45rem] items-start">
      <h1 className="text-[5rem] text-a1 font-blob1">
        Hmm<span className="text-a1">.</span>
        <span className="text-a1a">.</span>
        <span className="text-a1aa">.</span>
      </h1>
      <p className="text-[1.25rem] text-fg2">
        Didn't expect you to end up here!
      </p>
      <p className="mt-8 text-[1.25rem] text-fg2">
        <Link to="/">Take me home!</Link>
      </p>
    </Page>
  );
}
