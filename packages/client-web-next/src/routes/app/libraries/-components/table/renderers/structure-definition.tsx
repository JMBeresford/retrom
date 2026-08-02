export function RenderStructureDefinition({ children }: { children: string }) {
  const parts = children.split("/");

  return (
    <span className="font-mono">
      {parts.map((part, index) => (
        <span key={part + index.toString()}>
          {index > 0 && <span className="text-muted-foreground px-px">/</span>}
          {part.startsWith("{") && part.endsWith("}") ? (
            <RenderMacro>{part}</RenderMacro>
          ) : (
            <span className="text-muted-foreground">{part}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export function RenderMacro({ children }: { children: string }) {
  return <span className="">{children.replace("{", "").replace("}", "")}</span>;
}
