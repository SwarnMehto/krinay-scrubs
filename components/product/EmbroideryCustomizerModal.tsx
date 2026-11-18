"use client";

import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  Phone,
  Scissors,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import toast from "react-hot-toast";

import type {
  CartEmbroidery,
  EmbroideryFont,
  EmbroideryMode,
  EmbroideryTextColor,
} from "@/types/cart";

type EmbroideryCustomizerModalProps = {
  open: boolean;
  onClose: () => void;
  productName: string;

  /*
   * Kept for compatibility with existing ProductDetailsClient.
   * It is NOT used as the embroidery preview image.
   */
  productImage: string;

  productColor?: string;
  initialValue?: CartEmbroidery;
  onProceed: (value: CartEmbroidery) => void;
};

type EmbroideryEnquiryResponse = {
  success: boolean;
  message?: string;
  emailId?: string;
};

type UploadResponse = {
  success: boolean;
  message?: string;
  file?: {
    url: string;
    publicId: string;
    fileName: string;
  };
};

type EmbroideryTextSize =
  | "small"
  | "medium"
  | "large";

const TEXT_SIZE_PX: Record<
  EmbroideryTextSize,
  number
> = {
  small: 12,
  medium: 16,
  large: 20,
};

const EMBROIDERY_TEXT_MAX_LENGTH = 35;

const TOP_PRICE = 299;
const BOTTOM_PRICE = 149;
const LOGO_PRICE = 250;
const BUNDLE_PRICE = 448;
const BOTTOM_ADDON_PRICE = 99;

/* =========================================================
   EMBROIDERY IMAGE MAPPING
   ========================================================= */

const EMBROIDERY_IMAGE_BASE =
  "/images/embroidery";

const EMBROIDERY_DEFAULT_IMAGE =
  `${EMBROIDERY_IMAGE_BASE}/scrub-preview.jpg`;

type EmbroideryGender = "female" | "male";

type EmbroideryColour =
  | "airforceblue"
  | "royalblue"
  | "black"
  | "wine"
  | "olive";

