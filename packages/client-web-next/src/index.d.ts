import "react";

declare module "react" {
  export interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
