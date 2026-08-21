import "server-only";

import mongoose from "mongoose";

import Order from "@/models/Order";
import RewardRedemption from "@/models/RewardRedemption";
import RewardTransaction from "@/models/RewardTransaction";
import User from "@/models/User";

export const SIGNUP_BONUS_POINTS = 100;
export const ORDER_REWARD_POINTS = 100;
export const ORDER_REWARD_MINIMUM = 1599;
export const FREE_SCRUB_POINTS = 1500;

function qualifyingAmount(order: {
  pricing?: {
    subtotal?: number;
    discount?: number;
  };
}) {
  return Math.max(
    Number(order.pricing?.subtotal ?? 0) -
      Number(order.pricing?.discount ?? 0),
    0,
  );
}

export async function syncUserPoints(userId: string) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const totals = await RewardTransaction.aggregate<{
    total: number;
  }>([
    {
      $match: {
        userId: objectId,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$points",
        },
      },
    },
  ]);

  const total = Math.max(0, Number(totals[0]?.total ?? 0));

  await User.updateOne(
    { _id: objectId },
    {
      $set: {
        points: total,
      },
    },
  );

  return total;
}

export async function createSignupReward(userId: string) {
  await RewardTransaction.updateOne(
    {
      referenceKey: `signup:${userId}`,
    },
    {
      $setOnInsert: {
        userId,
        type: "signup_bonus",
        points: SIGNUP_BONUS_POINTS,
        referenceKey: `signup:${userId}`,
        description: "Welcome bonus for creating a Krinay account.",
      },
    },
    {
      upsert: true,
    },
  );

  return syncUserPoints(userId);
}

export async function awardOrderRewardIfEligible(
  order: InstanceType<typeof Order>,
) {
  const userId = order.get("userId");

  if (!userId) {
    return {
      awarded: false,
      points: 0,
      reason: "guest_order",
    };
  }

  if (qualifyingAmount(order) < ORDER_REWARD_MINIMUM) {
    return {
      awarded: false,
      points: 0,
      reason: "minimum_not_met",
    };
  }

  const isPaidPrepaid = order.paymentStatus === "paid";
  const isDeliveredCod =
    order.paymentMethod === "cod" && order.orderStatus === "delivered";

  if (!isPaidPrepaid && !isDeliveredCod) {
    return {
      awarded: false,
      points: 0,
      reason: "order_not_eligible_yet",
    };
  }

  const orderId = order._id.toString();
  const referenceKey = `order:${orderId}`;

  await RewardTransaction.updateOne(
    {
      referenceKey,
    },
    {
      $setOnInsert: {
        userId,
        type: "order_reward",
        points: ORDER_REWARD_POINTS,
        referenceKey,
        description: `100 points for qualifying order ${order.orderNumber}.`,
      },
    },
    {
      upsert: true,
    },
  );

  order.set("rewardPointsAwarded", ORDER_REWARD_POINTS);
  order.set("rewardAwardedAt", new Date());
  await order.save();

  const points = await syncUserPoints(String(userId));

  return {
    awarded: true,
    points: ORDER_REWARD_POINTS,
    balance: points,
    reason: "awarded",
  };
}

export async function syncPendingOrderRewards(userId: string) {
  const orders = await Order.find({
    userId,
    $or: [
      {
        paymentStatus: "paid",
      },
      {
        paymentMethod: "cod",
        orderStatus: "delivered",
      },
    ],
  }).sort({ createdAt: -1 });

  for (const order of orders) {
    await awardOrderRewardIfEligible(order);
  }
}

function createRedemptionCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KRN-FREE-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function redeemFreeScrub(userId: string) {
  const currentPoints = await syncUserPoints(userId);

  if (currentPoints < FREE_SCRUB_POINTS) {
    throw new Error(
      `Free customized scrub ke liye ${FREE_SCRUB_POINTS} points required hain.`,
    );
  }

  let code = createRedemptionCode();

  while (await RewardRedemption.exists({ code })) {
    code = createRedemptionCode();
  }

  const redemption = await RewardRedemption.create({
    userId,
    code,
    pointsSpent: FREE_SCRUB_POINTS,
    status: "pending",
  });

  const decremented = await User.findOneAndUpdate(
    {
      _id: userId,
      points: {
        $gte: FREE_SCRUB_POINTS,
      },
    },
    {
      $inc: {
        points: -FREE_SCRUB_POINTS,
      },
    },
    {
      new: true,
    },
  );

  if (!decremented) {
    await RewardRedemption.deleteOne({ _id: redemption._id });
    throw new Error("Points balance update nahi ho paaya. Dobara try karo.");
  }

  try {
    await RewardTransaction.create({
      userId,
      type: "free_scrub_redemption",
      points: -FREE_SCRUB_POINTS,
      referenceKey: `redemption:${redemption._id.toString()}`,
      description: `Free customized scrub redemption ${code}.`,
    });
  } catch (error) {
    await User.updateOne(
      { _id: userId },
      {
        $inc: {
          points: FREE_SCRUB_POINTS,
        },
      },
    );

    await RewardRedemption.deleteOne({ _id: redemption._id });
    throw error;
  }

  const balance = await syncUserPoints(userId);

  return {
    redemption,
    balance,
  };
}

export async function getRewardSummary(userId: string) {
  await syncPendingOrderRewards(userId);
  const points = await syncUserPoints(userId);

  const [transactions, redemptions] = await Promise.all([
    RewardTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    RewardRedemption.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    points,
    freeScrubUnlocked: points >= FREE_SCRUB_POINTS,
    pointsToFreeScrub: Math.max(FREE_SCRUB_POINTS - points, 0),
    transactions,
    redemptions,
  };
}
