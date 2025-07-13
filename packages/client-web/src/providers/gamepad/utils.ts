export enum GamepadAxisState {
  "Positive" = "Positive",
  "Negative" = "Negative",
  "Neutral" = "Neutral",
}

export function axisValueToAxisState(
  value: number,
  threshold: number = 0.1,
): GamepadAxisState {
  if (value > threshold) {
    return GamepadAxisState.Positive;
  } else if (value < -threshold) {
    return GamepadAxisState.Negative;
  }

  return GamepadAxisState.Neutral;
}
