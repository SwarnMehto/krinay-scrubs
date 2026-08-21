export type AuthChannel = "email" | "phone";

export type NormalizedIdentity = {
  identifier: string;
  channel: AuthChannel;
};

export function normalizeIdentity(value: string): NormalizedIdentity {
  const raw = value.trim();

  if (!raw) {
    throw new Error("Email ya mobile number required hai.");
  }

  if (raw.includes("@")) {
    const email = raw.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email address enter karo.");
    }

    return {
      identifier: email,
      channel: "email",
    };
  }

  const digits = raw.replace(/\D/g, "");
  const phone =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Valid 10-digit Indian mobile number enter karo.");
  }

  return {
    identifier: phone,
    channel: "phone",
  };
}
