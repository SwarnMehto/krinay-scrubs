export type IdentityType =
  | "email"
  | "phone";

export type NormalizedIdentity = {
  type: IdentityType;
  value: string;
};

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INDIA_PHONE_REGEX =
  /^[6-9]\d{9}$/;

export function normalizeIdentity(
  rawValue: string,
): NormalizedIdentity {
  const value = rawValue
    .trim()
    .toLowerCase();

  if (EMAIL_REGEX.test(value)) {
    return {
      type: "email",
      value,
    };
  }

  const digits = value.replace(
    /\D/g,
    "",
  );

  let tenDigitPhone = digits;

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    tenDigitPhone =
      digits.slice(2);
  }

  if (
    INDIA_PHONE_REGEX.test(
      tenDigitPhone,
    )
  ) {
    return {
      type: "phone",
      value: tenDigitPhone,
    };
  }

  throw new Error(
    "Valid email ya 10-digit Indian mobile number enter karo.",
  );
}

export function toE164Phone(
  phone: string,
): string {
  const normalized =
    normalizeIdentity(phone);

  if (
    normalized.type !== "phone"
  ) {
    throw new Error(
      "Valid mobile number required.",
    );
  }

  return `+91${normalized.value}`;
}

export function maskIdentity(
  identity: NormalizedIdentity,
): string {
  if (
    identity.type === "phone"
  ) {
    return `******${identity.value.slice(
      -4,
    )}`;
  }

  const [name, domain] =
    identity.value.split("@");

  return `${name.slice(
    0,
    2,
  )}***@${domain}`;
}