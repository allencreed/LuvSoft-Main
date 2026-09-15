import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

/** Promise wrapper around scrypt (the promisify overload picks the wrong arity). */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) =>
      err ? reject(err) : resolve(derivedKey),
    );
  });
}

/**
 * Password hashing for native accounts, using Node's built-in scrypt —
 * no extra dependency, memory-hard, and OWASP-acceptable parameters.
 *
 * Stored format: `scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>`
 * so parameters can be upgraded later without invalidating old hashes.
 */

const N = 16384; // 2^14 — ~16 MiB memory per hash
const r = 8;
const p = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(password.normalize("NFKC"), salt, KEY_LEN, {
    N,
    r,
    p,
  })) as Buffer;

  return [
    "scrypt",
    N,
    r,
    p,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");

  try {
    const derived = (await scryptAsync(
      password.normalize("NFKC"),
      salt,
      expected.length,
      { N: parseInt(nStr, 10), r: parseInt(rStr, 10), p: parseInt(pStr, 10) },
    )) as Buffer;

    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
