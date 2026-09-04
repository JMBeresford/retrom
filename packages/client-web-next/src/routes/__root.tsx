import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { SidebarProvider } from "@retrom/ui-next/components/sidebar";
import TanStackQueryDevtools from "../devtools/tanstack-query";
import TanStackRouterDevtools from "../devtools/tanstack-router";
import TanStackFormDevtools from "../devtools/tanstack-form";
import appCss from "../globals.css?url";
import type { PropsWithChildren, ReactNode } from "react";
import type { RouterContext } from "@/router";
import { ModalActionProvider } from "@/modals/provider";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Retrom Web Next",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

const providers = [SidebarProvider, ModalActionProvider];

function RenderRootProviders({ children }: PropsWithChildren) {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />

      <RenderRootProviders>{children}</RenderRootProviders>

      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          TanStackRouterDevtools,
          TanStackQueryDevtools,
          TanStackFormDevtools,
        ]}
      />
      <Scripts />
    </>
  );
}
