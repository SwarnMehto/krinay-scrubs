"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  FileImage,
  MessageCircle,
  Scissors,
  Upload,
  X,
} from "lucide-react";

type EmbroideryOptionProps = {
  productId: string;
  productName: string;
  productSlug: string;
  selectedColor: string;
};

type UploadResponse = {
  success: boolean;
  message?: string;
  file?: {
    url: string;
    publicId?: string;
    fileName?: string;
  };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

export default function EmbroideryOption({
  productId,
  productName,
  productSlug,
  selectedColor,
}: EmbroideryOptionProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("PNG, JPG, WEBP ya PDF file upload karein.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Artwork file maximum 10 MB ka ho sakta hai.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cleanName = customerName.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanInstructions = instructions.trim();

    if (cleanName.length < 2) {
      toast.error("Please enter your name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Valid 10-digit WhatsApp number enter karein.");
      return;
    }

    if (!file) {
      toast.error("Logo / artwork upload karein.");
      return;
    }

    const whatsappNumber =
      process.env.NEXT_PUBLIC_KRINAY_WHATSAPP_NUMBER?.replace(
        /\D/g,
        "",
      );

    if (!whatsappNumber) {
      toast.error("Krinay WhatsApp number configure nahi hai.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadResponse = await fetch(
        "/api/uploads/embroidery",
        {
          method: "POST",
          body: uploadData,
        },
      );

      const uploadResult =
        (await uploadResponse.json()) as UploadResponse;

      if (
        !uploadResponse.ok ||
        !uploadResult.success ||
        !uploadResult.file?.url
      ) {
        throw new Error(
          uploadResult.message ||
            "Artwork upload nahi ho paya.",
        );
      }

      const artworkUrl = uploadResult.file.url;

      const message = [
        "Hi KRINAY,",
        "",
        "I want custom embroidery for this scrub.",
        "",
        `Product: ${productName}`,
        `Product ID: ${productId}`,
        `Product Link: ${
          typeof window !== "undefined"
            ? `${window.location.origin}/product/${productSlug}`
            : productSlug
        }`,
        `Colour: ${selectedColor || "Not selected yet"}`,
        "",
        `Customer Name: ${cleanName}`,
        `WhatsApp: ${cleanPhone}`,
        "",
        `Requirement: ${
          cleanInstructions ||
          "Please contact me to discuss embroidery details."
        }`,
        "",
        `Artwork: ${artworkUrl}`,
        "",
        "Please contact me for placement, size, thread colour, pricing and final confirmation.",
      ].join("\n");

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          message,
        )}`;

      toast.success("Artwork uploaded. WhatsApp opening...");

      window.location.href = whatsappUrl;
    } catch (error) {
      console.error("Embroidery request failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Embroidery request not submitted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-[#eadada] bg-[#fffafa] px-4 py-3 text-left shadow-sm transition hover:border-[#922424] hover:bg-[#fff5f5]"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#922424] text-white">
            <Scissors size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950">
              Customize Embroidery
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              Upload logo or artwork
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp
            size={18}
            className="shrink-0 text-[#922424]"
          />
        ) : (
          <ChevronDown
            size={18}
            className="shrink-0 text-[#922424]"
          />
        )}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 rounded-2xl border border-[#eadada] bg-white p-5 shadow-sm"
        >
          <div className="rounded-xl border border-[#eadada] bg-[#fff8f8] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#922424]">
              Selected Product
            </p>

            <p className="mt-1 text-sm font-black text-slate-900">
              {productName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Colour: {selectedColor || "Select a colour below"}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="embroidery-customer-name"
                className="text-sm font-black text-slate-900"
              >
                Your Name
              </label>

              <input
                id="embroidery-customer-name"
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
                maxLength={80}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label
                htmlFor="embroidery-phone"
                className="text-sm font-black text-slate-900"
              >
                WhatsApp Number
              </label>

              <input
                id="embroidery-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="10-digit mobile number"
                autoComplete="tel"
                maxLength={14}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-black text-slate-900">
              Upload Logo / Artwork
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-2 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-7 text-center transition hover:border-[#922424] hover:bg-[#fff7f7]"
              >
                <Upload
                  size={26}
                  className="text-[#922424]"
                />

                <span className="mt-2 text-sm font-black text-slate-900">
                  Choose artwork
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  PNG, JPG, WEBP or PDF • Max 10 MB
                </span>
              </button>
            ) : (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileImage
                    size={21}
                    className="shrink-0 text-emerald-700"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-emerald-900">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-emerald-700">
                      Ready to upload
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-100"
                  aria-label="Remove uploaded artwork"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="embroidery-instructions"
              className="text-sm font-black text-slate-900"
            >
              Requirement / Notes
            </label>

            <textarea
              id="embroidery-instructions"
              rows={3}
              value={instructions}
              onChange={(event) =>
                setInstructions(event.target.value)
              }
              placeholder="Example: Hospital logo embroidery. Please contact me for placement and price."
              maxLength={500}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {instructions.length}/500
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#922424] px-6 py-4 text-sm font-black text-white transition hover:bg-[#761b1b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageCircle size={18} />

            {isSubmitting
              ? "Uploading Artwork..."
              : "Submit & Continue on WhatsApp"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            Artwork upload hone ke baad WhatsApp open hoga. Final
            placement, thread colour, quantity aur pricing manually
            confirm ki jayegi.
          </p>
        </form>
      )}
    </div>
  );
}
