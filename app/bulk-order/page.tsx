"use client";

import {
  Building2,
  CheckCircle2,
  MessageCircle,
  Package,
  Send,
  Users,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";

const initialForm = {
  fullName: "",
  organization: "",
  phone: "",
  email: "",
  quantity: "",
  colours: "",
  sizes: "",
  embroidery: "No",
  message: "",
  website: "",
};

export default function BulkOrderPage() {
  const [form, setForm] =
    useState(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "/api/bulk-orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Request submit nahi hui.",
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const whatsappNumber =
      process.env.NEXT_PUBLIC_KRINAY_WHATSAPP_NUMBER?.replace(
        /\D/g,
        "",
      ) || "918586083877";

    if (form.fullName.trim().length < 2) {
      setError(
        "WhatsApp enquiry ke liye pehle full name enter karein.",
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError(
        "WhatsApp enquiry ke liye valid 10-digit mobile number enter karein.",
      );
      return;
    }

    setError("");

    const message = [
      "Hello KRINAY Scrubs,",
      "",
      "I want a bulk-order quotation.",
      "",
      `Name: ${form.fullName.trim()}`,
      `Organization: ${form.organization.trim() || "Not provided"}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim() || "Not provided"}`,
      `Estimated quantity: ${form.quantity.trim() || "Not provided"}`,
      `Required colours: ${form.colours.trim() || "Not specified"}`,
      `Required sizes: ${form.sizes.trim() || "Not specified"}`,
      `Logo embroidery: ${form.embroidery}`,
      `Additional requirements: ${form.message.trim() || "Not specified"}`,
      "",
      "Please share pricing and next steps.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <section className="bg-[#922424] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
            Hospitals, clinics and institutes
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black sm:text-5xl">
            Medical scrubs for your complete healthcare team.
          </h1>

          <p className="mt-5 max-w-2xl leading-8 text-white/80">
            Bulk pricing, coordinated colours, multiple sizes and optional
            logo embroidery ke liye requirement submit karein.
          </p>
        </div>
      </section>

      <section className="bg-[#fffafa] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            {[
              {
                icon: <Users size={22} />,
                title: "Team sizing",
                text: "Multiple staff sizes in a single order.",
              },
              {
                icon: <Package size={22} />,
                title: "Bulk pricing",
                text: "Pricing based on quantity and requirements.",
              },
              {
                icon: <Building2 size={22} />,
                title: "Branding options",
                text: "Clinic or hospital logo embroidery requirement.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#eadada] bg-white p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
                  {item.icon}
                </div>

                <h2 className="mt-4 text-lg font-black text-black">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-7 text-black/60">
                  {item.text}
                </p>
              </div>
            ))}
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#eadada] bg-white p-6 sm:p-8"
          >
            <h2 className="text-2xl font-black text-black">
              Request a bulk-order quote
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <BulkInput
                label="Full name"
                value={form.fullName}
                onChange={(value) =>
                  setForm({
                    ...form,
                    fullName: value,
                  })
                }
                required
              />

              <BulkInput
                label="Hospital / Clinic / Institute"
                value={form.organization}
                onChange={(value) =>
                  setForm({
                    ...form,
                    organization: value,
                  })
                }
                required
              />

              <BulkInput
                label="Phone number"
                value={form.phone}
                onChange={(value) =>
                  setForm({
                    ...form,
                    phone: value,
                  })
                }
                required
              />

              <BulkInput
                label="Email address"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm({
                    ...form,
                    email: value,
                  })
                }
              />

              <BulkInput
                label="Estimated quantity"
                type="number"
                value={form.quantity}
                onChange={(value) =>
                  setForm({
                    ...form,
                    quantity: value,
                  })
                }
                required
              />

              <BulkInput
                label="Required colours"
                value={form.colours}
                onChange={(value) =>
                  setForm({
                    ...form,
                    colours: value,
                  })
                }
                placeholder="Navy, Wine, Black..."
              />

              <BulkInput
                label="Required sizes"
                value={form.sizes}
                onChange={(value) =>
                  setForm({
                    ...form,
                    sizes: value,
                  })
                }
                placeholder="S, M, L, XL..."
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Logo embroidery
                </label>

                <select
                  value={form.embroidery}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      embroidery:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#decaca] bg-white px-4 py-3 text-sm outline-none focus:border-[#922424]"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Not sure">
                    Not sure
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-black">
                  Additional requirements
                </label>

                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      message:
                        event.target.value,
                    })
                  }
                  placeholder="Mention preferred fabric, deadline, department colours or other requirements..."
                  className="w-full resize-none rounded-xl border border-[#decaca] px-4 py-3 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                />
              </div>

              <input
                value={form.website}
                onChange={(event) =>
                  setForm({
                    ...form,
                    website:
                      event.target.value,
                  })
                }
                className="hidden"
                tabIndex={-1}
              />
            </div>

            {success && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Bulk order request submitted.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:bg-black/40"
              >
                <Send size={17} />

                {isSubmitting
                  ? "Sending Email..."
                  : "Request Quote by Email"}
              </button>

              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#922424] bg-white px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff4f4]"
              >
                <MessageCircle size={18} />

                Send on WhatsApp
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-black/50">
              Email button se requirement KRINAY inbox par send hogi.
              WhatsApp button chat open karega; final message customer
              WhatsApp me Send press karke bhejega.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

function BulkInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-black">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        min={type === "number" ? 1 : undefined}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#decaca] px-4 py-3 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
      />
    </div>
  );
}