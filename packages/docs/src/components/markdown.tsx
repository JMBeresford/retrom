import { cn } from "@retrom/ui/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import ReactMarkdown from "react-markdown";
import { Children } from "react";
import { Link } from "@tanstack/react-router";
import { ScrollArea, ScrollBar } from "@retrom/ui/components/scroll-area";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkToc, remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeGithubAlerts]}
      className="markdown-root w-max"
      components={{
        blockquote: ({ className, ...props }) => (
          <blockquote
            {...props}
            className={cn(
              className,
              "border-l-4 border-muted-foreground/50 pl-4 italic text-muted-foreground",
            )}
          />
        ),
        a: ({ className, children, href, ...props }) => {
          let parsedHref: URL | undefined;
          try {
            parsedHref = new URL(href ?? "", window.location.href);
          } catch {
            parsedHref = undefined;
          }

          const isRelative =
            parsedHref !== undefined &&
            parsedHref.origin === window.location.origin;

          console.log({ href, isRelative, parsedHref });

          const LinkImpl = isRelative ? Link : "a";

          return (
            <LinkImpl
              {...props}
              to={isRelative ? parsedHref?.pathname.toLowerCase() : undefined}
              href={isRelative ? undefined : href}
              hash={isRelative ? parsedHref?.hash.replace("#", "") : undefined}
              className={cn(
                className,
                "text-accent-text inline-flex items-center gap-1",
              )}
              target={isRelative ? undefined : "_blank"}
            >
              {children}
              <ExternalLinkIcon
                className={cn("inline size-4", isRelative && "hidden")}
              />
            </LinkImpl>
          );
        },
        code: ({ node, className, children, ref: _, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const numLines =
            (node?.position?.end.line ?? 0) - (node?.position?.start.line ?? 0);
          const inline =
            node?.position?.start.line === node?.position?.end.line;

          if (inline && !match) {
            return (
              <code
                {...props}
                className={cn(
                  className,
                  "bg-secondary px-1 py-0.5 rounded-sm whitespace-nowrap",
                )}
              >
                {children}
              </code>
            );
          }

          const childrenArray = Children.toArray(children)
            .filter((c) => typeof c !== "object")
            .map((c) => c.toString().trim());

          const allProps = { ...props, children: childrenArray };
          const language = match ? match[1] : undefined;

          return (
            <ScrollArea className="bg-muted rounded-lg w-full *:pr-4">
              <SyntaxHighlighter
                {...allProps}
                wrapLines={true}
                showLineNumbers={numLines > 2 && language !== "text"}
                style={theme}
                className={cn(className, "rounded-lg")}
                customStyle={{ background: "none" }}
                language={language}
              />

              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
