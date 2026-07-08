import { configStore, context } from "./store";
import type { PropsWithChildren } from "react";

export function ConfigProvider(props: PropsWithChildren) {
  const { children } = props;

  return <context.Provider value={configStore}>{children}</context.Provider>;
}
