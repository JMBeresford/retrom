import { ControllerMapping } from "./controller-ids";

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

export const DUALSHOCK_3_BUTTON_MAP = [
  "x",
  "○",
  "□",
  "△",
  "l1",
  "r1",
  "l2",
  "r2",
  "select",
  "start",
  "l3",
  "r3",
  "up",
  "down",
  "left",
  "right",
  "ps",
] as const;

export const DUALSHOCK_4_BUTTON_MAP = [
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

export const DUALSHOCK_5_BUTTON_MAP = [
  "x",
  "○",
  "□",
  "△",
  "l1",
  "r1",
  "l2",
  "r2",
  "create",
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
  controllerType?: ControllerMapping,
) {
  switch (controllerType) {
    case "xbox": {
      return XBOX_BUTTON_MAP[button];
    }
    case "dualshock 3": {
      return DUALSHOCK_3_BUTTON_MAP[button];
    }
    case "dualshock 4": {
      return DUALSHOCK_4_BUTTON_MAP[button];
    }
    case "dualshock 5": {
      return DUALSHOCK_5_BUTTON_MAP[button];
    }
    default: {
      return button.toString();
    }
  }
}
