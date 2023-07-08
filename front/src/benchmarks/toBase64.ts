const base64Table = new Uint8Array(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    .split('')
    .map((c) => c.charCodeAt(0))
);

export function toBase64(uint8array: Uint8Array) {
  const chars = Math.ceil(uint8array.length / 3) * 4;
  const base64Arr = new Uint8Array(chars);
  let i = 0;
  const limit = uint8array.length - 2;
  let cursor = 0;
  while (i < limit) {
    const a = uint8array[i++];
    const b = uint8array[i++];
    const c = uint8array[i++];

    const a1 = a >> 2;
    const a2 = ((a & 0b11) << 4) | (b >> 4);
    const a3 = ((b & 0b1111) << 2) | (c >> 6);
    const a4 = c & 0b111111;

    base64Arr[cursor++] = base64Table[a1];
    base64Arr[cursor++] = base64Table[a2];
    base64Arr[cursor++] = base64Table[a3];
    base64Arr[cursor++] = base64Table[a4];
  }

  if (i === uint8array.length - 1) {
    const a = uint8array[i++];
    const a1 = a >> 2;
    const a2 = (a & 0b11) << 4;
    base64Arr[cursor++] = base64Table[a1];
    base64Arr[cursor++] = base64Table[a2];
    base64Arr[cursor++] = 61;
    base64Arr[cursor++] = 61;
  } else if (i === uint8array.length - 2) {
    const a = uint8array[i++];
    const b = uint8array[i++];
    const a1 = a >> 2;
    const a2 = ((a & 0b11) << 4) | (b >> 4);
    const a3 = (b & 0b1111) << 2;
    base64Arr[cursor++] = base64Table[a1];
    base64Arr[cursor++] = base64Table[a2];
    base64Arr[cursor++] = base64Table[a3];
    base64Arr[cursor++] = 61;
  }

  return new TextDecoder().decode(base64Arr);
}
