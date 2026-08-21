"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Loader2,
  Star,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export type ProductReviewItem = {
  id?: string;
  customerName?: string;
  name?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
};

type NormalizedReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
};

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  productName: string;
  initialReviews?: ProductReviewItem[];
  onStatsChange?: (
    rating: number,
    count: number,
  ) => void;
};

type ReviewsResponse = {
  success: boolean;
  message?: string;
  reviews?: ProductReviewItem[];
  review?: ProductReviewItem;
};

function normalizeReview(
  review: ProductReviewItem,
  index: number,
): NormalizedReview {
  return {
    id:
      review.id ||
      `static-review-${index}-${review.rating}`,
    customerName:
      review.customerName ||
      review.name ||
      "Customer",
    rating:
      Number(review.rating) || 0,
    comment:
      review.comment || "",
    date: review.date,
    createdAt: review.createdAt,
  };
}

function formatReviewDate(
  review: NormalizedReview,
) {
  const dateValue =
    review.createdAt ||
    review.date;

  if (!dateValue) {
    return "";
  }

  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
}

export default function ProductReviews({
  productId,
  productSlug,
  productName,
  initialReviews = [],
  onStatsChange,
}: ProductReviewsProps) {
  const normalizedInitialReviews =
    useMemo(
      () =>
        initialReviews.map(
          normalizeReview,
        ),
      [initialReviews],
    );

  const [reviews, setReviews] =
    useState<NormalizedReview[]>(
      normalizedInitialReviews,
    );

  const [formOpen, setFormOpen] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const publishStats =
    useCallback(
      (
        nextReviews:
          NormalizedReview[],
      ) => {
        const count =
          nextReviews.length;

        const average =
          count > 0
            ? Number(
                (
                  nextReviews.reduce(
                    (
                      total,
                      review,
                    ) =>
                      total +
                      review.rating,
                    0,
                  ) / count
                ).toFixed(1),
              )
            : 0;

        onStatsChange?.(
          average,
          count,
        );
      },
      [onStatsChange],
    );

  useEffect(() => {
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise((resolve) =>
        setTimeout(resolve, ms),
      );

    async function loadReviews() {
      const maxAttempts = 3;

      for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt += 1
      ) {
        try {
          const response =
            await fetch(
              `/api/reviews?productId=${encodeURIComponent(
                productId,
              )}`,
              {
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              },
            );

          let data: ReviewsResponse;

          try {
            data =
              (await response.json()) as ReviewsResponse;
          } catch {
            data = {
              success: false,
              message:
                "Invalid reviews API response.",
            };
          }

          if (
            !response.ok ||
            !data.success
          ) {
            if (
              attempt <
              maxAttempts
            ) {
              await wait(
                attempt * 500,
              );

              continue;
            }

            console.warn(
              "Reviews API unavailable:",
              data.message ||
                `HTTP ${response.status}`,
            );

            if (!cancelled) {
              setReviews(
                normalizedInitialReviews,
              );

              publishStats(
                normalizedInitialReviews,
              );
            }

            return;
          }

          const databaseReviews =
            (
              data.reviews || []
            ).map(
              normalizeReview,
            );

          if (cancelled) {
            return;
          }

          const databaseIds =
            new Set(
              databaseReviews.map(
                (review) =>
                  review.id,
              ),
            );

          const combined = [
            ...databaseReviews,
            ...normalizedInitialReviews.filter(
              (review) =>
                !databaseIds.has(
                  review.id,
                ),
            ),
          ];

          setReviews(combined);

          publishStats(
            combined,
          );

          return;
        } catch (error) {
          if (
            attempt <
            maxAttempts
          ) {
            await wait(
              attempt * 500,
            );

            continue;
          }

          console.warn(
            "Review load failed:",
            error,
          );

          if (!cancelled) {
            setReviews(
              normalizedInitialReviews,
            );

            publishStats(
              normalizedInitialReviews,
            );
          }

          return;
        }
      }
    }

    loadReviews().finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    productId,
    normalizedInitialReviews,
    publishStats,
  ]);

  const averageRating =
    useMemo(() => {
      if (
        reviews.length === 0
      ) {
        return 0;
      }

      return Number(
        (
          reviews.reduce(
            (
              total,
              review,
            ) =>
              total +
              review.rating,
            0,
          ) /
          reviews.length
        ).toFixed(1),
      );
    }, [reviews]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cleanName =
      customerName.trim();

    const cleanComment =
      comment.trim();

    if (
      cleanName.length < 2
    ) {
      toast.error(
        "Please enter your name.",
      );

      return;
    }

    if (
      rating < 1 ||
      rating > 5
    ) {
      toast.error(
        "Please select a rating.",
      );

      return;
    }

    if (
      cleanComment.length < 5
    ) {
      toast.error(
        "Please write a little more about your experience.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/reviews",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                productId,
                productSlug,
                productName,
                customerName:
                  cleanName,
                rating,
                comment:
                  cleanComment,
              }),
          },
        );

      const data =
        (await response.json()) as ReviewsResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.review
      ) {
        throw new Error(
          data.message ||
            "Review submit nahi ho paya.",
        );
      }

      const newReview =
        normalizeReview(
          data.review,
          Date.now(),
        );

      const nextReviews = [
        newReview,
        ...reviews,
      ];

      setReviews(
        nextReviews,
      );

      publishStats(
        nextReviews,
      );

      setCustomerName("");
      setRating(5);
      setComment("");
      setFormOpen(false);

      toast.success(
        "Thank you! Review published.",
      );
    } catch (error) {
      console.error(
        "Review submit failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Review submit nahi ho paya.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#922424]">
              Customer Feedback
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Product Reviews
            </h2>

            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Star
                  size={17}
                  className="text-amber-500"
                  fill="currentColor"
                />

                <span className="font-black text-slate-900">
                  {averageRating}
                </span>

                <span>
                  from{" "}
                  {reviews.length}{" "}
                  {reviews.length ===
                  1
                    ? "review"
                    : "reviews"}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setFormOpen(
                (current) =>
                  !current,
              )
            }
            className="rounded-full border border-[#922424] px-6 py-3 text-sm font-bold text-[#922424] transition hover:bg-[#fff4f4]"
          >
            {formOpen
              ? "Close Review Form"
              : "Write a Review"}
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={
              handleSubmit
            }
            className="relative mt-7 rounded-3xl border border-[#eadada] bg-white p-5 shadow-sm sm:p-7"
          >
            <button
              type="button"
              onClick={() =>
                setFormOpen(
                  false,
                )
              }
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              aria-label="Close review form"
            >
              <X size={18} />
            </button>

            <div className="max-w-2xl">
              <h3 className="text-xl font-black text-slate-950">
                Review{" "}
                {productName}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share your genuine
                experience with this
                product.
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <label
                  htmlFor="review-name"
                  className="text-sm font-black text-slate-900"
                >
                  Your Name
                </label>

                <input
                  id="review-name"
                  type="text"
                  value={
                    customerName
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomerName(
                      event.target
                        .value,
                    )
                  }
                  maxLength={60}
                  placeholder="Your name"
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
                />

                <p className="mt-5 text-sm font-black text-slate-900">
                  Rating
                </p>

                <div className="mt-2 flex gap-2">
                  {Array.from({
                    length: 5,
                  }).map(
                    (
                      _,
                      index,
                    ) => {
                      const value =
                        index + 1;

                      return (
                        <button
                          key={
                            value
                          }
                          type="button"
                          onClick={() =>
                            setRating(
                              value,
                            )
                          }
                          className="rounded-lg p-1 transition hover:scale-110"
                          aria-label={`${value} star rating`}
                        >
                          <Star
                            size={
                              26
                            }
                            className={
                              value <=
                              rating
                                ? "text-amber-500"
                                : "text-slate-300"
                            }
                            fill={
                              value <=
                              rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="text-sm font-black text-slate-900"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  rows={6}
                  value={comment}
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                  maxLength={800}
                  placeholder="Tell us about fit, fabric, comfort and overall experience..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {comment.length}
                  /800
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={
                  submitting
                }
                className="flex min-w-40 items-center justify-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#761b1b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {submitting
                  ? "Publishing..."
                  : "Publish Review"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14">
            <Loader2
              size={26}
              className="animate-spin text-[#922424]"
            />
          </div>
        ) : reviews.length >
          0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {reviews.map(
              (review) => (
                <article
                  key={
                    review.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-900">
                        {
                          review.customerName
                        }
                      </h3>

                      {formatReviewDate(
                        review,
                      ) && (
                        <p className="mt-1 text-xs text-slate-400">
                          {formatReviewDate(
                            review,
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
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
                  </div>

                  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {
                      review.comment
                    }
                  </p>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Star
              className="mx-auto text-slate-300"
              size={42}
            />

            <h3 className="mt-4 text-lg font-black text-slate-900">
              No reviews yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Be the first to review
              this product.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}