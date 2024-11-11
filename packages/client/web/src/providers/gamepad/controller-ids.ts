type Vendor = (typeof Vendor)[number];
const Vendor = ["microsoft", "sony"] as const;

const vendorIds: Record<Vendor, number[]> = {
  microsoft: [0x045e],
  sony: [0x054c],
};

type Product = (typeof Product)[number];
const Product = [
  // xbox controllers
  "xbox",
  "xbox_elite",
  "xbox_s",
  "xbox_s_elite",
  "xbox_x",
  "xbox_x_elite",
  "xbox_xs",
  "xbox_xs_elite",

  // playstation controllers
  "ps3",
  "ps4",
  "ps5",
] as const;

const productIds: Record<Product, number[]> = {
  xbox: [0x02d1],
  xbox_elite: [0x02dd],
  xbox_s: [0x0b00],
  xbox_s_elite: [0x0b05],
  xbox_x: [0x0b12],
  xbox_x_elite: [0x0b14],
  xbox_xs: [0x0b13],
  xbox_xs_elite: [0x0b15],
  ps3: [0x0268],
  ps4: [0x05c4, 0x09cc, 0x0ba0],
  ps5: [0x0ce6],
};

export type ControllerMapping = (typeof ControllerMapping)[number];
export const ControllerMapping = [
  "xbox",
  "dualshock 3",
  "dualshock 4",
  "dualshock 5",
] as const;

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

  return "xbox";
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
    const genericIdSpec = id.match(
      /vendor: 0x([0-9a-f]+) product: 0x([0-9a-f]+)/,
    );

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

  if (vendorIds.microsoft.includes(vendorId)) {
    return matchMicrosoftController(productId);
  }

  if (vendorIds.sony.includes(vendorId)) {
    return matchSonyController(productId);
  }
}

// naive fallback to guess controller type by generic id contents
function guessControllerName(id: string): ControllerMapping | undefined {
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
}

function matchMicrosoftController(
  productId: number,
): ControllerMapping | undefined {
  const xboxControllers = [
    productIds.xbox,
    productIds.xbox_elite,
    productIds.xbox_s,
    productIds.xbox_s_elite,
    productIds.xbox_x,
    productIds.xbox_x_elite,
    productIds.xbox_xs,
    productIds.xbox_xs_elite,
  ];

  if (xboxControllers.some((ids) => ids.includes(productId))) {
    return "xbox";
  }

  return undefined;
}

function matchSonyController(productId: number): ControllerMapping | undefined {
  if (productIds.ps3.includes(productId)) {
    return "dualshock 3";
  }

  if (productIds.ps4.includes(productId)) {
    return "dualshock 4";
  }

  if (productIds.ps5.includes(productId)) {
    return "dualshock 5";
  }

  return undefined;
}
