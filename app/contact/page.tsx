"use client";

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import {
  useState,
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

export default function ContactPage() {
  const [form, setForm] =
    useState<ContactForm>(initialForm);

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Message submit nahi ho paya.",
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

  return (
    <>
      <section className="bg-[#922424] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
            Contact Krinay
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            How can we help?
          </h1>

          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            Product, size, order, delivery or bulk-order related assistance ke
            liye humse contact karein.
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
                Hospitals, clinics and institutes bulk-order page se detailed
                requirement submit kar sakte hain.
              </p>

              <a
                href="/bulk-order"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#922424]"
              >
                Request Bulk Quote
              </a>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#eadada] bg-white p-6 sm:p-8"
          >
            <h2 className="text-2xl font-black text-black">
              Send a message
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full name"
                value={form.name}
                onChange={(value) =>
                  setForm({ ...form, name: value })
                }
                placeholder="Enter your name"
                required
              />

              <InputField
                label="Phone number"
                value={form.phone}
                onChange={(value) =>
                  setForm({ ...form, phone: value })
                }
                placeholder="10-digit mobile number"
                required
              />

              <InputField
                label="Email address"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm({ ...form, email: value })
                }
                placeholder="Enter your email"
              />

              <InputField
                label="Subject"
                value={form.subject}
                onChange={(value) =>
                  setForm({ ...form, subject: value })
                }
                placeholder="How can we help?"
                required
              />

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-black">
                  Message
                </label>

                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      message: event.target.value,
                    })
                  }
                  rows={6}
                  required
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-[#decaca] px-4 py-3 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
                />
              </div>

              {/* Spam honeypot */}
              <input
                type="text"
                value={form.website}
                onChange={(event) =>
                  setForm({
                    ...form,
                    website: event.target.value,
                  })
                }
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {success && (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} />
                Message received successfully.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a] disabled:bg-black/40"
            >
              <Send size={17} />
              {isSubmitting
                ? "Sending..."
                : "Send Message"}
            </button>
          </form>
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
    <div className="flex gap-4 rounded-2xl border border-[#eadada] bg-white p-5">
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

  return href ? <a href={href}>{content}</a> : content;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#decaca] px-4 py-3 text-sm outline-none focus:border-[#922424] focus:ring-2 focus:ring-[#f2dddd]"
      />
    </div>
  );
}