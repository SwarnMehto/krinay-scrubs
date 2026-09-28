"use client";

import { useEffect, useMemo, useState } from "react";
import { Ruler, X } from "lucide-react";

type SizeGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
};

type Unit = "in" | "cm";

type SizeRow = {
  size: string;
  chest: string;
  waist: string;
  hip: string;
  topLength: string;
  pantLength: string;
};

const menSizeChart: SizeRow[] = [
  { size: "XS", chest: "36–38", waist: "28–30", hip: "36–38", topLength: "27", pantLength: "39" },
  { size: "S", chest: "38–40", waist: "30–32", hip: "38–40", topLength: "27.5", pantLength: "39.5" },
  { size: "M", chest: "40–42", waist: "32–34", hip: "40–42", topLength: "28", pantLength: "40" },
  { size: "L", chest: "42–44", waist: "34–36", hip: "42–44", topLength: "28.5", pantLength: "40.5" },
  { size: "XL", chest: "44–46", waist: "36–38", hip: "44–46", topLength: "29", pantLength: "41" },
  { size: "XXL", chest: "46–48", waist: "38–40", hip: "46–48", topLength: "29.5", pantLength: "41.5" },
  { size: "3XL", chest: "48–50", waist: "40–42", hip: "48–50", topLength: "30", pantLength: "42" },
];

const womenSizeChart: SizeRow[] = [
  { size: "XS", chest: "32–34", waist: "26–28", hip: "34–36", topLength: "25.5", pantLength: "38" },
  { size: "S", chest: "34–36", waist: "28–30", hip: "36–38", topLength: "26", pantLength: "38.5" },
  { size: "M", chest: "36–38", waist: "30–32", hip: "38–40", topLength: "26.5", pantLength: "39" },
  { size: "L", chest: "38–40", waist: "32–34", hip: "40–42", topLength: "27", pantLength: "39.5" },
  { size: "XL", chest: "40–42", waist: "34–36", hip: "42–44", topLength: "27.5", pantLength: "40" },
  { size: "XXL", chest: "42–44", waist: "36–38", hip: "44–46", topLength: "28", pantLength: "40.5" },
  { size: "3XL", chest: "44–46", waist: "38–40", hip: "46–48", topLength: "28.5", pantLength: "41" },
];

function convertPart(value: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const converted = number * 2.54;
  return Number.isInteger(converted)
    ? String(converted)
    : converted.toFixed(1).replace(/\.0$/, "");
}

function convertMeasurement(value: string, unit: Unit) {
  if (unit === "in") return value;

  return value
    .split(/(–|-)/)
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed === "–" || trimmed === "-") return "–";
      return convertPart(trimmed);
    })
    .join("");
}

