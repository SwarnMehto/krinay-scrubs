"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  wishlistProductIds: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * =========================================================
   * REFRESH CURRENT USER
   * =========================================================
   */

  const refreshUser =
    useCallback(async (): Promise<AuthUser | null> => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",

            headers: {
              Accept:
                "application/json",
            },
          },
        );

        /*
         * User is not logged in.
         * This is normal and should not be treated
         * as an application error.
         */
        if (
          response.status === 401
        ) {
          setUser(null);

          return null;
        }

        /*
         * API returned another HTTP error.
         */
        if (!response.ok) {
          setUser(null);

          console.warn(
            `Auth request returned HTTP ${response.status}.`,
          );

          return null;
        }

        /*
         * Parse JSON safely.
         */
        const data =
          (await response.json()) as {
            success?: boolean;
            authenticated?: boolean;
            user?: AuthUser | null;
          };

        /*
         * Not authenticated.
         */
        if (
          !data.success ||
          !data.authenticated ||
          !data.user
        ) {
          setUser(null);

          return null;
        }

        /*
         * Authenticated successfully.
         */
        setUser(data.user);

        return data.user;
      } catch (error) {
        /*
         * Next.js/Turbopack development refresh
         * can temporarily interrupt fetch requests.
         *
         * Do not treat this as a fatal auth error.
         */
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return null;
        }

        /*
         * Browser may throw:
         *
         * TypeError: Failed to fetch
         *
         * during dev recompilation / page refresh.
         */
        if (
          error instanceof
            TypeError &&
          error.message
            .toLowerCase()
            .includes(
              "failed to fetch",
            )
        ) {
          if (
            process.env.NODE_ENV ===
            "development"
          ) {
            console.warn(
              "Auth request was temporarily interrupted during development.",
            );
          }

          return null;
        }

        /*
         * Real unexpected error.
         */
        console.error(
          "Auth session load failed:",
          error,
        );

        setUser(null);

        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const logout =
    useCallback(async () => {
      try {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
            credentials:
              "same-origin",

            headers: {
              Accept:
                "application/json",
            },
          },
        );
      } catch (error) {
        /*
         * Logout should still clear frontend user
         * even if network request temporarily fails.
         */
        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          console.warn(
            "Logout request was interrupted:",
            error,
          );
        }
      } finally {
        setUser(null);
      }
    }, []);

  /*
   * =========================================================
   * LOAD SESSION ON APP START
   * =========================================================
   */

  useEffect(() => {
    let active = true;

    const loadSession =
      async () => {
        if (!active) {
          return;
        }

        await refreshUser();
      };

    void loadSession();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  /*
   * =========================================================
   * CONTEXT VALUE
   * =========================================================
   */

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        loading,

        authenticated:
          Boolean(user),

        refreshUser,

        logout,
      }),
      [
        user,
        loading,
        refreshUser,
        logout,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}