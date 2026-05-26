const encoder = new TextEncoder();

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

export const randomId = () => crypto.randomUUID();

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100_000;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );

  return `pbkdf2:${iterations}:${bytesToBase64(salt)}:${bytesToBase64(new Uint8Array(bits))}`;
};

export const verifyPassword = async (password: string, storedHash: string) => {
  const [scheme, iterationsValue, saltValue, hashValue] = storedHash.split(":");

  if (scheme !== "pbkdf2" || !iterationsValue || !saltValue || !hashValue) {
    return false;
  }

  const iterations = Number(iterationsValue);
  const salt = base64ToBytes(saltValue);
  const expected = base64ToBytes(hashValue);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  const actual = new Uint8Array(bits);

  if (actual.length !== expected.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }

  return difference === 0;
};