function MeasurementInstruction({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#922424] text-xs font-black text-white">
        {number}
      </span>
      <div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function ScrubMeasurementDiagram() {
  return (
    <div className="rounded-2xl border border-[#eadada] bg-[#fff8f8] p-4">
      <svg
        viewBox="0 0 520 360"
        role="img"
        aria-label="Scrub measurement diagram"
        className="mx-auto h-auto w-full max-w-xl"
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#922424" />
          </marker>
        </defs>

        <path
          d="M155 70 L205 38 L260 70 L315 38 L365 70 L340 125 L315 110 L315 285 L205 285 L205 110 L180 125 Z"
          fill="#ffffff"
          stroke="#1f2937"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M242 58 L260 92 L278 58" fill="none" stroke="#922424" strokeWidth="4" strokeLinecap="round" />
        <rect x="275" y="145" width="28" height="35" rx="3" fill="none" stroke="#64748b" strokeWidth="3" />

        <line x1="200" y1="135" x2="320" y2="135" stroke="#922424" strokeWidth="3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="260" y="124" textAnchor="middle" fill="#922424" fontSize="16" fontWeight="700">CHEST</text>

        <line x1="207" y1="215" x2="313" y2="215" stroke="#922424" strokeWidth="3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="260" y="204" textAnchor="middle" fill="#922424" fontSize="16" fontWeight="700">WAIST</text>

        <line x1="205" y1="72" x2="315" y2="72" stroke="#922424" strokeWidth="3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="260" y="48" textAnchor="middle" fill="#922424" fontSize="16" fontWeight="700">SHOULDER</text>

        <line x1="385" y1="72" x2="385" y2="282" stroke="#922424" strokeWidth="3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <text x="404" y="180" fill="#922424" fontSize="16" fontWeight="700" transform="rotate(90 404 180)">TOP LENGTH</text>
      </svg>
    </div>
  );
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  category = "",
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<Unit>("in");

  const normalizedCategory = category.toLowerCase();
  const isWomen =
    normalizedCategory.includes("women") ||
    normalizedCategory.includes("woman") ||
    normalizedCategory.includes("female");

  const title = isWomen
    ? "Women’s Scrubs Size Guide"
    : "Men’s Scrubs Size Guide";

  const rawSizeChart = isWomen ? womenSizeChart : menSizeChart;

  const sizeChart = useMemo(
    () =>
      rawSizeChart.map((row) => ({
        ...row,
        chest: convertMeasurement(row.chest, unit),
        waist: convertMeasurement(row.waist, unit),
        hip: convertMeasurement(row.hip, unit),
        topLength: convertMeasurement(row.topLength, unit),
        pantLength: convertMeasurement(row.pantLength, unit),
      })),
    [rawSizeChart, unit],
  );

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#eadada] bg-white px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#922424]">
              <Ruler size={22} />
            </div>

            <div>
              <h2 id="size-guide-title" className="text-lg font-black text-slate-950 sm:text-2xl">
                {title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Garment measurements · currently showing {unit === "in" ? "inches" : "centimetres"}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  unit === "in"
                    ? "bg-[#922424] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#922424]"
                }`}
              >
                IN
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  unit === "cm"
                    ? "bg-[#922424] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#922424]"
                }`}
              >
                CM
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#922424] hover:bg-[#fff1f1] hover:text-[#922424]"
              aria-label="Close size guide"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">Size chart</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Choose your size according to your body and preferred fit.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#922424]">
                Unit: {unit === "in" ? "INCHES" : "CM"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#922424] text-white">
                  <tr>
                    <th className="border-r border-white/20 px-4 py-4 font-bold">Size</th>
                    <th className="border-r border-white/20 px-4 py-4 font-bold">Chest</th>
                    <th className="border-r border-white/20 px-4 py-4 font-bold">Waist</th>
                    <th className="border-r border-white/20 px-4 py-4 font-bold">Hip</th>
                    <th className="border-r border-white/20 px-4 py-4 font-bold">Top Length</th>
                    <th className="px-4 py-4 font-bold">Pant Length</th>
                  </tr>
                </thead>

                <tbody>
                  {sizeChart.map((row, index) => (
                    <tr key={row.size} className={index % 2 === 0 ? "bg-white" : "bg-[#fff8f8]"}>
                      <td className="border-r border-t border-slate-200 px-4 py-4 font-black text-[#922424]">{row.size}</td>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{row.chest}</td>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{row.waist}</td>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{row.hip}</td>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{row.topLength}</td>
                      <td className="border-t border-slate-200 px-4 py-4 text-slate-700">{row.pantLength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Note: Measurements may vary slightly due to fabric and manufacturing tolerance.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h3 className="text-lg font-black text-slate-950">How to measure</h3>

              <div className="mt-4 space-y-4">
                <MeasurementInstruction
                  number="1"
                  title="Chest"
                  description="Measure around the fullest part of your chest. Keep the tape straight and comfortably relaxed."
                />
                <MeasurementInstruction
                  number="2"
                  title="Waist"
                  description="Measure around your natural waistline while standing normally."
                />
                <MeasurementInstruction
                  number="3"
                  title="Hip"
                  description="Measure around the fullest part of your hips while keeping your feet together."
                />
                <MeasurementInstruction
                  number="4"
                  title="Top length"
                  description="Measure from the highest shoulder point down to the desired bottom hem of the scrub top."
                />
                <MeasurementInstruction
                  number="5"
                  title="Pant length"
                  description="Measure from the waist down to the ankle along the outside of the leg."
                />
              </div>
            </div>

            <ScrubMeasurementDiagram />
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Fit Advisory: Athletic Fit features a tailored, high-performance silhouette.
If you prefer your regular fit or are between sizes, please size up (e.g., Small → Medium).

        
          </div>
        </div>
      </div>
    </div>
  );
}