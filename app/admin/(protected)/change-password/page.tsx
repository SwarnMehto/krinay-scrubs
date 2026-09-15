"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function ChangeAdminPasswordPage() {
  const router = useRouter();

  const [otpSent, setOtpSent] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * =======================================================
   * SEND OTP
   * =======================================================
   */
  async function sendOtp() {
    if (sendingOtp) return;

    setError("");
    setSuccess("");
    setSendingOtp(true);

    try {
      const response =
        await fetch(
          "/api/admin/auth/password-otp/request",
          {
            method: "POST",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to send OTP.",
        );
      }

      setOtpSent(true);

      setSuccess(
        data?.message ||
          "OTP sent to your admin email.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send OTP.",
      );
    } finally {
      setSendingOtp(false);
    }
  }

  /*
   * =======================================================
   * CHANGE PASSWORD
   * =======================================================
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (changingPassword) return;

    setError("");
    setSuccess("");

    if (!otpSent) {
      setError(
        "Please request an OTP first.",
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP.",
      );
      return;
    }

    if (newPassword.length < 10) {
      setError(
        "Password must contain at least 10 characters.",
      );
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(
        newPassword,
      )
    ) {
      setError(
        "Password must include uppercase, lowercase, number and special character.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New passwords do not match.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response =
        await fetch(
          "/api/admin/auth/change-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              otp,
              newPassword,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to change password.",
        );
      }

      setSuccess(
        "Password changed successfully. Redirecting to login...",
      );

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

      /*
       * Backend clears admin session after successful
       * password change.
       */
      window.setTimeout(() => {
        router.replace(
          "/admin/login",
        );

        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/inventory",
            )
          }
          className="mb-6 text-sm font-semibold text-[#922424]"
        >
          ← Back to Admin
        </button>

        {/* CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#922424]">
              Krinay Admin
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Change Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              We will send a 6-digit
              verification code to your
              registered admin email before
              changing your password.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* SEND OTP */}
            {!otpSent && (
              <div>
                <div className="rounded-xl border border-[#922424]/15 bg-[#922424]/5 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Email verification required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Click below to send an OTP
                    to the email registered with
                    your Krinay admin account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="mt-5 w-full rounded-xl bg-[#922424] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#7d1f1f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingOtp
                    ? "Sending OTP..."
                    : "Send OTP to Email"}
                </button>
              </div>
            )}

            {/* FORM AFTER OTP */}
            {otpSent && (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-800">
                    OTP sent
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    Check your registered admin
                    email. The OTP is valid for
                    10 minutes.
                  </p>
                </div>

                {/* OTP */}
                <div>
                  <label
                    htmlFor="admin-otp"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    6-Digit OTP
                  </label>

                  <input
                    id="admin-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          "",
                        );

                      setOtp(
                        value.slice(
                          0,
                          6,
                        ),
                      );
                    }}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl font-bold tracking-[0.35em] text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                    required
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                    required
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Minimum 10 characters with
                    uppercase, lowercase, number
                    and special character.
                  </p>
                </div>

                {/* CONFIRM */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirm-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Enter new password again"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
                    required
                  />
                </div>

                {/* SHOW PASSWORD */}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(
                        event.target.checked,
                      )
                    }
                  />

                  Show passwords
                </label>

                {/* RESEND */}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="text-sm font-semibold text-[#922424] disabled:opacity-50"
                >
                  {sendingOtp
                    ? "Sending..."
                    : "Resend OTP"}
                </button>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  className="w-full rounded-xl bg-[#922424] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#7d1f1f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Verify OTP & Change Password"}
                </button>
              </form>
            )}

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}