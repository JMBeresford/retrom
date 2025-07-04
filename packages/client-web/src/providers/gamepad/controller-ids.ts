import { ControllerMapping } from "./maps";

export type Vendor = keyof typeof vendorIds;

const vendorIds = {
  microsoft: [0x045e],
  sony: [0x054c],
  nintendo: [0x057e],
} as const;

type MicrosoftProduct = (typeof microsoftProducts)[number];
export const microsoftProducts = [
  "xbox",
  "xbox_elite",
  "xbox_s",
  "xbox_s_elite",
  "xbox_x",
  "xbox_x_elite",
  "xbox_xs",
  "xbox_xs_elite",
] as const;

type SonyProduct = (typeof sonyProducts)[number];
export const sonyProducts = ["ps3", "ps4", "ps5"] as const;

type NintendoProduct = (typeof nintendoProducts)[number];
export const nintendoProducts = [
  "switch_joycon_left",
  "switch_joycon_right",
  "switch_pro",
  "switch_joycon_dual",
  "switch_nso_n64",
] as const;

const microsoftProductIds: Record<MicrosoftProduct, number[]> = {
  xbox: [0x02d1],
  xbox_elite: [0x02dd],
  xbox_s: [0x0b00],
  xbox_s_elite: [0x0b05],
  xbox_x: [0x0b12],
  xbox_x_elite: [0x0b14],
  xbox_xs: [0x0b13],
  xbox_xs_elite: [0x0b15],
};

const sonyProductIds: Record<SonyProduct, number[]> = {
  ps3: [0x0268],
  ps4: [0x05c4, 0x09cc, 0x0ba0],
  ps5: [0x0ce6],
};

const nintendoProductIds: Record<NintendoProduct, number[]> = {
  switch_joycon_left: [0x2006],
  switch_joycon_right: [0x2007],
  switch_pro: [0x2009],
  switch_joycon_dual: [0x200e],
  switch_nso_n64: [0x2019], // Nintendo Switch Online N64 controller
};

type ParsedControllerId = {
  vendorId?: number;
  productId?: number;
  productName?: string;
};

export function getControllerMapping(gamepad: Gamepad): ControllerMapping {
  const id = gamepad.id.toLowerCase();

  const parsedId: ParsedControllerId | undefined =
    parseMozillaSpec(id) || parseGenericSpec(id);

  if (parsedId) {
    const controllerType = matchByParsedId(parsedId);

    if (controllerType) {
      return controllerType;
    }
  } else {
    const guessedControllerType = guessControllerName(id);

    if (guessedControllerType) {
      return guessedControllerType;
    }
  }

  return "generic";
}

function parseMozillaSpec(id: string): ParsedControllerId | undefined {
  try {
    const mozillaIdSpec = id.match(
      /(?<vendorId>[0-9a-f]+)-(?<productId>[0-9a-f]+)-(?<productName>.*)/,
    );

    if (mozillaIdSpec?.groups) {
      return {
        vendorId: parseInt(mozillaIdSpec.groups.vendorId, 16),
        productId: parseInt(mozillaIdSpec.groups.productId, 16),
        productName: mozillaIdSpec.groups.productName,
      };
    }
  } catch {
    return undefined;
  }
}

function parseGenericSpec(id: string): ParsedControllerId | undefined {
  try {
    const genericIdSpec =
      id.match(/vendor: 0x([0-9a-f]+) product: 0x([0-9a-f]+)/) ??
      id.match(/vendor: ([0-9a-f]+) product: ([0-9a-f]+)/);

    if (genericIdSpec) {
      return {
        vendorId: parseInt(genericIdSpec[1], 16),
        productId: parseInt(genericIdSpec[2], 16),
      };
    }
  } catch {
    return undefined;
  }
}

function matchByParsedId(
  id: ParsedControllerId,
): ControllerMapping | undefined {
  const { vendorId, productId } = id;

  if (!vendorId || !productId) {
    return undefined;
  }

  if (vendorIds.microsoft.some((v) => v === vendorId)) {
    return matchMicrosoftController(productId);
  }

  if (vendorIds.sony.some((v) => v === vendorId)) {
    return matchSonyController(productId);
  }

  if (vendorIds.nintendo.some((v) => v === vendorId)) {
    return matchNintendoController(productId);
  }
}

// naive fallback to guess controller type by generic id contents
function guessControllerName(id: string): ControllerMapping | undefined {
  id = id.toLowerCase();
  if (id.includes("xbox")) {
    return "xbox";
  }

  if (id.includes("dualshock 3")) {
    return "dualshock 3";
  }

  if (id.includes("dualshock 4")) {
    return "dualshock 4";
  }

  if (id.includes("dualshock 5")) {
    return "dualshock 5";
  }

  if (id.includes("pro controller")) {
    return "switch_pro";
  }
}

function matchMicrosoftController(
  productId: number,
): ControllerMapping | undefined {
  if (
    Object.values(microsoftProductIds).some((ids) => ids.includes(productId))
  ) {
    return "xbox";
  }

  return undefined;
}

function matchSonyController(productId: number): ControllerMapping | undefined {
  if (sonyProductIds.ps3.includes(productId)) {
    return "dualshock 3";
  }

  if (sonyProductIds.ps4.includes(productId)) {
    return "dualshock 4";
  }

  if (sonyProductIds.ps5.includes(productId)) {
    return "dualshock 5";
  }

  return undefined;
}

function matchNintendoController(
  productId: number,
): ControllerMapping | undefined {
  if (nintendoProductIds.switch_joycon_right.includes(productId)) {
    return "switch_joycon_right";
  }

  if (nintendoProductIds.switch_pro.includes(productId)) {
    return "switch_pro";
  }

  if (nintendoProductIds.switch_joycon_dual.includes(productId)) {
    return "switch_joycon_dual";
  }

  return undefined;
}
