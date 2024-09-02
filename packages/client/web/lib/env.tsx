"use client";

import { PropsWithChildren, ReactNode } from "react";

export function checkIsDesktop() {
  return (
    process.env.IS_DESKTOP !== undefined ||
    process.env.NEXT_PUBLIC_IS_DESKTOP !== undefined
  );
}

export function DesktopOnly(props: PropsWithChildren) {
  return checkIsDesktop() ? props.children : <></>;
}

export function WebOnly(props: PropsWithChildren) {
  return !checkIsDesktop() ? props.children : <></>;
}

export function PlatformDependent(props: {
  desktop?: ReactNode;
  web?: ReactNode;
}) {
  return checkIsDesktop() ? props.desktop : props.web;
}
