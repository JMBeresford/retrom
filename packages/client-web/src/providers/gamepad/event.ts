declare global {
  export interface GlobalEventHandlersEventMap {
    [GamepadButtonDownEvent.EVENT_NAME]: GamepadButtonDownEvent;
    [GamepadButtonUpEvent.EVENT_NAME]: GamepadButtonUpEvent;
    [GamepadAxisActiveEvent.EVENT_NAME]: GamepadAxisActiveEvent;
    [GamepadAxisInactiveEvent.EVENT_NAME]: GamepadAxisInactiveEvent;
  }

  export interface ElementEventMap {
    [GamepadButtonDownEvent.EVENT_NAME]: GamepadButtonDownEvent;
    [GamepadButtonUpEvent.EVENT_NAME]: GamepadButtonUpEvent;
    [GamepadAxisActiveEvent.EVENT_NAME]: GamepadAxisActiveEvent;
    [GamepadAxisInactiveEvent.EVENT_NAME]: GamepadAxisInactiveEvent;
  }
}

export type GamepadButtonEventDetail = {
  gamepad: Gamepad;

  /* The gamepad index of the button that triggered the event */
  button: number;
};

export type GamepadAxisEventDetail = {
  gamepad: Gamepad;

  /** The gamepad index of the axis that triggered the event */
  axis: number;
  /** The current value of the axis that triggered the event */
  value: number;
};

export class GamepadButtonDownEvent extends CustomEvent<GamepadButtonEventDetail> {
  static readonly EVENT_NAME = "gamepad-button-down";

  constructor(detail: GamepadButtonEventDetail) {
    super(GamepadButtonDownEvent.EVENT_NAME, {
      detail,
      bubbles: true,
      cancelable: false,
    });
  }
}

export class GamepadButtonUpEvent extends CustomEvent<GamepadButtonEventDetail> {
  static readonly EVENT_NAME = "gamepad-button-up";

  constructor(detail: GamepadButtonEventDetail) {
    super(GamepadButtonUpEvent.EVENT_NAME, {
      detail,
      bubbles: true,
      cancelable: false,
    });
  }
}

export class GamepadAxisActiveEvent extends CustomEvent<GamepadAxisEventDetail> {
  static readonly EVENT_NAME = "gamepad-axes";

  constructor(detail: GamepadAxisEventDetail) {
    super(GamepadAxisActiveEvent.EVENT_NAME, {
      detail,
      bubbles: true,
      cancelable: false,
    });
  }
}

export class GamepadAxisInactiveEvent extends CustomEvent<GamepadAxisEventDetail> {
  static readonly EVENT_NAME = "gamepad-axes-inactive";

  constructor(detail: GamepadAxisEventDetail) {
    super(GamepadAxisInactiveEvent.EVENT_NAME, {
      detail,
      bubbles: true,
      cancelable: false,
    });
  }
}
