import { Link } from "react-router-dom";
import Page from "../components/Page";
import Title from "../components/Title";

export type ErrorPageProps = {};

export default function ErrorPage({}: ErrorPageProps) {
  return (
    <Page>
      <div>
        <Title title="HMM" fontOrder={[2, 1]} bgFontOrder={[1, 2]} />
        <p className="text-[1.25rem] text-fg2">
          Didn't expect you to end up here!
        </p>
        <p className="mt-8 text-[1.25rem] text-fg2">
          <Link to="/">Take me home!</Link>
        </p>
      </div>
    </Page>
  );
}
