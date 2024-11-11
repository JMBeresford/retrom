import { GamepadContext } from ".";

export const XBOX_BUTTON_MAP = [
  "a",
  "b",
  "x",
  "y",
  "lb",
  "rb",
  "lt",
  "rt",
  "back",
  "start",
  "ls",
  "rs",
  "up",
  "down",
  "left",
  "right",
  "home",
] as const;

export const DUALSHOCK_BUTTON_MAP = [
  "x",
  "○",
  "□",
  "△",
  "l1",
  "r1",
  "l2",
  "r2",
  "share",
  "options",
  "l3",
  "r3",
  "up",
  "down",
  "left",
  "right",
  "ps",
] as const;

export function getButtonMapValue(
  button: number,
  controllerType: GamepadContext["controllerType"],
) {
  switch (controllerType) {
    case "xbox": {
      return XBOX_BUTTON_MAP[button];
    }
    case "dualshock": {
      return DUALSHOCK_BUTTON_MAP[button];
    }
    default: {
      return button.toString();
    }
  }
}
