import { Message } from "@bufbuild/protobuf";
import { Prettify } from "./typescript";

export type RawMessage<T> =
  T extends Message<infer M>
    ? Prettify<
        Omit<
          {
            [K in keyof T]: NonNullable<T[K]> extends Message
              ? RawMessage<NonNullable<T[K]>>
              : NonNullable<T[K]> extends Message[]
                ? RawMessage<NonNullable<T[K]>[number]>[]
                : T[K];
          },
          keyof Message<M>
        >
      >
    : never;
