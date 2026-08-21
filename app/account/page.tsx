"use client";

import Link from "next/link";
import { Gift, Heart, LogOut, Package, Sparkles, UserRound, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

type AccountOrder = {
  id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; size: string; color: string }>;
  pricing: { total: number };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingUrl?: string;
  rewardPointsAwarded?: number;
  createdAt: string;
};

type RewardTransaction = {
  _id: string;
  type: string;
  points: number;
  description: string;
  createdAt: string;
};

type Redemption = {
  _id: string;
  code: string;
  status: string;
  pointsSpent: number;
  createdAt: string;
};

type RewardsData = {
  points: number;
  freeScrubUnlocked: boolean;
  pointsToFreeScrub: number;
  transactions: RewardTransaction[];
  redemptions: Redemption[];
  rules: { signupBonus: number; orderMinimum: number; orderPoints: number; freeScrubPoints: number };
};

export default function AccountPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const loadAccountData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [ordersResponse, rewardsResponse] = await Promise.all([
        fetch("/api/account/orders", { cache: "no-store" }),
        fetch("/api/account/rewards", { cache: "no-store" }),
      ]);
      const ordersData = (await ordersResponse.json()) as { success: boolean; orders?: AccountOrder[]; message?: string };
      const rewardsData = (await rewardsResponse.json()) as ({ success: boolean; message?: string } & Partial<RewardsData>);
      if (!ordersResponse.ok || !ordersData.success) throw new Error(ordersData.message || "Orders load failed.");
      if (!rewardsResponse.ok || !rewardsData.success) throw new Error(rewardsData.message || "Rewards load failed.");
      setOrders(ordersData.orders ?? []);
      setRewards(rewardsData as RewardsData);
    } catch (error) {
      console.error("Account data load failed:", error);
      toast.error(error instanceof Error ? error.message : "Account load failed.");
    } finally {
      setDataLoading(false);
    }
  }, [user, refreshUser]);

  useEffect(() => {
    void loadAccountData();
  }, [loadAccountData]);

  const progress = useMemo(() => {
    const points = rewards?.points ?? user?.points ?? 0;
    return Math.min((points / 1500) * 100, 100);
  }, [rewards, user]);

  const redeem = async () => {
    setRedeeming(true);
    try {
      const response = await fetch("/api/account/rewards/redeem", { method: "POST" });
      const data = (await response.json()) as { success: boolean; message?: string; redemption?: { code: string } };
      if (!response.ok || !data.success) throw new Error(data.message || "Reward redeem failed.");
      toast.success(`Reward claimed: ${data.redemption?.code ?? "Free Scrub"}`);
      await loadAccountData();
      await refreshUser();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reward redeem failed.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <section className="bg-slate-50 px-4 py-20 text-center text-sm text-slate-500">Loading account...</section>;
  }

  if (!user) {
    return (
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto text-[#922424]" size={42} />
          <h1 className="mt-5 text-3xl font-black text-slate-950">My Krinay Account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Login to view order history, wishlist and reward points. Shopping without login is still available.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login?next=/account" className="rounded-full bg-[#922424] px-6 py-3.5 text-sm font-black text-white">Login</Link><Link href="/register?next=/account" className="rounded-full border border-[#922424] px-6 py-3.5 text-sm font-black text-[#922424]">Create Account + 100 Points</Link></div>
        </div>
      </section>
    );
  }

  const points = rewards?.points ?? user.points;
  const latestPendingRedemption = rewards?.redemptions.find((item) => item.status === "pending");
  const whatsappNumber = process.env.NEXT_PUBLIC_KRINAY_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const whatsappText = latestPendingRedemption ? encodeURIComponent(`Hi Krinay, I want to customize my free scrub reward. Redemption code: ${latestPendingRedemption.code}`) : "";

  return (
    <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">MY KRINAY</p><h1 className="mt-2 text-3xl font-black text-slate-950">Hi, {user.name}</h1><p className="mt-2 text-sm text-slate-500">{user.email || user.phone}</p></div>
          <button onClick={async () => { await logout(); window.location.href = "/"; }} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700"><LogOut size={17} /> Logout</button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <Link href="/wishlist" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><Heart className="text-[#922424]" /><p className="mt-4 text-3xl font-black">{wishlistCount}</p><p className="mt-1 text-sm text-slate-500">Wishlist products</p></Link>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><Package className="text-[#922424]" /><p className="mt-4 text-3xl font-black">{orders.length}</p><p className="mt-1 text-sm text-slate-500">Orders linked to account</p></div>
          <div className="rounded-3xl border border-[#eadada] bg-[#fff7f7] p-6 shadow-sm"><WalletCards className="text-[#922424]" /><p className="mt-4 text-3xl font-black text-[#922424]">{points}</p><p className="mt-1 text-sm text-slate-600">Reward points</p></div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_1.25fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><Gift className="text-[#922424]" /><h2 className="text-xl font-black">Free Customized Scrub</h2></div>
            <p className="mt-3 text-sm leading-6 text-slate-500">Create account: +100 points. Every qualifying ₹1,599+ completed/paid order: +100 points. At 1,500 points you can claim one free customized scrub.</p>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#922424] transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="mt-3 flex justify-between text-xs font-bold text-slate-500"><span>{points} points</span><span>1,500 points</span></div>

            {latestPendingRedemption ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5"><p className="text-sm font-black text-emerald-800">Reward claimed</p><p className="mt-1 text-xs text-emerald-700">Code: {latestPendingRedemption.code}</p>{whatsappNumber ? <a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-[#922424] px-5 py-3 text-xs font-black text-white">Customize on WhatsApp</a> : <Link href="/contact" className="mt-4 inline-flex text-xs font-black text-[#922424] underline">Contact Krinay to customize</Link>}</div>
            ) : points >= 1500 ? (
              <button onClick={redeem} disabled={redeeming} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-5 py-3.5 text-sm font-black text-white disabled:opacity-60"><Sparkles size={17} /> {redeeming ? "Claiming..." : "Claim Free Customized Scrub"}</button>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">Only {Math.max(1500 - points, 0)} points to go.</div>
            )}

            <div className="mt-7 border-t border-slate-200 pt-5"><h3 className="text-sm font-black">Recent reward activity</h3><div className="mt-4 space-y-3">{(rewards?.transactions ?? []).slice(0, 6).map((item) => <div key={item._id} className="flex items-start justify-between gap-4 text-sm"><div><p className="font-semibold text-slate-800">{item.description}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString("en-IN")}</p></div><span className={`font-black ${item.points >= 0 ? "text-emerald-600" : "text-red-600"}`}>{item.points >= 0 ? "+" : ""}{item.points}</span></div>)}{!dataLoading && (rewards?.transactions.length ?? 0) === 0 && <p className="text-sm text-slate-400">No reward activity yet.</p>}</div></div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">ORDER HISTORY</p><h2 className="mt-2 text-xl font-black">Your Orders</h2></div><Link href="/shop" className="text-sm font-black text-[#922424]">Shop More</Link></div>
            <div className="mt-6 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black text-slate-950">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-700">{order.orderStatus.replaceAll("_", " ")}</span></div><div className="mt-4 space-y-1 text-sm text-slate-600">{order.items.map((item, index) => <p key={`${order.id}-${index}`}>{item.name} · {item.size} · {item.color} · Qty {item.quantity}</p>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-lg font-black text-[#922424]">₹{Number(order.pricing.total).toLocaleString("en-IN")}</p><div className="flex items-center gap-3">{(order.rewardPointsAwarded ?? 0) > 0 && <span className="text-xs font-black text-emerald-600">+{order.rewardPointsAwarded} points</span>}{order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-[#922424] underline">Track shipment</a>}</div></div></article>)}{!dataLoading && orders.length === 0 && <div className="rounded-2xl bg-slate-50 p-8 text-center"><p className="text-sm text-slate-500">No linked orders yet.</p><Link href="/shop" className="mt-4 inline-flex font-black text-[#922424]">Start shopping →</Link></div>}</div>
          </section>
        </div>
      </div>
    </section>
  );
}
