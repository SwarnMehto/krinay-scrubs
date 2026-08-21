import "server-only";

import mongoose from "mongoose";

import { connectDatabase } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/auth/session";
import Order from "@/models/Order";
import User from "@/models/User";

export function serializeUser(user: {
  _id: unknown;
  name: string;
  email?: string | null;
  phone?: string | null;
  points?: number;
  wishlistProductIds?: string[];
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email ?? "",
    phone: user.phone ?? "",
    points: Number(user.points ?? 0),
    wishlistProductIds: user.wishlistProductIds ?? [],
  };
}

export async function getAuthenticatedUserOrNull() {
  const userId = await getSessionUserId();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  await connectDatabase();

  return User.findOne({
    _id: userId,
    isActive: true,
  });
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUserOrNull();

  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }

  return user;
}

export async function attachExistingOrdersToUser(user: {
  _id: unknown;
  email?: string | null;
  phone?: string | null;
}) {
  const identityFilters: Record<string, string>[] = [];

  if (user.email) {
    identityFilters.push({
      "customer.email": user.email.toLowerCase(),
    });
  }

  if (user.phone) {
    identityFilters.push({
      "customer.phone": user.phone,
    });
  }

  if (identityFilters.length === 0) {
    return;
  }

  await Order.updateMany(
    {
      $and: [
        {
          $or: [
            { userId: { $exists: false } },
            { userId: null },
          ],
        },
        {
          $or: identityFilters,
        },
      ],
    },
    {
      $set: {
        userId: user._id,
      },
    },
  );
}
