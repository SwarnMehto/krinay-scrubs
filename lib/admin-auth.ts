import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME =
  "krinay_admin_session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 12; // 12 hours

export type AdminSession = {
  adminId: string;
  email: string;
  role: "admin";
};

/*
 * =========================================================
 * SESSION SECRET
 * =========================================================
 */
function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing.",
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be at least 32 characters long.",
    );
  }

  return new TextEncoder().encode(secret);
}

/*
 * =========================================================
 * PASSWORD HASHING
 * =========================================================
 */
export async function hashAdminPassword(
  password: string,
) {
  if (!password) {
    throw new Error(
      "Password is required.",
    );
  }

  if (password.length < 10) {
    throw new Error(
      "Admin password must contain at least 10 characters.",
    );
  }

  return bcrypt.hash(
    password,
    12,
  );
}

/*
 * =========================================================
 * PASSWORD CHECK
 * =========================================================
 */
export async function verifyAdminPassword(
  password: string,
  passwordHash: string,
) {
  if (
    !password ||
    !passwordHash
  ) {
    return false;
  }

  return bcrypt.compare(
    password,
    passwordHash,
  );
}

/*
 * =========================================================
 * CREATE JWT
 * =========================================================
 */
export async function createAdminToken(
  session: AdminSession,
) {
  const secret =
    getSessionSecret();

  return new SignJWT({
    adminId: session.adminId,
    email: session.email,
    role: session.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(
      `${SESSION_DURATION_SECONDS}s`,
    )
    .sign(secret);
}

/*
 * =========================================================
 * VERIFY JWT
 * =========================================================
 */
export async function verifyAdminToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    if (!token) {
      return null;
    }

    const secret =
      getSessionSecret();

    const { payload } =
      await jwtVerify(
        token,
        secret,
      );

    if (
      typeof payload.adminId !==
        "string" ||
      typeof payload.email !==
        "string" ||
      payload.role !== "admin"
    ) {
      return null;
    }

    return {
      adminId:
        payload.adminId,

      email:
        payload.email,

      role: "admin",
    };
  } catch {
    return null;
  }
}

/*
 * =========================================================
 * SET SESSION COOKIE
 * =========================================================
 */
export async function setAdminSession(
  session: AdminSession,
) {
  const token =
    await createAdminToken(
      session,
    );

  const cookieStore =
    await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        SESSION_DURATION_SECONDS,
    },
  );
}

/*
 * =========================================================
 * GET CURRENT ADMIN SESSION
 * =========================================================
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        ADMIN_COOKIE_NAME,
      )?.value;

    if (!token) {
      return null;
    }

    return verifyAdminToken(
      token,
    );
  } catch {
    return null;
  }
}

/*
 * =========================================================
 * DELETE SESSION
 * =========================================================
 */
export async function clearAdminSession() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge: 0,
    },
  );
}