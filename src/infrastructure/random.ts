import "server-only";

const UINT32_RANGE = 2 ** 32;

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new RangeError("maxExclusive must be an integer between 1 and 2^32");
  }

  // Keep only a whole number of equally sized sets of remainders.
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const sample = new Uint32Array(1);
  do {
    crypto.getRandomValues(sample);
  } while (sample[0] >= limit);

  return sample[0] % maxExclusive;
}
