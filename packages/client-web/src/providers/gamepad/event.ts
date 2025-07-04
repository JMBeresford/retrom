declare global {
  interface GlobalEventHandlersEventMap {
    [GAMEPAD_BUTTON_EVENT]: GamepadButtonEvent;
  }

  interface ElementEventMap {
    [GAMEPAD_BUTTON_EVENT]: GamepadButtonEvent;
  }
}

export const GAMEPAD_BUTTON_EVENT = "gamepad-button";

export type GamepadButtonEventDetail = {
  gamepad: Gamepad;

  /* The button that triggered the event */
  button: number;
};

export class GamepadButtonEvent extends CustomEvent<GamepadButtonEventDetail> {
  constructor(
    detail: GamepadButtonEventDetail,
    opts: CustomEventInit = {
      bubbles: true,
      cancelable: false,
    },
  ) {
    super(GAMEPAD_BUTTON_EVENT, { detail, ...opts });
  }
}
