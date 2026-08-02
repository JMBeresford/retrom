export type FilePathProps = {
  children: string;
  separator?: string;
};

export function FilePath({ children, separator = "/" }: FilePathProps) {
  const parts = children.toString().split(separator);

  return (
    <pre className="font-mono">
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 && (
            <span className="text-muted-foreground px-px">{separator}</span>
          )}
          <span className="text-foreground">{part}</span>
        </span>
      ))}
    </pre>
  );
}
