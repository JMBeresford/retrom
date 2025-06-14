export function uInt8ToBase64(bytes: Uint8Array): string {
  const CHUNK_SZ = 0x8000;
  const c = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SZ) {
    c.push(
      String.fromCharCode.apply(null, [...bytes.subarray(i, i + CHUNK_SZ)]),
    );
  }

  return btoa(c.join(""));
}
