import { Link } from "react-router-dom";
import type { JiggleButtonProps } from "./JiggleButton";
import JiggleButton from "./JiggleButton";

export type JiggleButtonLinkProps = {
  to?: string;
  href?: string;
} & JiggleButtonProps;

export default function JiggleButtonLink({
  to,
  href,
  ...props
}: JiggleButtonLinkProps) {
  return (
    <>
      {to && (
        <Link to={to}>
          <JiggleButton {...props} />
        </Link>
      )}
      {typeof href === "string" && (
        <a href={href}>
          <JiggleButton {...props} />
        </a>
      )}
    </>
  );
}
