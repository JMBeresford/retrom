import { PropsWithChildren, ReactNode } from "react";

export function checkIsDesktop() {
  return (
    import.meta.env.IS_DESKTOP !== undefined ||
    import.meta.env.VITE_IS_DESKTOP !== undefined
  );
}

export function DesktopOnly(props: PropsWithChildren) {
  return checkIsDesktop() ? <> {props.children} </> : <></>;
}

export function WebOnly(props: PropsWithChildren) {
  return !checkIsDesktop() ? <> {props.children} </> : <></>;
}

export function PlatformDependent(props: {
  desktop?: ReactNode;
  web?: ReactNode;
}) {
  return <> {checkIsDesktop() ? props.desktop : props.web} </>;
}
