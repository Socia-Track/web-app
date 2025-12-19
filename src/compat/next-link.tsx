import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import React from "react";

// Minimal Next.js Link compatibility wrapper
// Supports: href, className, onClick, children, passHref (ignored)
export interface NextLinkProps extends Omit<RouterLinkProps, "to"> {
  href: RouterLinkProps["to"];
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  prefetch?: boolean; // ignored
  replace?: boolean;
  shallow?: boolean; // ignored
  scroll?: boolean; // ignored
}

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, children, className, onClick, replace, ...rest },
  ref
) {
  return (
    <RouterLink to={href as any} className={className} onClick={onClick} replace={replace} ref={ref as any} {...rest}>
      {children}
    </RouterLink>
  );
});

export default Link;
