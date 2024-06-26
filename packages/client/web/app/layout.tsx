import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { cn } from "@/lib/utils";
import { SideBar } from "./side-bar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/toaster";
import { Menubar } from "@/components/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RetromClientProvider } from "@/providers/retrom-client/";
import { QueryClientProvider } from "@/providers/query-client";
import { Suspense } from "react";
import { IS_DESKTOP } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const retromClient = IS_DESKTOP
    ? undefined
    : await import("@/providers/retrom-client/web").then(
        (mod) => mod.RetromWebClient,
      );

  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", inter.variable)}
      >
        <Suspense fallback={null}>
          <RetromClientProvider value={retromClient}>
            <QueryClientProvider>
              <div className="h-screen max-h-screen relative flex flex-col">
                <Menubar />
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel
                    defaultSize={25}
                    maxSize={40}
                    className="bg-muted"
                  >
                    <SideBar />
                  </ResizablePanel>

                  <ResizableHandle />

                  <ResizablePanel defaultSize={75}>
                    <ScrollArea className="h-full max-h-full">
                      <main className="pb-16">{children}</main>
                    </ScrollArea>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
              <Toaster />
            </QueryClientProvider>
          </RetromClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
