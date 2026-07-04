import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import TanStackQueryDevtools from "../devtools/tanstack-query";
import TanStackRouterDevtools from "../devtools/tanstack-router";
import appCss from "../globals.css?url";
import type { MyRouterContext } from "@/router-context";
import { ThemeProvider } from "@/themes/theme-provider";

export const Route = createRootRouteWithContext<MyRouterContext>()({
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[TanStackRouterDevtools, TanStackQueryDevtools]}
        />
        <Scripts />
      </body>
    </html>
  );
}
