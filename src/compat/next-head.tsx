import { Helmet } from "react-helmet-async";
import React from "react";

export interface HeadProps { children?: React.ReactNode }

export default function Head({ children }: HeadProps) {
  return <Helmet>{children}</Helmet>;
}
