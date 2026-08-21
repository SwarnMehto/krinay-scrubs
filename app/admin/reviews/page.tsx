"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Loader2,
  Star,
  Trash2,
} from "lucide-react";

type AdminReview = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewsResponse = {
  success: boolean;
  message?: string;
  reviews?: AdminReview[];
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] =
    useState<AdminReview[]>([]);

  const [adminKey, setAdminKey] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const loadReviews = async () => {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/reviews",
          {
            cache: "no-store",
          },
        );

      const data =
        (await response.json()) as ReviewsResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Reviews load nahi ho paaye.",
        );
      }

      setReviews(
        data.reviews ?? [],
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Reviews load nahi ho paaye.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved =
      window.sessionStorage.getItem(
        "krinay-review-admin-key",
      );

    if (saved) {
      setAdminKey(saved);
    }

    loadReviews();
  }, []);

  const deleteReview = async (
    review: AdminReview,
  ) => {
    if (!adminKey.trim()) {
      setMessage(
        "Pehle admin review key enter karein.",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete review by ${review.customerName} for ${review.productName}?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(review.id);
    setMessage("");

    try {
      window.sessionStorage.setItem(
        "krinay-review-admin-key",
        adminKey.trim(),
      );

      const response =
        await fetch(
          `/api/reviews/${review.id}`,
          {
            method: "DELETE",

            headers: {
              "x-review-admin-key":
                adminKey.trim(),
            },
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
            "Review delete nahi ho paya.",
        );
      }

      setReviews(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              review.id,
          ),
      );

      setMessage(
        "Review deleted successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Review delete nahi ho paya.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">
            KRINAY Admin
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Review Moderation
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Customer reviews yahan se check aur abusive/spam review delete kar sakte hain.
          </p>

          <div className="mt-6 max-w-lg">
            <label
              htmlFor="review-admin-key"
              className="text-sm font-black text-slate-900"
            >
              Admin Review Key
            </label>

            <input
              id="review-admin-key"
              type="password"
              value={adminKey}
              onChange={(event) =>
                setAdminKey(
                  event.target.value,
                )
              }
              placeholder="Enter REVIEW_ADMIN_KEY"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20">
            <Loader2
              className="animate-spin text-[#922424]"
              size={28}
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-black text-slate-900">
              No customer reviews
            </h2>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-[#922424]">
                        {review.productName}
                      </p>

                      <h2 className="mt-2 text-lg font-black text-slate-950">
                        {review.customerName}
                      </h2>

                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({
                          length: 5,
                        }).map(
                          (
                            _,
                            index,
                          ) => (
                            <Star
                              key={
                                index
                              }
                              size={
                                16
                              }
                              className={
                                index <
                                review.rating
                                  ? "text-amber-500"
                                  : "text-slate-300"
                              }
                              fill={
                                index <
                                review.rating
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ),
                        )}
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                        {review.comment}
                      </p>

                      <p className="mt-4 text-xs text-slate-400">
                        {new Intl.DateTimeFormat(
                          "en-IN",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          },
                        ).format(
                          new Date(
                            review.createdAt,
                          ),
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        review.id
                      }
                      onClick={() =>
                        deleteReview(
                          review,
                        )
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId ===
                      review.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={17}
                        />
                      )}

                      Delete Review
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
