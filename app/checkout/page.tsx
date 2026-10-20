"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import {

  ArrowLeft,

  Check,

  CreditCard,

  Gift,

  LockKeyhole,

  MapPin,

  Package,

  ShoppingBag,

  Truck,

  UserRound,

} from "lucide-react";

import {

  useEffect,

  useMemo,

  useRef,

  useState,

  type ChangeEvent,

  type FormEvent,

  type ReactNode,

} from "react";

import toast from "react-hot-toast";

import { useCart } from "@/hooks/useCart";

import { useAuth } from "@/hooks/useAuth";

import { products } from "@/data/products";

import { trackEvent } from "@/lib/fbpixel";

import { loadRazorpayScript } from "@/lib/loadRazorpay";

import type {

  RazorpayFailureResponse,

  RazorpayOptions,

  RazorpayPaymentResponse,

} from "@/types/razorpay";

type PaymentMethod = "prepaid" | "cod";

type CheckoutForm = {

  fullName: string;

  phone: string;

  email: string;

  addressLine1: string;

  addressLine2: string;

  landmark: string;

  city: string;

  state: string;

  pinCode: string;

};

type CheckoutErrors = Partial<

  Record<keyof CheckoutForm, string>

>;

type OpenRazorpayCheckoutInput = {

  krinayOrderId: string;

  orderNumber: string;

};

type CreateOrderApiResponse = {

  success: boolean;

  message?: string;

  order?: {

    id: string;

    orderNumber: string;

    invoiceAccessToken: string;

    paymentMethod?: string;

    paymentStatus?: string;

    orderStatus?: string;

  };

};

type CreatePaymentApiResponse = {

  success: boolean;

  message?: string;

  razorpayOrder?: {

    id: string;

    amount: number | string;

    currency: string;

  };

  krinayOrder?: {

    id: string;

    orderNumber: string;

    total: number;

  };

};

type VerifyPaymentApiResponse = {

  success: boolean;

  message?: string;

  order?: {

    id?: string;

    orderNumber: string;

    invoiceAccessToken: string;

    paymentStatus?: string;

    orderStatus?: string;

  };

};

const initialForm: CheckoutForm = {

  fullName: "",

  phone: "",

  email: "",

  addressLine1: "",

  addressLine2: "",

  landmark: "",

  city: "",

  state: "",

  pinCode: "",

};

const indianStates = [

  "Andaman and Nicobar Islands",

  "Andhra Pradesh",

  "Arunachal Pradesh",

  "Assam",

  "Bihar",

  "Chandigarh",

  "Chhattisgarh",

  "Delhi",

  "Goa",

  "Gujarat",

  "Haryana",

  "Himachal Pradesh",

  "Jammu and Kashmir",

  "Jharkhand",

  "Karnataka",

  "Kerala",

  "Ladakh",

  "Lakshadweep",

  "Madhya Pradesh",

  "Maharashtra",

  "Manipur",

  "Meghalaya",

  "Mizoram",

  "Nagaland",

  "Odisha",

  "Puducherry",

  "Punjab",

  "Rajasthan",

  "Sikkim",

  "Tamil Nadu",

  "Telangana",

  "Tripura",

  "Uttar Pradesh",

  "Uttarakhand",

  "West Bengal",

];

async function readApiResponse<T>(

  response: Response,

): Promise<T> {

  const contentType =

    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {

    const serverResponse = await response.text();

    console.error(

      "Expected JSON but server returned:",

      serverResponse,

    );

    throw new Error(

      `Server error ${response.status}. Terminal me exact error check karo.`,

    );

  }

  return response.json() as Promise<T>;

}

const normalizeColor = (value: string | undefined) =>

  String(value ?? "")

    .trim()

    .toLowerCase()

    .replace(/\s+/g, " ");

const isCouponEligibleColor = (value: string | undefined) => {

  const normalized = normalizeColor(value);

  return (

    normalized === "airforce blue" ||

    normalized === "airforce" ||

    normalized === "royal blue" ||

    normalized === "black" ||

    normalized === "wine" ||

    normalized === "olive" ||

    normalized === "mediterranean olive"

  );

};

/** Coupon eligibility is limited to the five scrub colours in the catalogue. */
const isCouponEligibleItem = (item: { productId: string; color?: string }) => {
  const product = products.find((currentProduct) => currentProduct.id === item.productId);

  return product?.productType === "scrub" && isCouponEligibleColor(item.color);
};

