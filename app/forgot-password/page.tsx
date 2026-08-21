"use client";

import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const requestOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "reset" }),
      });
      const data = (await response.json()) as { success: boolean; message?: string; devOtp?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "OTP send failed.");
      if (data.devOtp) setOtp(data.devOtp);
      toast.success(data.message || "OTP sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OTP send failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      const data = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "Reset failed.");
      setDone(true);
      toast.success("Password reset ho gaya.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]"><KeyRound size={22} /></div>
        <h1 className="mt-5 text-3xl font-black text-slate-950">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Email ya mobile par OTP verify karke new password set karo.</p>

        {done ? (
          <div className="mt-7 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">Password updated successfully. <Link href="/login" className="font-black underline">Login now</Link></div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold">Email or mobile number</span><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]" /></label>
            <div className="flex items-end gap-3"><label className="block flex-1"><span className="mb-2 block text-sm font-bold">OTP</span><input value={otp} maxLength={6} inputMode="numeric" onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#922424]" /></label><button type="button" onClick={requestOtp} disabled={otpLoading} className="rounded-xl border border-[#922424] px-4 py-3.5 text-sm font-bold text-[#922424]">{otpLoading ? "Sending..." : "Send OTP"}</button></div>
            <label className="block"><span className="mb-2 block text-sm font-bold">New password</span><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#922424]" /></label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-black text-white disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : "Reset Password"}</button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-block text-sm font-bold text-[#922424]">← Back to login</Link>
      </div>
    </section>
  );
}
