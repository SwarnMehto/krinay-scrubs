"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";

type LoginMode =
  | "password"
  | "otp";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    refreshUser,
  } = useAuth();

  const [
    identifier,
    setIdentifier,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [otp, setOtp] =
    useState("");

  const [mode, setMode] =
    useState<LoginMode>(
      "password",
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    otpLoading,
    setOtpLoading,
  ] = useState(false);

  const [
    nextPath,
    setNextPath,
  ] = useState("/account");

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const next =
      params.get("next");

    if (
      next?.startsWith("/")
    ) {
      setNextPath(next);
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.replace(
        nextPath,
      );
    }
  }, [
    user,
    router,
    nextPath,
  ]);

  const requestOtp =
    async () => {
      if (
        !identifier.trim()
      ) {
        toast.error(
          "Email ya mobile number enter karo.",
        );

        return;
      }

      setOtpLoading(true);

      try {
        const response =
          await fetch(
            "/api/auth/request-otp",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  identifier,
                  purpose:
                    "login",
                }),
            },
          );

        const data =
          (await response.json()) as {
            success: boolean;
            message?: string;
            devOtp?: string;
          };

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "OTP send nahi ho paaya.",
          );
        }

        /*
         * Local development:
         * real SMS provider nahi hai to dev OTP
         * automatically input me fill ho jayega.
         */
        if (data.devOtp) {
          setOtp(
            data.devOtp,
          );
        }

        toast.success(
          data.message ||
            "OTP sent.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "OTP send failed.",
        );
      } finally {
        setOtpLoading(
          false,
        );
      }
    };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !identifier.trim()
      ) {
        toast.error(
          "Email ya mobile number enter karo.",
        );

        return;
      }

      if (
        mode ===
          "password" &&
        !password
      ) {
        toast.error(
          "Password enter karo.",
        );

        return;
      }

      if (
        mode === "otp" &&
        otp.length !== 6
      ) {
        toast.error(
          "6-digit OTP enter karo.",
        );

        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  identifier,
                  mode,

                  password:
                    mode ===
                    "password"
                      ? password
                      : undefined,

                  otp:
                    mode === "otp"
                      ? otp
                      : undefined,
                }),
            },
          );

        const data =
          (await response.json()) as {
            success: boolean;
            message?: string;
          };

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Login failed.",
          );
        }

        await refreshUser();

        toast.success(
          "Welcome back to Krinay!",
        );

        router.push(
          nextPath,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Login failed.",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-[#922424] p-8 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
            KRINAY ACCOUNT
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight">
            Your orders,
            wishlist and rewards
            — all in one place.
          </h1>

          <div className="mt-8 space-y-4 text-sm leading-6 text-white/85">
            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              Guest checkout
              remains available.
              Login is optional.
            </p>

            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              Create an account
              and receive 100
              welcome points.
            </p>

            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              Reach 1,500 points
              to unlock a free
              customized scrub.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
              <LogIn size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Login
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Use your email
                or Indian mobile
                number.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                setMode(
                  "password",
                )
              }
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                mode === "password"
                  ? "bg-white text-[#922424] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Password
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("otp")
              }
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                mode === "otp"
                  ? "bg-white text-[#922424] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              OTP Login
            </button>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Email or mobile
                number
              </span>

              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">
                <Mail
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  value={
                    identifier
                  }
                  onChange={(
                    event,
                  ) =>
                    setIdentifier(
                      event.target
                        .value,
                    )
                  }
                  placeholder="name@email.com or 9876543210"
                  autoComplete="username"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none"
                />
              </div>
            </label>

            {mode ===
            "password" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  Password
                </span>

                <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">
                  <KeyRound
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#fff4f4] hover:text-[#922424]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>
                </div>

                <Link
                  href="/forgot-password"
                  className="mt-2 inline-block text-xs font-bold text-[#922424]"
                >
                  Forgot password?
                </Link>
              </label>
            ) : (
              <div>
                <div className="flex items-end justify-between gap-3">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-bold text-slate-800">
                      6-digit OTP
                    </span>

                    <input
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(
                        event,
                      ) =>
                        setOtp(
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      placeholder="123456"
                      autoComplete="one-time-code"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={
                      requestOtp
                    }
                    disabled={
                      otpLoading
                    }
                    className="rounded-xl border border-[#922424] px-4 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpLoading
                      ? "Sending..."
                      : "Send OTP"}
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-black text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Logging in...
                </>
              ) : (
                "Login to My Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to Krinay?{" "}

            <Link
              href={`/register?next=${encodeURIComponent(
                nextPath,
              )}`}
              className="font-black text-[#922424]"
            >
              Create account +
              get 100 points
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
