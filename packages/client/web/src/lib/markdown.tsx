import { useMemo } from "react";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

export function useRehypeRemark(text?: string) {
  const markdown = useMemo(
    () =>
      unified()
        .use(rehypeParse)
        .use(rehypeRemark)
        .use(remarkStringify)
        .processSync(text),
    [text],
  );

  return text ? markdown.toString() : undefined;
}