function normalizeText(value: string = "") {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Detect female/male from the actual product name.
 */
function detectGender(
  productName: string,
): EmbroideryGender | null {
  const name = normalizeText(productName);

  if (
    /\b(women|women's|womens|female|girl|ladies|lady)\b/.test(
      name,
    )
  ) {
    return "female";
  }

  if (
    /\b(men|men's|mens|male|boy|gentlemen|gentleman)\b/.test(
      name,
    )
  ) {
    return "male";
  }

  return null;
}

/*
 * Detect colour from product colour first,
 * then product name as fallback.
 */
function detectColour(
  productColor: string,
  productName: string,
): EmbroideryColour | null {
  const colourText = normalizeText(
    `${productColor} ${productName}`,
  );

  if (
    colourText.includes("airforce blue") ||
    colourText.includes("air force blue") ||
    colourText.includes("airforceblue")
  ) {
    return "airforceblue";
  }

  if (
    colourText.includes("royal blue") ||
    colourText.includes("royalblue")
  ) {
    return "royalblue";
  }

  if (colourText.includes("black")) {
    return "black";
  }

  if (colourText.includes("wine")) {
    return "wine";
  }

  if (
    colourText.includes("olive") ||
    colourText.includes("mediterranean olive") ||
    colourText.includes("mediterrarian olive")
  ) {
    return "olive";
  }

  return null;
}

/*
 * Detect whether this is an apron/lab coat product.
 */
function isApronProduct(
  productName: string,
): boolean {
  const name = normalizeText(productName);

  return (
    name.includes("apron") ||
    name.includes("lab coat") ||
    name.includes("labcoat") ||
    name.includes("doctor coat") ||
    name.includes("doctor's coat")
  );
}

/*
 * Main automatic preview resolver.
 *
 * Examples:
 *
 * Women's Athletic Scrub Set + Wine
 * -> /images/embroidery/f-wine.jpg
 *
 * Men's Athletic Scrub Set + Black
 * -> /images/embroidery/m-black.jpg
 *
 * Women's Lab Coat
 * -> /images/embroidery/f-apron.jpg
 *
 * Men's Lab Coat
 * -> /images/embroidery/m-apron.jpg
 */
function getEmbroideryPreviewImage(
  productName: string,
  productColor: string
): string {
  const name = productName.toLowerCase();
  const colour = productColor.toLowerCase();

  /*
   * IMPORTANT:
   * Apron male/female product names are identical.
   * Therefore gender must be detected from the product URL.
   *
   * Female:
   * /product/flex-u-premium-medical-apron-female
   *
   * Male:
   * /product/flex-u-premium-medical-apron-male
   */
  const pathname =
    typeof window !== "undefined"
      ? window.location.pathname.toLowerCase()
      : "";

  const isFemale =
    pathname.includes("-female") ||
    pathname.includes("womens-") ||
    pathname.includes("women-");

  const isMale =
    pathname.includes("-male") ||
    pathname.includes("mens-") ||
    pathname.includes("men-");

  /*
   * =========================
   * APRON / LAB COAT
   * =========================
   */
  if (
    name.includes("apron") ||
    name.includes("lab coat") ||
    name.includes("labcoat")
  ) {
    // Explicit male URL → male apron
    if (isMale) {
      return "/images/embroidery/m-apron.jpg";
    }

    // Explicit female URL → female apron
    if (isFemale) {
      return "/images/embroidery/f-apron.jpg";
    }

    // Fallback only if URL doesn't contain gender
    return "/images/embroidery/f-apron.jpg";
  }

  /*
   * =========================
   * FEMALE SCRUBS
   * =========================
   */
  if (isFemale) {
    if (colour.includes("airforce")) {
      return "/images/embroidery/f-airforceblue.jpg";
    }

    if (colour.includes("royal")) {
      return "/images/embroidery/f-royalblue.jpg";
    }

    if (colour.includes("black")) {
      return "/images/embroidery/f-black.jpg";
    }

    if (colour.includes("wine")) {
      return "/images/embroidery/f-wine.jpg";
    }

    if (colour.includes("olive")) {
      return "/images/embroidery/f-olive.jpg";
    }

    return "/images/embroidery/f-airforceblue.jpg";
  }

  /*
   * =========================
   * MALE SCRUBS
   * =========================
   */
  if (isMale) {
    if (colour.includes("airforce")) {
      return "/images/embroidery/m-airforceblue.jpg";
    }

    if (colour.includes("royal")) {
      return "/images/embroidery/m-royalblue.jpg";
    }

    if (colour.includes("black")) {
      return "/images/embroidery/m-black.jpg";
    }

    if (colour.includes("wine")) {
      return "/images/embroidery/m-wine.jpg";
    }

    if (colour.includes("olive")) {
      return "/images/embroidery/m-olive.jpg";
    }

    return "/images/embroidery/m-airforceblue.jpg";
  }

  /*
   * =========================
   * FINAL FALLBACK
   * =========================
   */
  return "/images/embroidery/f-airforceblue.jpg";
}

/* =========================================================
   THREAD COLOURS
   ========================================================= */

const threadColours: Array<{
  id: EmbroideryTextColor;
  label: string;
  css: string;
}> = [
  {
    id: "white",
    label: "White",
    css: "#ffffff",
  },
  {
    id: "black",
    label: "Black",
    css: "#111827",
  },
  {
    id: "gold",
    label: "Gold",
    css: "#f59e0b",
  },
  {
    id: "grey",
    label: "Grey",
    css: "#94a3b8",
  },
  {
    id: "lime",
    label: "Lime",
    css: "#a3e635",
  },
  {
    id: "pink",
    label: "Pink",
    css: "#fb7185",
  },
];

/* =========================================================
   MEDICAL ICONS
   ========================================================= */

const medicalIcons = [
  {
    id: "caduceus",
    label: "Medical Caduceus",
    symbol: "⚕",
  },
  {
    id: "cross",
    label: "Medical Cross",
    symbol: "✚",
  },
  {
    id: "heart",
    label: "Heart",
    symbol: "♥",
  },
  {
    id: "stethoscope",
    label: "Stethoscope",
    symbol: "🩺",
  },
  {
    id: "tooth",
    label: "Dental",
    symbol: "🦷",
  },
  {
    id: "syringe",
    label: "Syringe",
    symbol: "💉",
  },
  {
    id: "hospital",
    label: "Hospital",
    symbol: "🏥",
  },
  {
    id: "india",
    label: "India",
    symbol: "🇮🇳",
  },
] as const;

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function EmbroideryCustomizerModal({
  open,
  onClose,
  productName,
  productImage: _productImage,
  productColor = "",
  initialValue,
  onProceed,
}: EmbroideryCustomizerModalProps) {
  const fileRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * IMPORTANT:
   * Preview is automatically selected from
   * product gender + colour.
   */
  const resolvedPreviewImage = useMemo(
    () =>
      getEmbroideryPreviewImage(
        productName,
        productColor,
      ),
    [productName, productColor],
  );

  const [previewImage, setPreviewImage] =
    useState(resolvedPreviewImage);

  const [step, setStep] =
    useState<1 | 2>(1);

  const [mode, setMode] =
    useState<EmbroideryMode>(
      initialValue?.mode ?? "top",
    );

  const [line1, setLine1] =
    useState(
      initialValue?.line1 ?? "",
    );

  const [line2, setLine2] =
    useState(
      initialValue?.line2 ?? "",
    );

  const [font, setFont] =
    useState<EmbroideryFont>(
      initialValue?.font ?? "block",
    );

  const [textSize, setTextSize] =
    useState<EmbroideryTextSize>(
      "small",
    );

  const [textColor, setTextColor] =
    useState<EmbroideryTextColor>(
      initialValue?.textColor ??
        "white",
    );

  const [
    addBottomName,
    setAddBottomName,
  ] = useState(
    initialValue?.addBottomName ??
      false,
  );

  const [
    selectedIconId,
    setSelectedIconId,
  ] = useState(
    initialValue?.selectedIconId ??
      "",
  );

  const [
    customLogoFile,
    setCustomLogoFile,
  ] = useState<File | null>(null);

  const [
    customLogoPreview,
    setCustomLogoPreview,
  ] = useState(
    initialValue?.fileUrl ?? "",
  );

  const [
    uploadedFileUrl,
    setUploadedFileUrl,
  ] = useState(
    initialValue?.fileUrl ?? "",
  );

  const [
    uploadedPublicId,
    setUploadedPublicId,
  ] = useState(
    initialValue?.publicId ?? "",
  );

  const [
    uploadedFileName,
    setUploadedFileName,
  ] = useState(
    initialValue?.fileName ?? "",
  );

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    isSendingEnquiry,
    setIsSendingEnquiry,
  ] = useState(false);

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    customerEmail,
    setCustomerEmail,
  ] = useState("");

  /* =========================================================
     PREVIEW IMAGE UPDATE
     ========================================================= */

  useEffect(() => {
    const nextImage =
      getEmbroideryPreviewImage(
        productName,
        productColor,
      );

    setPreviewImage(nextImage);
  }, [
    productName,
    productColor,
  ]);

  /* =========================================================
     BODY LOCK + ESCAPE
     ========================================================= */

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow =
      "hidden";

    const closeOnEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, [open, onClose]);

  /* =========================================================
     RESET WHEN MODAL OPENS
     ========================================================= */

  useEffect(() => {
    if (!open) return;

    setMode(
      initialValue?.mode ?? "top",
    );

    setLine1(
      initialValue?.line1 ?? "",
    );

    setLine2(
      initialValue?.line2 ?? "",
    );

    setFont(
      initialValue?.font ?? "block",
    );

    setTextSize("small");

    setTextColor(
      initialValue?.textColor ??
        "white",
    );

    setAddBottomName(
      initialValue?.addBottomName ??
        false,
    );

    setSelectedIconId(
      initialValue?.selectedIconId ??
        "",
    );

    setCustomLogoFile(null);

    setCustomLogoPreview(
      initialValue?.fileUrl ?? "",
    );

    setUploadedFileUrl(
      initialValue?.fileUrl ?? "",
    );

    setUploadedPublicId(
      initialValue?.publicId ?? "",
    );

    setUploadedFileName(
      initialValue?.fileName ?? "",
    );

    setPreviewImage(
      getEmbroideryPreviewImage(
        productName,
        productColor,
      ),
    );

    setStep(1);
  }, [
    open,
    initialValue,
    productName,
    productColor,
  ]);

  /* =========================================================
     CLEANUP BLOB URL
     ========================================================= */

  useEffect(() => {
    return () => {
      if (
        customLogoPreview.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          customLogoPreview,
        );
      }
    };
  }, [customLogoPreview]);

  /* =========================================================
     SELECTED ICON
     ========================================================= */

  const selectedIcon =
    useMemo(
      () =>
        medicalIcons.find(
          (icon) =>
            icon.id ===
            selectedIconId,
        ) ?? null,
      [selectedIconId],
    );

  const hasLogo = Boolean(
    selectedIcon ||
      customLogoFile ||
      uploadedFileUrl,
  );

  /* =========================================================
     PRICING
     ========================================================= */

  const basePrice =
    mode === "bundle"
      ? BUNDLE_PRICE
      : mode === "top"
        ? TOP_PRICE
        : BOTTOM_PRICE;

  const logoPrice = hasLogo
    ? LOGO_PRICE
    : 0;

  const bottomNamePrice =
    addBottomName
      ? BOTTOM_ADDON_PRICE
      : 0;

  const totalPrice =
    basePrice +
    logoPrice +
    bottomNamePrice;

  const selectedThread =
    threadColours.find(
      (item) =>
        item.id === textColor,
    ) ?? threadColours[0];

  /* =========================================================
     RESET
     ========================================================= */

  const reset = () => {
    setStep(1);

    setMode("top");

    setLine1("");

    setLine2("");

    setFont("block");

    setTextSize("small");

    setTextColor("white");

    setAddBottomName(false);

    setSelectedIconId("");

    setCustomLogoFile(null);

    if (
      customLogoPreview.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        customLogoPreview,
      );
    }

    setCustomLogoPreview("");

    setUploadedFileUrl("");

    setUploadedPublicId("");

    setUploadedFileName("");

    setCustomerName("");

    setCustomerPhone("");

    setCustomerEmail("");

    setPreviewImage(
      getEmbroideryPreviewImage(
        productName,
        productColor,
      ),
    );

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  /* =========================================================
     CUSTOM LOGO SELECT
     ========================================================= */

  const chooseLogo = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowed.includes(file.type)
    ) {
      toast.error(
        "Only JPG, PNG, WEBP or PDF allowed hai.",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "Logo/artwork maximum 10 MB ka ho sakta hai.",
      );

      event.target.value = "";
      return;
    }

    if (
      customLogoPreview.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        customLogoPreview,
      );
    }

    setCustomLogoFile(file);

    setUploadedFileUrl("");

    setUploadedPublicId("");

    setUploadedFileName(
      file.name,
    );

    setSelectedIconId("");

    if (
      file.type ===
      "application/pdf"
    ) {
      setCustomLogoPreview("");
    } else {
      setCustomLogoPreview(
        URL.createObjectURL(file),
      );
    }
  };

  /* =========================================================
     UPLOAD LOGO
     ========================================================= */

  const uploadLogoIfNeeded =
    async () => {
      if (!customLogoFile) {
        return {
          fileUrl:
            uploadedFileUrl,
          publicId:
            uploadedPublicId,
          fileName:
            uploadedFileName,
        };
      }

      setIsUploading(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          customLogoFile,
        );

        const response =
          await fetch(
            "/api/uploads/embroidery",
            {
              method: "POST",
              body: formData,
            },
          );

        const result =
          (await response.json()) as UploadResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.file?.url
        ) {
          throw new Error(
            result.message ||
              "Embroidery artwork upload failed.",
          );
        }

        setUploadedFileUrl(
          result.file.url,
        );

        setUploadedPublicId(
          result.file.publicId,
        );

        setUploadedFileName(
          result.file.fileName,
        );

        return {
          fileUrl:
            result.file.url,
          publicId:
            result.file.publicId,
          fileName:
            result.file.fileName,
        };
      } finally {
        setIsUploading(false);
      }
    };

  /* =========================================================
     SEND ENQUIRY
     ========================================================= */

  const sendEmbroideryEnquiry =
    async (input: {
      fileUrl: string;
      publicId: string;
      fileName: string;
    }) => {
      setIsSendingEnquiry(true);

      try {
        const response =
          await fetch(
            "/api/embroidery-enquiries",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                customerName:
                  customerName.trim(),

                customerPhone:
                  customerPhone.trim(),

                customerEmail:
                  customerEmail.trim(),

                productName,

                productColor,

                /*
                 * Send the SAME automatic
                 * gender + colour preview
                 * to the enquiry.
                 */
                productImage:
                  previewImage,

                mode,

                line1:
                  line1.trim(),

                line2:
                  mode === "bottom"
                    ? ""
                    : line2.trim(),

                font,

                textColor,

                addBottomName,

                selectedIconId:
                  selectedIcon?.id ??
                  "",

                selectedIconLabel:
                  selectedIcon?.label ??
                  "",

                selectedIconSymbol:
                  selectedIcon?.symbol ??
                  "",

                fileUrl:
                  input.fileUrl,

                publicId:
                  input.publicId,

                fileName:
                  input.fileName,

                embroideryPrice:
                  totalPrice,
              }),
            },
          );

        const result =
          (await response.json()) as EmbroideryEnquiryResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Embroidery enquiry email send nahi ho payi.",
          );
        }

        return result;
      } finally {
        setIsSendingEnquiry(
          false,
        );
      }
    };

  /* =========================================================
     PROCEED
     ========================================================= */

  const proceed = async () => {
    const cleanLine1 =
      line1.trim();

    const cleanLine2 =
      mode === "bottom"
        ? ""
        : line2.trim();

    if (
      !cleanLine1 &&
      !hasLogo
    ) {
      toast.error(
        "Text, icon ya custom logo me se kuch select karo.",
      );

      return;
    }

    if (
      customerName.trim()
        .length < 2
    ) {
      toast.error(
        "Please enter your full name.",
      );

      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        customerPhone.trim(),
      )
    ) {
      toast.error(
        "Valid 10-digit Indian mobile number enter karo.",
      );

      return;
    }

    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail.trim(),
      )
    ) {
      toast.error(
        "Valid email address enter karo.",
      );

      return;
    }

    try {
      const uploaded =
        await uploadLogoIfNeeded();

      await sendEmbroideryEnquiry(
        uploaded,
      );

      const value: CartEmbroidery =
        {
          enabled: true,

          mode,

          placement:
            mode === "bottom"
              ? "bottom"
              : "top",

          line1:
            cleanLine1,

          line2:
            cleanLine2,

          font,

          textColor,

          addBottomName,

          selectedIconId:
            selectedIcon?.id ??
            "",

          selectedIconLabel:
            selectedIcon?.label ??
            "",

          selectedIconSymbol:
            selectedIcon?.symbol ??
            "",

          fileName:
            uploaded.fileName,

          fileUrl:
            uploaded.fileUrl,

          publicId:
            uploaded.publicId,

          basePrice,

          logoPrice,

          bottomNamePrice,

          price:
            totalPrice,

          type:
            hasLogo
              ? "logo"
              : "name",

          instructions: [
            cleanLine1,
            cleanLine2,
            selectedIcon?.label ??
              "",
            addBottomName
              ? "Add bottom name"
              : "",
          ]
            .filter(Boolean)
            .join(" | "),
        };

      onProceed(value);

      toast.success(
        `Embroidery request emailed and added — ${money(
          totalPrice,
        )}`,
      );

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Embroidery save nahi ho payi.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150]">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close embroidery customizer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-[2px]"
      />

      <section className="absolute inset-0 mx-auto flex h-[100dvh] w-full min-w-0 max-w-[1180px] flex-col overflow-hidden bg-white shadow-2xl md:inset-y-[4vh] md:h-[92vh] md:flex-row md:rounded-2xl">

        {/* =================================================
            LEFT PREVIEW
        ================================================== */}

        <div className="relative h-[38vh] min-h-[220px] shrink-0 overflow-hidden bg-[#eaf1f6] md:h-auto md:min-h-0 md:flex-1">

          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] shadow"
          >
            <X size={18} />
            Close
          </button>

          {/* PRODUCT EMBROIDERY IMAGE */}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt={`${productName} embroidery preview`}
            onError={() => {
              if (
                previewImage !==
                EMBROIDERY_DEFAULT_IMAGE
              ) {
                setPreviewImage(
                  EMBROIDERY_DEFAULT_IMAGE,
                );
              }
            }}
            className="absolute inset-0 h-full w-full object-contain p-3 md:p-6"
          />

          {/* =================================================
              LIVE EMBROIDERY OVERLAY
          ================================================== */}

          <div className="pointer-events-none absolute inset-0">

            {/* TEXT */}

            {(line1 ||
              line2) && (
              <div
                className={`absolute z-20 max-w-[190px] text-center font-bold leading-tight drop-shadow ${
                  mode === "bottom"
                    ? "bottom-[16%] left-1/2 -translate-x-1/2"
                    : "-translate-x-1/2"
                }`}
                style={{
                  color:
                    selectedThread.css,

                  fontFamily:
                    font === "script"
                      ? "cursive"
                      : "Arial, Helvetica, sans-serif",

                  fontSize:
                    `${TEXT_SIZE_PX[textSize]}px`,

                  ...(mode !== "bottom"
                    ? {
                        /*
                         * Chest embroidery placement:
                         * keep the text centered just ABOVE the
                         * upper chest pocket / embroidery area.
                         * Male and female product photos have
                         * slightly different framing, so they use
                         * separate coordinates.
                         */
                        /*
                         * Chest embroidery placement:
                         * text is intentionally kept on the RIGHT
                         * side, directly ABOVE the upper pocket.
                         * The supplied female and male embroidery
                         * images have different framing, so the
                         * vertical position is tuned separately.
                         */
                        left:
                          detectGender(productName) ===
                          "female"
                            ? "65%"
                            : "65%",
                        top:
                          detectGender(productName) ===
                          "female"
                            ? "32%"
                            : "32%",
                      }
                    : {}),
                }}
              >
                {line1 && (
                  <div>
                    {line1}
                  </div>
                )}

                {mode !==
                  "bottom" &&
                  line2 && (
                    <div>
                      {line2}
                    </div>
                  )}
              </div>
            )}

            {/* ICON */}

            {selectedIcon && (
              <div
                className="absolute z-20 -translate-x-1/2 text-[clamp(18px,5vw,34px)] drop-shadow-xl"
                style={{
                  color:
                    selectedThread.css,
                  /* Medical icon sits to the LEFT of the text,
                     aligned to the same chest embroidery row. */
                  /* Keep the icon on the LEFT and the name/designation
                     on the RIGHT, aligned to the same embroidery row. */
                  left:
                    detectGender(productName) ===
                    "female"
                      ? "36%"
                      : "36%",
                  top:
                    detectGender(productName) ===
                    "female"
                      ? "32%"
                      : "32%",
                }}
              >
                {
                  selectedIcon.symbol
                }
              </div>
            )}

            {/* CUSTOM LOGO */}

            {customLogoPreview &&
              !customLogoPreview.endsWith(
                ".pdf",
              ) && (
                <div
                  className="absolute z-20 h-[clamp(55px,7vw,95px)] w-[clamp(55px,7vw,95px)] -translate-x-1/2"
                  style={{
                    left:
                      detectGender(productName) ===
                      "female"
                        ? "45%"
                        : "45%",
                    top:
                      detectGender(productName) ===
                      "female"
                        ? "40%"
                        : "40%",
                  }}
                >

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      customLogoPreview
                    }
                    alt="Custom logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/65 px-4 py-3 text-xs text-white backdrop-blur-sm">
            Live preview is approximate.
            Final placement and thread
            finish will be confirmed before
            production.
          </div>
        </div>

        {/* =================================================
            RIGHT PANEL
        ================================================== */}

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-white md:w-[475px] md:flex-none">

          {/* HEADER */}

          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

            <div className="flex min-w-0 items-center gap-3">

              {step === 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setStep(1)
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
                >
                  <ArrowLeft
                    size={20}
                  />
                </button>
              )}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-black">
                  {step === 1
                    ? "Add Your Identity"
                    : mode === "bundle"
                      ? "Embroidery Bundle"
                      : mode === "top"
                        ? "Top Embroidery"
                        : "Bottom Embroidery"}
                </h2>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {productName}

                  {productColor
                    ? ` • ${productColor}`
                    : ""}
                </p>
              </div>
            </div>

            <Scissors
              size={22}
              className="text-[#922424]"
            />
          </header>

          {/* SCROLLABLE CONTENT */}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-28">

            {step === 1 ? (
              <div className="space-y-4">

                {/* BUNDLE */}

                <button
                  type="button"
                  onClick={() => {
                    setMode(
                      "bundle",
                    );

                    setStep(2);
                  }}
                  className="w-full rounded-2xl border border-[#922424] bg-[#fff8f8] p-4 text-left transition hover:bg-[#fff1f1]"
                >
                  <div className="flex items-start gap-3">

                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-400 bg-white">
                      <Check
                        size={16}
                      />
                    </span>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <p className="font-black">
                          Embroidery
                          Bundle
                        </p>

                        <p className="font-black">

                          <span className="mr-2 text-xs text-slate-400 line-through">
                            ₹598
                          </span>

                          ₹448
                        </p>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Name +
                        designation +
                        icon/logo.
                        Best-value
                        complete identity
                        package.
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                        Save ₹150
                      </span>
                    </div>
                  </div>
                </button>

                {/* OR */}

                <div className="flex items-center gap-3 text-xs font-black text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  OR
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                {/* TOP */}

                <button
                  type="button"
                  onClick={() => {
                    setMode("top");
                    setStep(2);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#922424] hover:bg-[#fffafa]"
                >
                  <div className="flex items-start gap-3">

                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded border border-slate-400 bg-white" />

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">

                      <div>
                        <p className="font-black">
                          Top
                          Embroidery
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Name and
                          designation
                          above the scrub
                          pocket.
                        </p>
                      </div>

                      <p className="font-black">
                        {money(
                          TOP_PRICE,
                        )}
                      </p>
                    </div>
                  </div>
                </button>

                {/* BOTTOM */}

                <button
                  type="button"
                  onClick={() => {
                    setMode(
                      "bottom",
                    );

                    setLine2("");

                    setStep(2);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#922424] hover:bg-[#fffafa]"
                >
                  <div className="flex items-start gap-3">

                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded border border-slate-400 bg-white" />

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2">

                          <p className="font-black">
                            Bottom
                            Embroidery
                          </p>

                          <span className="rounded bg-[#922424] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                            New
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Add your name
                          on the scrub
                          bottom.
                        </p>
                      </div>

                      <p className="font-black">
                        ₹149
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-5">

                {/* TOTAL */}

                <div className="flex items-center justify-between rounded-xl bg-[#fff7f7] px-4 py-3">

                  <span className="text-sm font-bold text-slate-700">
                    Embroidery
                    selected
                  </span>

                  <span className="text-xl font-black text-[#922424]">
                    {money(
                      totalPrice,
                    )}
                  </span>
                </div>

                {/* =================================================
                    TEXT SECTION
                ================================================== */}

                <section className="rounded-2xl border border-slate-200 p-4">

                  <div className="flex items-center justify-between">

                    <p className="font-black">
                      Add Text
                    </p>

                    <span className="text-sm font-bold">
                      {mode ===
                      "bundle"
                        ? "Included"
                        : money(
                            basePrice,
                          )}
                    </span>
                  </div>

                  {/* LINE 1 */}

                  <label className="mt-4 block">

                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Line 1
                    </span>

                    <div className="relative">

                      <input
                        value={line1}
                        maxLength={EMBROIDERY_TEXT_MAX_LENGTH}
                        onChange={(
                          event,
                        ) =>
                          setLine1(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Name"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {
                          line1.length
                        }
                        /{EMBROIDERY_TEXT_MAX_LENGTH}
                      </span>
                    </div>
                  </label>

                  {/* LINE 2 */}

                  {mode !==
                    "bottom" && (
                    <label className="mt-4 block">

                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Line 2
                      </span>

                      <div className="relative">

                        <input
                          value={
                            line2
                          }
                          maxLength={
                            EMBROIDERY_TEXT_MAX_LENGTH
                          }
                          onChange={(
                            event,
                          ) =>
                            setLine2(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Designation"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {
                            line2.length
                          }
                          /{EMBROIDERY_TEXT_MAX_LENGTH}
                        </span>
                      </div>
                    </label>
                  )}

                  {/* TEXT COLOUR */}

                  <div className="mt-5">

                    <p className="text-sm font-black text-slate-800">
                      Text colour
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">

                      {threadColours.map(
                        (
                          colour,
                        ) => (
                          <button
                            key={
                              colour.id
                            }
                            type="button"
                            onClick={() =>
                              setTextColor(
                                colour.id,
                              )
                            }
                            title={
                              colour.label
                            }
                            className={`h-8 w-8 rounded-full border-2 ${
                              textColor ===
                              colour.id
                                ? "ring-2 ring-[#922424] ring-offset-2"
                                : ""
                            }`}
                            style={{
                              backgroundColor:
                                colour.css,

                              borderColor:
                                colour.id ===
                                "white"
                                  ? "#111827"
                                  : colour.css,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  {/* FONT */}

                  <div className="mt-5">

                    <p className="text-sm font-black text-slate-800">
                      Font type
                    </p>

                    <div className="mt-3 flex gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setFont(
                            "block",
                          )
                        }
                        className={`rounded-lg border px-5 py-2.5 text-sm font-black ${
                          font ===
                          "block"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        AA Block
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFont(
                            "script",
                          )
                        }
                        className={`rounded-lg border px-5 py-2.5 text-sm italic ${
                          font ===
                          "script"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300"
                        }`}
                        style={{
                          fontFamily:
                            "cursive",
                        }}
                      >
                        Aa Script
                      </button>
                    </div>
                  </div>

                  {/* TEXT SIZE */}

                  <div className="mt-5">

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="text-sm font-black text-slate-800">
                          Text size
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Preview text ko
                          small ya big
                          karo.
                        </p>
                      </div>

                      <span className="rounded-full bg-[#fff0f0] px-3 py-1 text-xs font-black capitalize text-[#922424]">
                        {textSize}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">

                      {(
                        [
                          {
                            id: "small",
                            label: "Small",
                          },
                          {
                            id: "medium",
                            label: "Medium",
                          },
                          {
                            id: "large",
                            label: "Large",
                          },
                        ] as const
                      ).map(
                        (
                          sizeOption,
                        ) => (
                          <button
                            key={
                              sizeOption.id
                            }
                            type="button"
                            onClick={() =>
                              setTextSize(
                                sizeOption.id,
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-center transition ${
                              textSize ===
                              sizeOption.id
                                ? "border-[#922424] bg-[#fff4f4] text-[#922424] ring-2 ring-[#f2dddd]"
                                : "border-slate-300 bg-white text-slate-700 hover:border-[#922424]"
                            }`}
                          >
                            <span
                              className="block font-black leading-none"
                              style={{
                                fontSize:
                                  `${TEXT_SIZE_PX[sizeOption.id]}px`,
                              }}
                            >
                              Aa
                            </span>

                            <span className="mt-2 block text-[11px] font-bold">
                              {
                                sizeOption.label
                              }
                            </span>
                          </button>
                        ),
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">

                      <button
                        type="button"
                        onClick={() =>
                          setTextSize(
                            (
                              current,
                            ) =>
                              current ===
                              "large"
                                ? "medium"
                                : "small",
                          )
                        }
                        disabled={
                          textSize ===
                          "small"
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Decrease embroidery text size"
                      >
                        −
                      </button>

                      <div className="text-center">

                        <p className="text-xs font-bold capitalize text-slate-700">
                          {textSize}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {
                            TEXT_SIZE_PX[
                              textSize
                            ]
                          }
                          px preview
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTextSize(
                            (
                              current,
                            ) =>
                              current ===
                              "small"
                                ? "medium"
                                : "large",
                          )
                        }
                        disabled={
                          textSize ===
                          "large"
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Increase embroidery text size"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM NAME ADDON */}

                  {mode ===
                    "top" && (
                    <label className="mt-5 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">

                      <span>

                        <span className="block text-sm font-black">
                          Add name to
                          bottom scrub
                        </span>

                        <span className="mt-1 block text-xs text-emerald-700">
                          Add-on ₹99
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={
                          addBottomName
                        }
                        onChange={(
                          event,
                        ) =>
                          setAddBottomName(
                            event
                              .target
                              .checked,
                          )
                        }
                        className="h-5 w-5 accent-[#922424]"
                      />
                    </label>
                  )}
                </section>

                {/* =================================================
                    LOGO / ICON
                ================================================== */}

                {mode !==
                  "bottom" && (
                  <section className="rounded-2xl border border-slate-200 p-4">

                    <div className="flex items-center justify-between">

                      <p className="font-black">
                        Add Logo /
                        Icon
                      </p>

                      <span className="text-sm font-bold">
                        {mode ===
                        "bundle"
                          ? "Included"
                          : "+₹250"}
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Medical icons
                    </p>

                    <div className="mt-3 grid grid-cols-4 gap-3">

                      {medicalIcons.map(
                        (icon) => (
                          <button
                            key={
                              icon.id
                            }
                            type="button"
                            title={
                              icon.label
                            }
                            onClick={() => {
                              setSelectedIconId(
                                (
                                  current,
                                ) =>
                                  current ===
                                  icon.id
                                    ? ""
                                    : icon.id,
                              );

                              setCustomLogoFile(
                                null,
                              );

                              setUploadedFileUrl(
                                "",
                              );

                              setUploadedPublicId(
                                "",
                              );

                              setUploadedFileName(
                                "",
                              );

                              setCustomLogoPreview(
                                "",
                              );

                              if (
                                fileRef.current
                              ) {
                                fileRef.current.value =
                                  "";
                              }
                            }}
                            className={`flex aspect-square items-center justify-center rounded-xl border text-3xl ${
                              selectedIconId ===
                              icon.id
                                ? "border-[#922424] bg-[#fff0f0] ring-2 ring-[#f2dddd]"
                                : "border-slate-200 bg-slate-100"
                            }`}
                          >
                            {
                              icon.symbol
                            }
                          </button>
                        ),
                      )}
                    </div>

                    <div className="my-5 flex items-center gap-3 text-xs font-black uppercase text-slate-400">
                      <span className="h-px flex-1 bg-slate-200" />
                      Or upload
                      logo
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <input
                      ref={
                        fileRef
                      }
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      onChange={
                        chooseLogo
                      }
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        fileRef.current?.click()
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-black hover:border-[#922424] hover:text-[#922424]"
                    >
                      {uploadedFileName ? (
                        <>
                          <ImagePlus
                            size={18}
                          />

                          <span className="min-w-0 max-w-full truncate">
                            {
                              uploadedFileName
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload
                            size={18}
                          />

                          Upload
                          Custom Logo
                        </>
                      )}
                    </button>

                    <p className="mt-2 text-xs text-slate-400">
                      JPG, PNG,
                      WEBP or PDF.
                      Maximum 10MB.
                    </p>
                  </section>
                )}

                {/* =================================================
                    CONTACT DETAILS
                ================================================== */}

                <section className="rounded-2xl border border-slate-200 p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="font-black text-slate-950">
                        Your Contact
                        Details
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Once you proceed,
                        the complete
                        embroidery
                        requirements will
                        be sent to KRINAY
                        via email.
                      </p>
                    </div>

                    <Mail
                      size={20}
                      className="shrink-0 text-[#922424]"
                    />
                  </div>

                  {/* NAME */}

                  <label className="mt-4 block">

                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Full name *
                    </span>

                    <div className="flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">

                      <UserRound
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <input
                        value={
                          customerName
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerName(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Your full name"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                      />
                    </div>
                  </label>

                  {/* PHONE */}

                  <label className="mt-4 block">

                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Mobile number
                      *
                    </span>

                    <div className="flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">

                      <Phone
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <input
                        inputMode="numeric"
                        maxLength={10}
                        value={
                          customerPhone
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerPhone(
                            event.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        placeholder="9876543210"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                      />
                    </div>
                  </label>

                  {/* EMAIL */}

                  <label className="mt-4 block">

                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Email address
                    </span>

                    <div className="flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">

                      <Mail
                        size={17}
                        className="shrink-0 text-slate-400"
                      />

                      <input
                        type="email"
                        value={
                          customerEmail
                        }
                        onChange={(
                          event,
                        ) =>
                          setCustomerEmail(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="name@email.com"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                      />
                    </div>
                  </label>
                </section>
              </div>
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <footer className="grid grid-cols-1 gap-2 border-t border-slate-200 p-4 sm:grid-cols-2 sm:gap-3 sm:p-5">

            <button
              type="button"
              onClick={reset}
              disabled={
                isUploading ||
                isSendingEnquiry
              }
              className="min-h-12 w-full min-w-0 rounded-xl border border-slate-400 px-5 py-3.5 text-center text-sm font-black uppercase leading-snug tracking-wide"
            >
              Reset
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() =>
                  setStep(2)
                }
                className="min-h-12 w-full min-w-0 rounded-xl bg-[#922424] px-5 py-3.5 text-center text-sm font-black uppercase leading-snug tracking-wide text-white hover:bg-[#701a1a]"
              >
                Customize
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  void proceed()
                }
                disabled={
                  isUploading ||
                  isSendingEnquiry
                }
                className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#922424] px-5 py-3.5 text-center text-sm font-black uppercase leading-snug tracking-wide text-white hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isUploading ||
                  isSendingEnquiry) && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {isUploading
                  ? "Uploading..."
                  : isSendingEnquiry
                    ? "Sending..."
                    : `Proceed • ${money(
                        totalPrice,
                      )}`}
              </button>
            )}
          </footer>
        </div>
      </section>
    </div>
  );
}