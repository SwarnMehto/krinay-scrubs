"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const initialForm: ContactForm = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const whatsappNumber =
  process.env.NEXT_PUBLIC_KRINAY_WHATSAPP_NUMBER ||
  "918586083877";

const MAX_MESSAGE_LENGTH = 3000;

export default function ContactPage() {
  const [form, setForm] =
    useState<ContactForm>(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const whatsappMessage = useMemo(() => {
    const name =
      form.name.trim() || "Customer";

    const subject =
      form.subject.trim() ||
      "Krinay product enquiry";

    const message =
      form.message.trim() ||
      "I need assistance regarding Krinay products.";

    return [
      "Hello Krinay Team,",
      "",
      `My name is ${name}.`,
      `Subject: ${subject}`,
      `Message: ${message}`,
      form.phone.trim()
        ? `Phone: ${form.phone.trim()}`
        : "",
      form.email.trim()
        ? `Email: ${form.email.trim()}`
        : "",
      "",
      "Please assist me.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [form]);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const updateField = (
    field: keyof ContactForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (success) {
      setSuccess(false);
      setSuccessMessage("");
    }

    if (error) {
      setError("");
    }
  };

  const handlePhoneChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const numericValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    updateField("phone", numericValue);
  };

  const validateForm = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email
      .trim()
      .toLowerCase();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name) {
      return "Please enter your full name.";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!subject) {
      return "Please enter the enquiry subject.";
    }

    if (message.length < 10) {
      return "Message should be at least 10 characters long.";
    }

    if (
      message.length >
      MAX_MESSAGE_LENGTH
    ) {
      return `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSuccess(false);
    setSuccessMessage("");
    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email
              .trim()
              .toLowerCase(),
            subject:
              form.subject.trim(),
            message:
              form.message.trim(),
          }),
        },
      );

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Message could not be submitted.",
        );
      }

      setSuccess(true);
      setSuccessMessage(
        result.message ||
          "Your message has been received successfully.",
      );

      setForm(initialForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-[#922424] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
            Contact Krinay
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            How can we help?
          </h1>

          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            Product, sizing, order,
            delivery, exchange or bulk-order
            assistance ke liye Krinay team
            se contact karein.
          </p>
        </div>
      </section>

      <section className="bg-[#fffafa] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <ContactCard
              icon={<Phone size={22} />}
              title="Call us"
              text="+91 85860 83877"
              href="tel:+918586083877"
            />

            <ContactCard
              icon={<Mail size={22} />}
              title="Email"
              text="contact@krinay.in"
              href="mailto:contact@krinay.in"
            />

            <ContactCard
              icon={<MapPin size={22} />}
              title="Address"
              text="First Floor, Plot No. 63, Harsh Vihar, Pitampura, Delhi – 110034"
            />

            <div className="rounded-3xl bg-[#922424] p-7 text-white">
              <h2 className="text-xl font-black">
                Need scrubs for a team?
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/75">
                Hospitals, clinics,
                institutes and healthcare
                teams bulk-order page se
                detailed requirement submit
                kar sakte hain.
              </p>

              <Link
                href="/bulk-order"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#922424] transition hover:bg-[#f8eeee]"
              >
                Request Bulk Quote
              </Link>
            </div>
          </aside>

          <div className="rounded-3xl border border-[#eadada] bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-3 border-b border-[#f0dfdf] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#922424]">
                  Customer Support
                </p>

                <h2 className="mt-2 text-2xl font-black text-black">
                  Send us a message
                </h2>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Form submit karne par
                  Krinay team ko email
                  notification milegi.
                </p>
              </div>

              <div className="rounded-full bg-[#fff2f2] px-4 py-2 text-xs font-bold text-[#922424]">
                Usually responds within 1
                business day
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  id="contact-name"
                  label="Full name"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      "name",
                      value,
                    )
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-sm font-bold text-black"
                  >
                    Phone number{" "}
                    <span className="text-[#922424]">
                      *
                    </span>
                  </label>

                  <div className="flex overflow-hidden rounded-xl border border-[#decaca] transition focus-within:border-[#922424] focus-within:ring-2 focus-within:ring-[#f2dddd]">
                    <span className="flex items-center border-r border-[#decaca] bg-[#fff7f7] px-4 text-sm font-bold text-black/65">
                      +91
                    </span>

                    <input
                      id="contact-phone"
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={
                        handlePhoneChange
                      }
                      required
                      maxLength={10}
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <InputField
                  id="contact-email"
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField(
                      "email",
                      value,
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                />

                <InputField
                  id="contact-subject"
                  label="Subject"
                  value={form.subject}
                  onChange={(value) =>
                    updateField(
                      "subject",
                      value,
                    )
                  }
                  placeholder="Product, order or bulk enquiry"
                  required
                />

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-bold text-black"
                    >
                      Message{" "}
                      <span className="text-[#922424]">
                        *
                      </span>
                    </label>

                    <span className="text-xs text-black/45">
                      {
                        form.message.length
                      }
                      /{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>

                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(event) =>
                      updateField(
                        "message",
                        event.target.value.slice(
                          0,
                          MAX_MESSAGE_LENGTH,
                        ),
                      )
                    }
                    rows={7}
                    required
                    minLength={10}
                    maxLength={
                      MAX_MESSAGE_LENGTH
                    }
                    placeholder="Please share your product, size, order, delivery or bulk-purchase requirement..."
                    className="w-full resize-none rounded-xl border border-[#decaca] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                  />
                </div>

                {/* Spam honeypot */}
                <div
                  aria-hidden="true"
                  className="hidden"
                >
                  <label htmlFor="contact-website">
                    Website
                  </label>

                  <input
                    id="contact-website"
                    type="text"
                    value={form.website}
                    onChange={(event) =>
                      updateField(
                        "website",
                        event.target.value,
                      )
                    }
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div
                aria-live="polite"
                className="mt-5"
              >
                {success && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
                    <CheckCircle2
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p>
                        {
                          successMessage
                        }
                      </p>

                      <p className="mt-1 font-normal text-emerald-700/80">
                        Customer email
                        provided hone par
                        confirmation email
                        bhi send ki gayi hai.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-600"
                  >
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a] disabled:cursor-not-allowed disabled:bg-black/40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="animate-spin"
                        size={18}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Message
                    </>
                  )}
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#922424] bg-white px-7 py-3.5 text-sm font-bold text-[#922424] transition hover:bg-[#fff1f1]"
                >
                  <MessageCircle
                    size={18}
                  />
                  Chat on WhatsApp
                </a>
              </div>

              <p className="mt-4 text-xs leading-5 text-black/45">
                By submitting this form,
                you agree that Krinay may
                contact you regarding your
                enquiry. Please avoid sharing
                payment passwords, OTPs or
                sensitive banking details.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
}) {
  const content = (
    <div className="flex gap-4 rounded-2xl border border-[#eadada] bg-white p-5 transition hover:border-[#d9bcbc]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-black/45">
          {title}
        </p>

        <p className="mt-1 text-sm font-bold leading-6 text-black">
          {text}
        </p>
      </div>
    </div>
  );

  return href ? (
    <a href={href}>{content}</a>
  ) : (
    content
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-black"
      >
        {label}

        {required && (
          <span className="text-[#922424]">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#decaca] px-4 py-3 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
      />
    </div>
  );
}