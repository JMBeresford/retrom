export type BaseModalActionProps = {
  title?: string;
  description?: React.ReactNode;
};

declare global {
  namespace RetromModals {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface ModalActions
      extends Record<unknown, BaseModalActionProps> {}
  }
}
