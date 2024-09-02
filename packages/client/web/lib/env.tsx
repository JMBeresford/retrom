"use client";

import { PropsWithChildren, ReactNode } from "react";

const IS_DESKTOP =
  typeof window !== "undefined"
    ? "__TAURI__" in window || "__TAURI_INTERNALS__" in window
    : undefined;

export function isDesktop() {
  return IS_DESKTOP;
}

export function DesktopOnly(props: PropsWithChildren) {
  return IS_DESKTOP ? props.children : null;
}

export function WebOnly(props: PropsWithChildren) {
  return IS_DESKTOP ? null : props.children;
}

export function PlatformDependent(props: {
  desktop?: ReactNode;
  web?: ReactNode;
}) {
  return IS_DESKTOP ? props.desktop : props.web;
}
