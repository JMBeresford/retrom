export type ModalActionCallback<T> = T extends (
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : (...args: unknown[]) => unknown;

export type BaseModalActionProps<Open = unknown, Close = unkonwn> = {
  open?: boolean;
  title?: string;
  description?: string;
  onOpen?: ModalActionCallback<Open>;
  onClose?: ModalActionCallback<Close>;
};

declare global {
  namespace RetromModals {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface ModalActions
      extends Record<unknown, BaseModalActionProps<unknown, unknown>> {}
  }
}
