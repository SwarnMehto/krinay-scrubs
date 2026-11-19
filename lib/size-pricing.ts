export const SCRUB_SIZE_SURCHARGE = 250;

export function isSurchargeSize(size: string | null | undefined) {
  const normalizedSize =
    size?.trim().toUpperCase().replace(/\s+/g, "") ?? "";

  if (/^XXL\+?$/.test(normalizedSize)) {
    return true;
  }

  const numericSize = normalizedSize.match(/^(\d+)XL$/);
  if (numericSize) {
    return Number(numericSize[1]) >= 2;
  }

  const extendedSize = normalizedSize.match(/^(X{2,})L$/);
  return Boolean(extendedSize);
}

export function getScrubSizeSurcharge(
  productType: string | null | undefined,
  ...sizes: (string | null | undefined)[]
) {
  return productType === "scrub" && sizes.some(isSurchargeSize)
    ? SCRUB_SIZE_SURCHARGE
    : 0;
}