export default function CheckoutPage() {

  const router = useRouter();

  const { user } = useAuth();

  const {

    cart,

    cartCount,

    clearCart,

  } = useCart();

  const [form, setForm] =

    useState<CheckoutForm>(initialForm);

  const [errors, setErrors] =

    useState<CheckoutErrors>({});

  const [paymentMethod, setPaymentMethod] =

    useState<PaymentMethod>("prepaid");

  const [isSubmitting, setIsSubmitting] =

    useState(false);

  const [couponCode, setCouponCode] =

    useState("");

  const [appliedCoupon, setAppliedCoupon] =

    useState("");

  const [couponMessage, setCouponMessage] =

    useState("");

  // Prevent duplicate tracking when React re-renders the checkout page.
  const hasTrackedInitiateCheckoutRef = useRef(false);
  const purchaseTrackedOrderIdsRef = useRef<Set<string>>(new Set());

  /*

   * Logged-in customer ki basic details prefill hongi.

   * Guest checkout par koi restriction nahi hai.

   */

  useEffect(() => {

    if (!user) {

      return;

    }

    setForm((currentForm) => ({

      ...currentForm,

      fullName: currentForm.fullName || user.name || "",

      phone: currentForm.phone || user.phone || "",

      email: currentForm.email || user.email || "",

    }));

  }, [user]);

  /*

   * Coupon cart se checkout par automatically carry hota hai.

   * Agar customer ne cart me SHUBHAM10 apply kiya hai,

   * checkout par dobara coupon box nahi dikhayenge.

   */

  useEffect(() => {

    if (typeof window === "undefined") {

      return;

    }

    const savedCoupon =

      window.sessionStorage.getItem(

        "krinay_applied_coupon",

      );

    if (savedCoupon !== "SHUBHAM10") {

      return;

    }

    const hasEligibleItem = cart.some((item) =>

      isCouponEligibleItem(item),

    );

    if (!hasEligibleItem) {

      window.sessionStorage.removeItem(

        "krinay_applied_coupon",

      );

      return;

    }

    setCouponCode("SHUBHAM10");

    setAppliedCoupon("SHUBHAM10");

    setCouponMessage(

      "Coupon applied — 10% off on eligible scrubs.",

    );

  }, [cart]);

  const getCheckoutUnitPrice = (item: (typeof cart)[number]) => {

    const scrubPrices: Record<

      string,

      { set: number; top: number; bottom: number }

    > = {

      "royal blue": {

        set: 1599,

        top: 799,

        bottom: 800,

      },

      "airforce blue": {

        set: 1899,

        top: 949,

        bottom: 950,

      },

      airforce: {

        set: 1899,

        top: 949,

        bottom: 950,

      },

      black: {

        set: 1899,

        top: 949,

        bottom: 950,

      },

      wine: {

        set: 1899,

        top: 949,

        bottom: 950,

      },

      olive: {

        set: 1899,

        top: 949,

        bottom: 950,

      },

    };

    const colorPrice =

      scrubPrices[normalizeColor(item.color)];

    if (colorPrice) {

      const base =

        item.purchaseType === "top"

          ? colorPrice.top

          : item.purchaseType === "bottom"

            ? colorPrice.bottom

            : colorPrice.set;

      /*

       * Keep the same XXL surcharge used by the

       * product page and server-side order pricing.

       */

      let sizeSurcharge = 0;

      if (item.purchaseType === "set") {

        const topXXL = item.topSize === "XXL";

        const bottomXXL = item.bottomSize === "XXL";

        if (topXXL || bottomXXL) {

          sizeSurcharge = 250;

        }

      } else if (

        item.purchaseType === "top" &&

        (item.topSize || item.size) === "XXL"

      ) {

        sizeSurcharge = 150;

      } else if (

        item.purchaseType === "bottom" &&

        (item.bottomSize || item.size) === "XXL"

      ) {

        sizeSurcharge = 100;

      } else if (

        !item.purchaseType &&

        item.size === "XXL"

      ) {

        sizeSurcharge = 90;

      }

      const embroideryPrice =

        item.embroidery?.enabled

          ? item.embroidery.price ?? 0

          : 0;

      return (

        base +

        sizeSurcharge +

        embroideryPrice

      );

    }

    return item.price;

  };

  const checkoutDisplayItems =

    useMemo(() => {

      return cart.flatMap((item) => {

        const embroideryPrice =

          item.embroidery?.enabled

            ? item.embroidery.price ?? 0

            : 0;

        const productBasePrice =

          getCheckoutUnitPrice(item) -

          embroideryPrice;

        const embroideryLine =

          embroideryPrice > 0

            ? [

                {

                  key: `${item.cartKey || item.productId}-embroidery`,

                  name: "Custom Embroidery",

                  type:

                    item.embroidery?.mode === "bundle"

                      ? "Embroidery Bundle"

                      : item.embroidery?.mode === "bottom"

                        ? "Bottom Embroidery"

                        : "Top Embroidery",

                  size: [

                    item.embroidery?.line1,

                    item.embroidery?.line2,

                    item.embroidery?.selectedIconLabel,

                  ]

                    .filter(Boolean)

                    .join(" • "),

                  color:

                    item.embroidery?.textColor ?? "",

                  image: item.image,

                  quantity: item.quantity,

                  price: embroideryPrice,

                },

              ]

            : [];

        if (item.purchaseType !== "set") {

          return [

            {

              key:

                item.cartKey ||

                `${item.productId}-${item.purchaseType}-${item.size}`,

              name: item.name,

              type:

                item.purchaseType === "top"

                  ? "Top"

                  : item.purchaseType === "bottom"

                    ? "Bottom"

                    : "",

              size:

                item.purchaseType === "top"

                  ? item.topSize || item.size

                  : item.purchaseType === "bottom"

                    ? item.bottomSize || item.size

                    : item.size,

              color: item.color,

              image: item.image,

              quantity: item.quantity,

              price: productBasePrice,

            },

            ...embroideryLine,

          ];

        }

        /*

         * Complete set ko invoice-style clarity ke liye

         * Top + Bottom me split karte hain. Embroidery

         * same cart item ka addon hai aur separate line

         * me show hoti hai, lekin order ek hi rehta hai.

         */

        const topPrice =

          Math.floor(productBasePrice / 2);

        const bottomPrice =

          productBasePrice - topPrice;

        return [

          {

            key: `${item.cartKey || item.productId}-set-top`,

            name: `${item.name} - Top`,

            type: "Top",

            size: item.topSize || "",

            color: item.color,

            image: item.image,

            quantity: item.quantity,

            price: topPrice,

          },

          {

            key: `${item.cartKey || item.productId}-set-bottom`,

            name: `${item.name} - Bottom`,

            type: "Bottom",

            size: item.bottomSize || "",

            color: item.color,

            image: item.image,

            quantity: item.quantity,

            price: bottomPrice,

          },

          ...embroideryLine,

        ];

      });

    }, [cart]);

  const effectiveSubtotal = useMemo(() => {

    return cart.reduce(

      (sum, item) =>

        sum +

        getCheckoutUnitPrice(item) *

          item.quantity,

      0,

    );

  }, [cart]);

  const couponEligibleSubtotal = useMemo(() => {

    if (appliedCoupon !== "SHUBHAM10") {

      return 0;

    }

    return cart.reduce((sum, item) => {

      if (!isCouponEligibleItem(item)) {

        return sum;

      }

      return (

        sum +

        getCheckoutUnitPrice(item) *

          item.quantity

      );

    }, 0);

  }, [cart, appliedCoupon]);

  const couponDiscount =

    Math.round(

      ((couponEligibleSubtotal * 10) /

        100) *

        100,

    ) /

    100;

  const shippingCharge = useMemo(() => {

    if (

      effectiveSubtotal === 0 ||

      effectiveSubtotal >= 999

    ) {

      return 0;

    }

    return 99;

  }, [effectiveSubtotal]);

  /*

   * Product prices GST-inclusive hain.

   * Coupon discount ke baad GST breakdown show hota hai.

   */

  const gstIncluded = useMemo(() => {

    const discountedSubtotal =

      Math.max(

        effectiveSubtotal -

          couponDiscount,

        0,

      );

    return Math.round(

      (discountedSubtotal * 5) /

        105,

    );

  }, [effectiveSubtotal, couponDiscount]);

  const total =

    Math.max(

      effectiveSubtotal -

        couponDiscount,

      0,

    ) + shippingCharge;

  useEffect(() => {
    if (cart.length === 0 || hasTrackedInitiateCheckoutRef.current) {
      return;
    }

    hasTrackedInitiateCheckoutRef.current = true;

    trackEvent("InitiateCheckout", {
      value: Number(total),
      currency: "INR",
      num_items: Number(cartCount),
    });
  }, [cart.length, cartCount, total]);

  const applyCoupon = () => {

    const normalized =

      couponCode.trim().toUpperCase();

    if (!normalized) {

      setAppliedCoupon("");

      setCouponMessage(

        "Please enter a coupon code.",

      );

      return;

    }

    if (normalized !== "SHUBHAM10") {

      setAppliedCoupon("");

      setCouponMessage(

        "Invalid coupon code.",

      );

      return;

    }

    const hasEligibleItem = cart.some((item) =>

      isCouponEligibleItem(item),

    );

    if (!hasEligibleItem) {

      setAppliedCoupon("");

      setCouponMessage(

        "SHUBHAM10 is valid only on all scrub colours.",

      );

      return;

    }

    setCouponCode("SHUBHAM10");

    setAppliedCoupon("SHUBHAM10");

    setCouponMessage(

      "Coupon applied — 10% off on eligible scrubs.",

    );

    if (typeof window !== "undefined") {

      window.sessionStorage.setItem(

        "krinay_applied_coupon",

        "SHUBHAM10",

      );

    }

  };

  const removeCoupon = () => {

    setAppliedCoupon("");

    setCouponMessage("");

    setCouponCode("");

    if (typeof window !== "undefined") {

      window.sessionStorage.removeItem(

        "krinay_applied_coupon",

      );

    }

  };

  const handleChange = (

    event: ChangeEvent<

      HTMLInputElement | HTMLSelectElement

    >,

  ) => {

    const { name, value } = event.target;

    setForm((currentForm) => ({

      ...currentForm,

      [name]: value,

    }));

    if (errors[name as keyof CheckoutForm]) {

      setErrors((currentErrors) => ({

        ...currentErrors,

        [name]: undefined,

      }));

    }

  };

  const validateForm = () => {

    const nextErrors: CheckoutErrors = {};

    if (form.fullName.trim().length < 3) {

      nextErrors.fullName =

        "Please enter your full name.";

    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {

      nextErrors.phone =

        "Enter a valid 10-digit Indian mobile number.";

    }

    if (

      form.email.trim() &&

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

        form.email.trim(),

      )

    ) {

      nextErrors.email =

        "Enter a valid email address.";

    }

    if (form.addressLine1.trim().length < 8) {

      nextErrors.addressLine1 =

        "Enter your complete house, building and street address.";

    }

    if (form.city.trim().length < 2) {

      nextErrors.city = "Enter your city.";

    }

    if (!form.state) {

      nextErrors.state = "Select your state.";

    }

    if (!/^\d{6}$/.test(form.pinCode.trim())) {

      nextErrors.pinCode =

        "Enter a valid 6-digit PIN code.";

    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;

  };

  const openRazorpayCheckout = async ({

    krinayOrderId,

    orderNumber,

  }: OpenRazorpayCheckoutInput) => {

    /*

     * Razorpay browser SDK load karo.

     */

    const scriptLoaded =

      await loadRazorpayScript();

    if (!scriptLoaded || !window.Razorpay) {

      throw new Error(

        "Razorpay Checkout load nahi hua. Internet check karke page refresh karo.",

      );

    }

    const publicKey =

      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!publicKey) {

      throw new Error(

        "NEXT_PUBLIC_RAZORPAY_KEY_ID missing hai. .env.local check karke npm server restart karo.",

      );

    }

    /*

     * MongoDB order se Razorpay order create karo.

     */

    const createPaymentResponse = await fetch(

      "/api/payments/create-order",

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          krinayOrderId,

        }),

      },

    );

    const paymentData =

      await readApiResponse<CreatePaymentApiResponse>(

        createPaymentResponse,

      );

    if (

      !createPaymentResponse.ok ||

      !paymentData.success ||

      !paymentData.razorpayOrder

    ) {

      throw new Error(

        paymentData.message ||

          "Razorpay payment order create nahi ho paya.",

      );

    }

    const amount = Number(

      paymentData.razorpayOrder.amount,

    );

    if (!Number.isFinite(amount) || amount <= 0) {

      throw new Error(

        "Razorpay payment amount invalid hai.",

      );

    }

    const options: RazorpayOptions = {

      key: publicKey,

      amount,

      currency:

        paymentData.razorpayOrder.currency ||

        "INR",

      name: "Krinay Scrubs",

      description: `Payment for ${orderNumber}`,

      order_id:

        paymentData.razorpayOrder.id,

      prefill: {

        name: form.fullName.trim(),

        email: form.email.trim(),

        contact: form.phone.trim(),

      },

      notes: {

        krinayOrderId,

        orderNumber,

      },

      theme: {

        color: "#922424",

      },

      modal: {

        escape: true,

        backdropclose: false,

        ondismiss() {

          setIsSubmitting(false);

          toast.error(

            "Payment was not completed. Your order is still pending.",

          );

        },

      },

      handler: async (

        paymentResponse: RazorpayPaymentResponse,

      ) => {

        try {

          const verifyResponse = await fetch(

            "/api/payments/verify",

            {

              method: "POST",

              headers: {

                "Content-Type":

                  "application/json",

              },

              body: JSON.stringify({

                krinayOrderId,

                razorpayOrderId:

                  paymentResponse

                    .razorpay_order_id,

                razorpayPaymentId:

                  paymentResponse

                    .razorpay_payment_id,

                razorpaySignature:

                  paymentResponse

                    .razorpay_signature,

              }),

            },

          );

          const verifyResult =

            await readApiResponse<VerifyPaymentApiResponse>(

              verifyResponse,

            );

          if (

            !verifyResponse.ok ||

            !verifyResult.success ||

            !verifyResult.order

          ) {

            throw new Error(

              verifyResult.message ||

                "Payment verification failed.",

            );

          }

          /*
           * Purchase is sent only after the server confirms Razorpay payment.
           * Amount comes from the server-created Krinay order response, while
           * product IDs come from the cart items associated with this checkout.
           * No customer name, phone, email, or address is included.
           */
          const verifiedOrder = verifyResult.order;
          const verifiedOrderId = String(
            verifiedOrder.id || verifiedOrder.orderNumber,
          ).trim();
          const purchaseStorageKey = `krinay_meta_purchase_${verifiedOrderId}`;
          const purchaseValue = Number(paymentData.krinayOrder?.total);
          const purchaseContentIds = Array.from(
            new Set(
              cart
                .map((item) => String(item.productId ?? "").trim())
                .filter(Boolean),
            ),
          );

          let purchaseAlreadyTracked =
            purchaseTrackedOrderIdsRef.current.has(verifiedOrderId);
          try {
            purchaseAlreadyTracked =
              purchaseAlreadyTracked ||
              window.sessionStorage.getItem(purchaseStorageKey) === "1";
          } catch {
            // Storage may be unavailable in privacy-restricted browsers.
          }

          if (
            !purchaseAlreadyTracked &&
            verifiedOrderId &&
            Number.isFinite(purchaseValue) &&
            purchaseValue > 0 &&
            purchaseContentIds.length > 0
          ) {
            purchaseTrackedOrderIdsRef.current.add(verifiedOrderId);
            let purchaseGuardStored = false;
            try {
              window.sessionStorage.setItem(purchaseStorageKey, "1");
              purchaseGuardStored = true;
            } catch {
              // In-memory guard remains active if storage is unavailable.
            }

            const purchaseEventTracked = trackEvent("Purchase", {
              value: purchaseValue,
              currency: "INR",
              content_ids: purchaseContentIds,
              content_type: "product",
            });

            if (!purchaseEventTracked) {
              purchaseTrackedOrderIdsRef.current.delete(verifiedOrderId);
              if (purchaseGuardStored) {
                try {
                  window.sessionStorage.removeItem(purchaseStorageKey);
                } catch {
                  // Ignore cleanup errors; payment success must not be affected.
                }
              }
            }
          } else if (!purchaseAlreadyTracked) {
            console.warn(
              "[Meta Pixel] Purchase event skipped because verified order tracking data is incomplete.",
              {
                orderId: verifiedOrderId,
                hasValidTotal: Number.isFinite(purchaseValue) && purchaseValue > 0,
                productIdCount: purchaseContentIds.length,
              },
            );
          }


          toast.success(

            `Payment successful. Order ${verifyResult.order.orderNumber} confirmed.`,

          );

          clearCart();

          if (typeof window !== "undefined") {

            window.sessionStorage.removeItem(

              "krinay_applied_coupon",

            );

          }

          router.push(

  `/order-success?orderNumber=${encodeURIComponent(

    verifyResult.order.orderNumber,

  )}&token=${encodeURIComponent(

    verifyResult.order.invoiceAccessToken,

  )}`,

);

        } catch (error) {

          console.error(

            "Payment verification error:",

            error,

          );

          toast.error(

            error instanceof Error

              ? error.message

              : "Payment verification failed.",

          );

        } finally {

          setIsSubmitting(false);

        }

      },

    };

    const razorpayInstance =

      new window.Razorpay(options);

    razorpayInstance.on(

      "payment.failed",

      (

        failureResponse: RazorpayFailureResponse,

      ) => {

        console.error(

          "Razorpay payment failed:",

          failureResponse,

        );

        setIsSubmitting(false);

        toast.error(

          failureResponse.error?.description ||

            "Payment failed. Please try again.",

        );

      },

    );

    razorpayInstance.open();

  };

  const handleSubmit = async (

    event: FormEvent<HTMLFormElement>,

  ) => {

    event.preventDefault();

    if (isSubmitting) {

      return;

    }

    if (cart.length === 0) {

      toast.error("Your cart is empty.");

      router.push("/shop");

      return;

    }

    if (!validateForm()) {

      toast.error(

        "Please check the highlighted fields.",

      );

      return;

    }

    setIsSubmitting(true);

    try {

      /*

       * Order pehle MongoDB me pending status ke saath

       * create hoga.

       */

      const response = await fetch("/api/orders", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          customer: {

            fullName: form.fullName.trim(),

            phone: form.phone.trim(),

            email: form.email.trim(),

            addressLine1:

              form.addressLine1.trim(),

            addressLine2:

              form.addressLine2.trim(),

            landmark: form.landmark.trim(),

            city: form.city.trim(),

            state: form.state,

            pinCode: form.pinCode.trim(),

          },

          paymentMethod,

          couponCode: appliedCoupon || undefined,

          items: cart,

        }),

      });

      const result =

        await readApiResponse<CreateOrderApiResponse>(

          response,

        );

      if (

        !response.ok ||

        !result.success ||

        !result.order

      ) {

        throw new Error(

          result.message ||

            "Order create nahi ho paya.",

        );

      }

      /*

       * Prepaid payment:

       * Razorpay popup open hoga.

       */

      if (paymentMethod === "prepaid") {

        await openRazorpayCheckout({

          krinayOrderId: result.order.id,

          orderNumber:

            result.order.orderNumber,

        });

        /*

         * Yahan setIsSubmitting(false) nahi karna.

         * Razorpay handler, dismiss ya failure callback

         * state reset karega.

         */

        return;

      }

      /*

       * COD order successful.

       */

      toast.success(

        `COD order ${result.order.orderNumber} placed successfully.`,

      );

      clearCart();

      if (typeof window !== "undefined") {

        window.sessionStorage.removeItem(

          "krinay_applied_coupon",

        );

      }

      router.push(

  `/order-success?orderNumber=${encodeURIComponent(

    result.order.orderNumber,

  )}&token=${encodeURIComponent(

    result.order.invoiceAccessToken,

  )}`,

);

    } catch (error) {

      console.error("Checkout failed:", error);

      toast.error(

        error instanceof Error

          ? error.message

          : "Something went wrong. Please try again.",

      );

      setIsSubmitting(false);

    }

  };

  if (cart.length === 0) {

    return (

      <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-20">

        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">

            <ShoppingBag size={42} />

          </div>

          <h1 className="mt-7 text-3xl font-black text-slate-950">

            Your cart is empty

          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">

            Checkout continue karne se pehle cart me

            product add karein.

          </p>

          <Link

            href="/shop"

            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"

          >

            <ArrowLeft size={18} />

            Go to Shop

          </Link>

        </div>

      </section>

    );

  }

  return (

    <>

      <section className="border-b border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">

          <Link

            href="/"

            className="hover:text-[#922424]"

          >

            Home

          </Link>

          <span className="mx-2">/</span>

          <Link

            href="/cart"

            className="hover:text-[#922424]"

          >

            Cart

          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-slate-900">

            Checkout

          </span>

        </div>

      </section>

      <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        <div className="mx-auto max-w-7xl">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#922424]">

              Secure Checkout

            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">

              Delivery and payment

            </h1>

            <p className="mt-3 text-sm text-slate-500">

              Complete your delivery details to place

              the order.

            </p>

          </div>

          {user ? (

            <Link

              href="/account"

              className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#eadada] bg-[#fff7f7] p-4 transition hover:border-[#922424]"

            >

              <span className="flex items-start gap-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#922424] text-white">

                  <UserRound size={18} />

                </span>

                <span>

                  <span className="block text-sm font-black text-slate-950">

                    Logged in as {user.name}

                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">

                    Current wallet: {user.points} points. Qualifying ₹1,599+

                    order par 100 points milenge.

                  </span>

                </span>

              </span>

              <span className="shrink-0 text-xs font-black text-[#922424]">

                My Account →

              </span>

            </Link>

          ) : (

            <div className="mt-6 rounded-2xl border border-[#eadada] bg-[#fff7f7] p-4">

              <div className="flex items-start gap-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#922424] text-white">

                  <Gift size={19} />

                </span>

                <div className="flex-1">

                  <p className="text-sm font-black text-slate-950">

                    Create an account & get 100 welcome points

                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">

                    Login optional hai — guest checkout continue kar sakte ho.

                    Account se order history, wishlist aur rewards wallet milega.

                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <Link

                      href="/register?next=/checkout"

                      className="rounded-full bg-[#922424] px-4 py-2 text-xs font-black text-white"

                    >

                      Create Account +100 Points

                    </Link>

                    <Link

                      href="/login?next=/checkout"

                      className="rounded-full border border-[#922424] px-4 py-2 text-xs font-black text-[#922424]"

                    >

                      Login

                    </Link>

                  </div>

                </div>

              </div>

            </div>

          )}

          <form

            onSubmit={handleSubmit}

            noValidate

            className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]"

          >

            <div className="space-y-7">

              {/* Contact information */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">

                    <Package size={21} />

                  </div>

                  <div>

                    <h2 className="text-lg font-black text-slate-950">

                      Contact information

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                      Order confirmation and delivery

                      updates ke liye.

                    </p>

                  </div>

                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                  <FormField

                    label="Full name"

                    name="fullName"

                    value={form.fullName}

                    onChange={handleChange}

                    placeholder="Enter your full name"

                    error={errors.fullName}

                    required

                  />

                  <FormField

                    label="Mobile number"

                    name="phone"

                    value={form.phone}

                    onChange={handleChange}

                    placeholder="10-digit mobile number"

                    inputMode="numeric"

                    maxLength={10}

                    error={errors.phone}

                    required

                  />

                  <div className="sm:col-span-2">

                    <FormField

                      label="Email address"

                      name="email"

                      type="email"

                      value={form.email}

                      onChange={handleChange}

                      placeholder="Optional email address"

                      error={errors.email}

                    />

                  </div>

                </div>

              </section>

              {/* Shipping address */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">

                    <MapPin size={21} />

                  </div>

                  <div>

                    <h2 className="text-lg font-black text-slate-950">

                      Shipping address

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                      Courier pickup approval ke baad isi

                      address par delivery hogi.

                    </p>

                  </div>

                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">

                    <FormField

                      label="House, building and street"

                      name="addressLine1"

                      value={form.addressLine1}

                      onChange={handleChange}

                      placeholder="House no., building, street or area"

                      error={errors.addressLine1}

                      required

                    />

                  </div>

                  <div className="sm:col-span-2">

                    <FormField

                      label="Apartment, floor or locality"

                      name="addressLine2"

                      value={form.addressLine2}

                      onChange={handleChange}

                      placeholder="Optional additional address"

                    />

                  </div>

                  <FormField

                    label="Landmark"

                    name="landmark"

                    value={form.landmark}

                    onChange={handleChange}

                    placeholder="Optional landmark"

                  />

                  <FormField

                    label="City"

                    name="city"

                    value={form.city}

                    onChange={handleChange}

                    placeholder="Enter city"

                    error={errors.city}

                    required

                  />

                  <div>

                    <label

                      htmlFor="state"

                      className="mb-2 block text-sm font-bold text-slate-800"

                    >

                      State{" "}

                      <span className="text-red-500">

                        *

                      </span>

                    </label>

                    <select

                      id="state"

                      name="state"

                      value={form.state}

                      onChange={handleChange}

                      className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition ${

                        errors.state

                          ? "border-red-400 focus:border-red-500"

                          : "border-slate-300 focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"

                      }`}

                    >

                      <option value="">

                        Select state

                      </option>

                      {indianStates.map((state) => (

                        <option

                          key={state}

                          value={state}

                        >

                          {state}

                        </option>

                      ))}

                    </select>

                    {errors.state && (

                      <p className="mt-2 text-xs font-medium text-red-600">

                        {errors.state}

                      </p>

                    )}

                  </div>

                  <FormField

                    label="PIN code"

                    name="pinCode"

                    value={form.pinCode}

                    onChange={handleChange}

                    placeholder="6-digit PIN code"

                    inputMode="numeric"

                    maxLength={6}

                    error={errors.pinCode}

                    required

                  />

                </div>

              </section>

              {/* Payment method */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">

                    <CreditCard size={21} />

                  </div>

                  <div>

                    <h2 className="text-lg font-black text-slate-950">

                      Payment method

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                      Select how you want to pay.

                    </p>

                  </div>

                </div>

                <div className="mt-7 space-y-4">

                  <PaymentOption

                    selected={

                      paymentMethod === "prepaid"

                    }

                    title="Pay online"

                    description="UPI, debit card, credit card or net banking through Razorpay."

                    icon={

                      <CreditCard size={22} />

                    }

                    onClick={() =>

                      setPaymentMethod("prepaid")

                    }

                  />

                  <PaymentOption

                    selected={

                      paymentMethod === "cod"

                    }

                    title="Cash on Delivery"

                    description="Pay when the order reaches your delivery address."

                    icon={<Truck size={22} />}

                    onClick={() => setPaymentMethod("cod")}

                  />

                </div>

              </section>

            </div>

            {/* Order summary */}

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-28">

              <h2 className="text-xl font-black text-slate-950">

                Order summary

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                {cartCount}{" "}

                {cartCount === 1 ? "item" : "items"}

              </p>

              <div className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">

                {checkoutDisplayItems.map(

  (item) => (

    <article

      key={item.key}

      className="flex gap-3 border-b border-slate-100 pb-4"

    >

      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[#fff0f0]">

        {/* eslint-disable-next-line @next/next/no-img-element */}

        <img

          src={item.image}

          alt={item.name}

          className="h-full w-full object-cover object-top"

        />

      </div>

      <div className="min-w-0 flex-1">

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">

          {item.name}

        </h3>

        <p className="mt-1 text-xs text-slate-500">

          {item.type &&

            `${item.type}: `}

          {item.size}

          {" · "}

          {item.color}

          {" · Qty "}

          {item.quantity}

        </p>

        <p className="mt-1 text-sm font-black text-[#922424]">

          ₹

          {(

            item.price *

            item.quantity

          ).toLocaleString(

            "en-IN",

          )}

        </p>

      </div>

    </article>

  ),

)}

              </div>

              {appliedCoupon ? (

                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-sm font-black text-emerald-800">

                        Coupon applied

                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-700">

                        10% discount has been applied to eligible scrubs.

                      </p>

                    </div>

                    <button

                      type="button"

                      onClick={removeCoupon}

                      className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-black text-emerald-800"

                    >

                      Remove

                    </button>

                  </div>

                </div>

              ) : (

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <Gift size={18} className="text-[#922424]" />

                    <span className="text-sm font-black text-slate-950">

                      Coupon code

                    </span>

                  </div>

                  <div className="mt-3 flex gap-2">

                    <input

                      value={couponCode}

                      onChange={(event) => {

                        setCouponCode(

                          event.target.value.toUpperCase(),

                        );

                        setCouponMessage("");

                      }}

                      onKeyDown={(event) => {

                        if (event.key === "Enter") {

                          event.preventDefault();

                          applyCoupon();

                        }

                      }}

                      placeholder="Enter coupon code"

                      maxLength={30}

                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold uppercase text-slate-900 outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"

                    />

                    <button

                      type="button"

                      onClick={applyCoupon}

                      className="rounded-xl bg-[#922424] px-4 py-3 text-xs font-black text-white transition hover:bg-[#701a1a]"

                    >

                      Apply

                    </button>

                  </div>

                  {couponMessage && (

                    <p className="mt-2 text-xs font-bold text-red-600">

                      {couponMessage}

                    </p>

                  )}

                </div>

              )}

              <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 text-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">

                    Subtotal

                  </span>

                  <span className="font-bold text-slate-900">

                    ₹

                    {effectiveSubtotal.toLocaleString("en-IN")}

                  </span>

                </div>

                {appliedCoupon && couponDiscount > 0 && (

                  <div className="flex justify-between gap-4">

                    <span className="text-slate-500">

                      Coupon Discount

                    </span>

                    <span className="font-bold text-emerald-600">

                      -₹{couponDiscount.toLocaleString("en-IN", {

                        minimumFractionDigits: couponDiscount % 1 ? 2 : 0,

                        maximumFractionDigits: 2,

                      })}

                    </span>

                  </div>

                )}

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">

                    Shipping

                  </span>

                  {shippingCharge === 0 ? (

                    <span className="font-bold text-emerald-600">

                      FREE

                    </span>

                  ) : (

                    <span className="font-bold text-slate-900">

                      ₹

                      {shippingCharge.toLocaleString(

                        "en-IN",

                      )}

                    </span>

                  )}

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">

                    Included GST (5%)

                  </span>

                  <span className="font-bold text-slate-900">

                    ₹

                    {gstIncluded.toLocaleString(

                      "en-IN",

                    )}

                  </span>

                </div>

                <div className="flex justify-between gap-4 border-t border-slate-200 pt-5 text-lg">

                  <span className="font-black text-slate-950">

                    Total

                  </span>

                  <span className="font-black text-[#922424]">

                    ₹{total.toLocaleString("en-IN", {

                      minimumFractionDigits: total % 1 ? 2 : 0,

                      maximumFractionDigits: 2,

                    })}

                  </span>

                </div>

              </div>

              <button

                type="submit"

                disabled={isSubmitting}

                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:bg-slate-400"

              >

                {isSubmitting ? (

                  "Processing..."

                ) : paymentMethod === "prepaid" ? (

                  <>

                    <LockKeyhole size={18} />

                    Proceed to Payment

                  </>

                ) : (

                  <>

                    <Check size={18} />

                    Place COD Order

                  </>

                )}

              </button>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-4">

                <LockKeyhole

                  size={17}

                  className="mt-0.5 shrink-0 text-emerald-600"

                />

                <p className="text-xs leading-5 text-slate-500">

                  Shipment Shiprocket me tabhi create

                  hoga jab admin order ko manually approve

                  karega.

                </p>

              </div>

              <Link

                href="/cart"

                className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-[#922424]"

              >

                <ArrowLeft size={17} />

                Return to Cart

              </Link>

            </aside>

          </form>

        </div>

      </section>

    </>

  );

}

type FormFieldProps = {

  label: string;

  name: keyof CheckoutForm;

  value: string;

  placeholder: string;

  onChange: (

    event: ChangeEvent<

      HTMLInputElement | HTMLSelectElement

    >,

  ) => void;

  type?: string;

  inputMode?: "text" | "email" | "numeric" | "tel";

  maxLength?: number;

  error?: string;

  required?: boolean;

};

function FormField({

  label,

  name,

  value,

  placeholder,

  onChange,

  type = "text",

  inputMode = "text",

  maxLength,

  error,

  required = false,

}: FormFieldProps) {

  return (

    <div>

      <label

        htmlFor={name}

        className="mb-2 block text-sm font-bold text-slate-800"

      >

        {label}

        {required && (

          <span className="text-red-500">

            {" "}

            *

          </span>

        )}

      </label>

      <input

        id={name}

        name={name}

        type={type}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        inputMode={inputMode}

        maxLength={maxLength}

        className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${

          error

            ? "border-red-400 focus:border-red-500"

            : "border-slate-300 focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"

        }`}

      />

      {error && (

        <p className="mt-2 text-xs font-medium text-red-600">

          {error}

        </p>

      )}

    </div>

  );

}

type PaymentOptionProps = {

  selected: boolean;

  title: string;

  description: string;

  icon: ReactNode;

  onClick: () => void;

};

function PaymentOption({

  selected,

  title,

  description,

  icon,

  onClick,

}: PaymentOptionProps) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${

        selected

          ? "border-[#922424] bg-[#fff7f7] ring-2 ring-[#f2dddd]"

          : "border-slate-200 bg-white hover:border-slate-400"

      }`}

    >

      <span

        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${

          selected

            ? "bg-[#922424] text-white"

            : "bg-slate-100 text-slate-600"

        }`}

      >

        {icon}

      </span>

      <span className="flex-1">

        <span className="block text-sm font-black text-slate-950">

          {title}

        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">

          {description}

        </span>

      </span>

      <span

        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${

          selected

            ? "border-[#922424] bg-[#922424] text-white"

            : "border-slate-300"

        }`}

      >

        {selected && <Check size={13} />}

      </span>

    </button>

  );

}
