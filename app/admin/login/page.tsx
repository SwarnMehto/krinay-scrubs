"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const KRINAY_BURGUNDY = "#922424";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [setupRequired, setSetupRequired] =
    useState(false);

  const [name, setName] =
    useState("Krinay Admin");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * =======================================================
   * CHECK LOGIN / SETUP STATUS
   * =======================================================
   */
  useEffect(() => {
    let active = true;

    async function initialise() {
      try {
        /*
         * Already logged in?
         */
        const meResponse =
          await fetch(
            "/api/admin/auth/me",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (meResponse.ok) {
          if (!active) return;

          router.replace(
            "/admin/inventory",
          );

          return;
        }

        /*
         * Check whether first admin needs to be created.
         */
        const setupResponse =
          await fetch(
            "/api/admin/auth/setup-status",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        const setupData =
          await setupResponse.json();

        if (!setupResponse.ok) {
          throw new Error(
            setupData?.message ||
              "Unable to load admin login.",
          );
        }

        if (!active) return;

        setSetupRequired(
          Boolean(
            setupData.setupRequired,
          ),
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin login.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialise();

    return () => {
      active = false;
    };
  }, [router]);

  /*
   * =======================================================
   * SUBMIT
   * =======================================================
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setMessage("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your admin email.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    /*
     * First-time setup validation.
     */
    if (setupRequired) {
      if (password.length < 10) {
        setError(
          "Password must contain at least 10 characters.",
        );
        return;
      }

      if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        setError(
          "Password must include uppercase, lowercase, number and special character.",
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const endpoint =
        setupRequired
          ? "/api/admin/auth/setup"
          : "/api/admin/auth/login";

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              setupRequired
                ? {
                    name:
                      name.trim() ||
                      "Krinay Admin",

                    email:
                      cleanEmail,

                    password,
                  }
                : {
                    email:
                      cleanEmail,

                    password,
                  },
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to continue.",
        );
      }

      setMessage(
        setupRequired
          ? "Admin account created successfully."
          : "Login successful.",
      );

      router.replace(
        "/admin/inventory",
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =======================================================
   * LOADING
   * =======================================================
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f7] px-4">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#922424]"
          />

          <p className="text-sm font-medium text-gray-600">
            Loading Krinay Admin...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =======================================================
   * PAGE
   * =======================================================
   */
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f7] px-4 py-10">
      <div className="w-full max-w-md">
        {/* BRAND */}
        <div className="mb-7 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
            style={{
              backgroundColor:
                KRINAY_BURGUNDY,
            }}
          >
            K
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Krinay Admin
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {setupRequired
              ? "Create your first administrator account"
              : "Sign in to manage Krinay"}
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {setupRequired && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                First-time setup
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                No administrator exists yet.
                Create the main Krinay admin
                account below.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NAME - SETUP ONLY */}
            {setupRequired && (
              <div>
                <label
                  htmlFor="admin-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Admin Name
                </label>

                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                  placeholder="Krinay Admin"
                />
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Admin Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                placeholder="Enter admin email"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  autoComplete={
                    setupRequired
                      ? "new-password"
                      : "current-password"
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                  placeholder={
                    setupRequired
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#922424]"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              {setupRequired && (
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Minimum 10 characters with
                  uppercase, lowercase, number
                  and special character.
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            {setupRequired && (
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirm Password
                </label>

                <input
                  id="confirm-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                  placeholder="Enter password again"
                />
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#922424] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#7d1f1f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please wait..."
                : setupRequired
                  ? "Create Admin Account"
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Krinay Scrubs • Secure Admin
          Access
        </p>
      </div>
    </main>
  );
}