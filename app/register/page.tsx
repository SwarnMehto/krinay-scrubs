"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [identifier, setIdentifier] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [otp, setOtp] = useState("");

  /*
   * IMPORTANT:
   * Email OTP ke saath backend ek signed otpToken
   * return karta hai.
   *
   * Is token ko user ko dikhana nahi hai.
   * State me store karke register API ko bhejna hai.
   */
  const [otpToken, setOtpToken] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [otpLoading, setOtpLoading] =
    useState(false);

  const [nextPath, setNextPath] =
    useState("/account");

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const next =
      params.get("next");

    if (next?.startsWith("/")) {
      setNextPath(next);
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [
    user,
    router,
    nextPath,
  ]);

  /*
   * Agar user email/mobile change karta hai,
   * old OTP/token automatically invalidate kar do
   * frontend state se.
   */
  const handleIdentifierChange = (
    value: string,
  ) => {
    setIdentifier(value);

    setOtp("");
    setOtpToken("");
  };

  const requestOtp =
    async () => {
      const cleanIdentifier =
        identifier.trim();

      if (!cleanIdentifier) {
        toast.error(
          "Email ya mobile number enter karo.",
        );

        return;
      }

      /*
       * New OTP request karte waqt old token remove.
       */
      setOtp("");
      setOtpToken("");

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
                  identifier:
                    cleanIdentifier,

                  purpose:
                    "register",
                }),
            },
          );

        const data =
          (await response.json()) as {
            success: boolean;

            message?: string;

            type?:
              | "email"
              | "phone";

            channel?:
              | "email"
              | "phone";

            maskedIdentity?: string;

            /*
             * Email OTP ke case me
             * backend se ye token aayega.
             */
            otpToken?: string;

            devOtp?: string;
          };

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "OTP send failed.",
          );
        }

        /*
         * IMPORTANT FIX:
         *
         * Backend se jo otpToken mil raha hai
         * usko state me save karo.
         */
        if (
          typeof data.otpToken ===
          "string"
        ) {
          setOtpToken(
            data.otpToken,
          );
        } else {
          setOtpToken("");
        }

        /*
         * Localhost dev mode:
         * devOtp available ho to
         * OTP automatically fill.
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
        setOtpToken("");

        toast.error(
          error instanceof Error
            ? error.message
            : "OTP send failed.",
        );
      } finally {
        setOtpLoading(false);
      }
    };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const cleanName =
        name.trim();

      const cleanIdentifier =
        identifier.trim();

      const cleanOtp =
        otp.trim();

      if (
        cleanName.length < 2
      ) {
        toast.error(
          "Please enter your full name.",
        );

        return;
      }

      if (!cleanIdentifier) {
        toast.error(
          "Email ya mobile number enter karo.",
        );

        return;
      }

      if (
        password.length < 8
      ) {
        toast.error(
          "Password minimum 8 characters ka hona chahiye.",
        );

        return;
      }

      /*
       * Backend reset/register validation ke
       * saath match rakhne ke liye.
       */
      if (
        !/[A-Za-z]/.test(password) ||
        !/\d/.test(password)
      ) {
        toast.error(
          "Password me kam se kam 1 letter aur 1 number hona chahiye.",
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          cleanOtp,
        )
      ) {
        toast.error(
          "Valid 6-digit OTP enter karo.",
        );

        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/auth/register",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              /*
               * IMPORTANT FIX:
               * otpToken ab registration API
               * ko bheja ja raha hai.
               *
               * Phone OTP ke case me token
               * empty ho sakta hai.
               */
              body:
                JSON.stringify({
                  name:
                    cleanName,

                  identifier:
                    cleanIdentifier,

                  password,

                  otp:
                    cleanOtp,

                  otpToken,
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
              "Account create failed.",
          );
        }

        await refreshUser();

        toast.success(
          "Account created — 100 points added!",
        );

        router.push(
          nextPath,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Account create failed.",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-[#922424] p-8 text-white sm:p-10">
          <Gift size={36} />

          <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-white/70">
            KRINAY REWARDS
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight">
            Create your account
            and start with 100
            points.
          </h1>

          <div className="mt-8 space-y-4 text-sm leading-6 text-white/85">
            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              ₹1,599+ qualifying
              order earns 100
              points.
            </p>

            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              1,500 points unlock
              one free customized
              scrub reward claim.
            </p>

            <p className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0"
                size={18}
              />

              Wishlist and order
              history stay connected
              to your account.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
              <UserRound
                size={20}
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Create Account
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Verify using email
                or mobile OTP.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Full name
              </span>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target
                      .value,
                  )
                }
                placeholder="Your full name"
                autoComplete="name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Email or mobile
                number
              </span>

              <div className="flex items-center rounded-xl border border-slate-300 px-4 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">
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
                    handleIdentifierChange(
                      event.target
                        .value,
                    )
                  }
                  placeholder="name@email.com or 9876543210"
                  autoComplete="username"
                  className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">
                Create password
              </span>

              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="min-w-0 flex-1 bg-transparent py-3.5 pr-3 text-sm outline-none"
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

              <p className="mt-2 text-xs text-slate-500">
                Minimum 8
                characters.
              </p>
            </label>

            <div className="flex items-end gap-3">
              <label className="block flex-1">
                <span className="mb-2 block text-sm font-bold text-slate-800">
                  Verification OTP
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

            <button
              disabled={
                loading
              }
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-black text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                "Create Account & Get 100 Points"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an
            account?{" "}

            <Link
              href={`/login?next=${encodeURIComponent(
                nextPath,
              )}`}
              className="font-black text-[#922424]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}