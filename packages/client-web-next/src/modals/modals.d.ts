export type ModalActionCallback<T> = T extends (
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : (...args: Array<unknown>) => unknown;

export type BaseModalActionProps<TOpen = unknown, TClose = unkonwn> = {
  open?: boolean;
  title?: string;
  description?: string;
  onOpen?: ModalActionCallback<TOpen>;
  onClose?: ModalActionCallback<TClose>;
};

declare global {
  namespace RetromModals {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface ModalActions
      extends Record<unknown, BaseModalActionProps<unknown, unknown>> {}
  }
}
