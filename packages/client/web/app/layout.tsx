import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
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
import { RetromClientProvider } from "@/providers/retrom-client";
import { QueryClientProvider } from "@/providers/query-client";
import { Suspense } from "react";
import { ConfigProvider } from "@/providers/config";

const exo2 = Exo_2({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Retrom",
  description: "A game library manager for web and desktop",
};

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const { children } = props;
  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", exo2.variable)}
      >
        <Suspense fallback={null}>
          <ConfigProvider>
            <RetromClientProvider>
              <QueryClientProvider>
                <div className="h-screen max-h-screen w-screen max-w-screen relative flex flex-col">
                  <Menubar />
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full w-full"
                  >
                    <ResizablePanel
                      defaultSize={25}
                      maxSize={40}
                      className="bg-muted"
                    >
                      <ScrollArea
                        className={cn(
                          "h-full max-h-full w-full max-w-full",
                          "bg-gradient-to-b from-primary/5 to-background",
                        )}
                      >
                        <SideBar />
                      </ScrollArea>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel defaultSize={75}>
                      <ScrollArea className="h-full max-h-full w-full max-w-full">
                        <main className="p-5 pb-16">{children}</main>
                      </ScrollArea>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
                <Toaster />
              </QueryClientProvider>
            </RetromClientProvider>
          </ConfigProvider>
        </Suspense>
      </body>
    </html>
  );
}
