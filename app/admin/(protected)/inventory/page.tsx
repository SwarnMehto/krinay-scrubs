"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

type StockEntry = {
  size: string;
  stock: number;
};

type InventoryItem = {
  _id: string;
  productId: string;
  productName: string;
  gender: string;
  color: string;
  topStock: StockEntry[];
  bottomStock: StockEntry[];
};

export default function AdminInventoryPage() {
  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  /*
   * =======================================================
   * LOAD INVENTORY
   * =======================================================
   */
  const loadInventory =
    useCallback(async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          "/api/admin/inventory",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        /*
         * Session expired / unauthorized
         */
        if (response.status === 401) {
          window.location.href =
            "/admin/login";

          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load inventory.",
          );
        }

        setInventory(
          data.inventory ?? [],
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load inventory.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */
  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  /*
   * =======================================================
   * INITIALIZE INVENTORY
   * =======================================================
   */
  async function initializeInventory() {
    setMessage(
      "Creating inventory...",
    );

    try {
      const response = await fetch(
        "/api/inventory",
        {
          method: "POST",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Initialization failed.",
        );
      }

      setMessage(
        data.message ||
          "Inventory initialized successfully.",
      );

      await loadInventory();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Initialization failed.",
      );
    }
  }

  /*
   * =======================================================
   * UPDATE STOCK
   * =======================================================
   */
  async function updateStock(
    productId: string,
    color: string,
    part: "top" | "bottom",
    size: string,
    stock: number,
  ) {
    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return;
    }

    /*
     * Update UI immediately.
     */
    setInventory((current) =>
      current.map((item) => {
        if (
          item.productId !==
            productId ||
          item.color !== color
        ) {
          return item;
        }

        const field =
          part === "top"
            ? "topStock"
            : "bottomStock";

        return {
          ...item,

          [field]: item[field].map(
            (entry) =>
              entry.size === size
                ? {
                    ...entry,
                    stock,
                  }
                : entry,
          ),
        };
      }),
    );

    try {
      const response = await fetch(
        "/api/admin/inventory",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId,
            color,
            part,
            size,
            stock,
          }),
        },
      );

      /*
       * Session expired.
       */
      if (response.status === 401) {
        window.location.href =
          "/admin/login";

        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Stock update failed.",
        );
      }

      setMessage(
        `${color} ${part} ${size} stock updated to ${stock}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Stock update failed.",
      );

      /*
       * Restore actual DB values if
       * update failed.
       */
      await loadInventory();
    }
  }

  /*
   * =======================================================
   * LOADING
   * =======================================================
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Loading inventory...
          </div>
        </div>
      </div>
    );
  }

  /*
   * =======================================================
   * PAGE
   * =======================================================
   */
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ================================================
            ADMIN HEADER
        ================================================= */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
              KRINAY ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Inventory
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Manage Top and Bottom
              stock separately for
              every colour and size.
            </p>
          </div>

          {/* ADMIN ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/change-password"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#922424] hover:text-[#922424]"
            >
              Change Password
            </Link>

            <AdminLogoutButton />
          </div>
        </div>

        {/* ================================================
            MESSAGE
        ================================================= */}
        {message && (
          <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="shrink-0 text-xs font-black text-slate-400 transition hover:text-slate-700"
              aria-label="Close message"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================================================
            EMPTY INVENTORY
        ================================================= */}
        {inventory.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Inventory not initialized
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Initialize the inventory
              once to create Top and
              Bottom stock records for
              your scrub variants.
            </p>

            <button
              type="button"
              onClick={() =>
                void initializeInventory()
              }
              className="mt-6 rounded-xl bg-[#922424] px-6 py-3 text-sm font-black text-white transition hover:bg-[#7d1f1f]"
            >
              Initialize Inventory
            </button>
          </div>
        ) : (
          /*
           * ===============================================
           * INVENTORY GRID
           * ===============================================
           */
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {inventory.map((item) => (
              <div
                key={item._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* PRODUCT HEADER */}
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#922424]">
                    {item.gender}
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {item.color}
                  </h2>

                  {item.productName && (
                    <p className="mt-1 text-xs text-slate-400">
                      {item.productName}
                    </p>
                  )}
                </div>

                {/* TOP */}
                <StockSection
                  title="Top Stock"
                  entries={
                    item.topStock
                  }
                  onChange={(
                    size,
                    stock,
                  ) =>
                    updateStock(
                      item.productId,
                      item.color,
                      "top",
                      size,
                      stock,
                    )
                  }
                />

                {/* BOTTOM */}
                <StockSection
                  title="Bottom Stock"
                  entries={
                    item.bottomStock
                  }
                  onChange={(
                    size,
                    stock,
                  ) =>
                    updateStock(
                      item.productId,
                      item.color,
                      "bottom",
                      size,
                      stock,
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * STOCK SECTION
 * =========================================================
 */
function StockSection({
  title,
  entries,
  onChange,
}: {
  title: string;
  entries: StockEntry[];

  onChange: (
    size: string,
    stock: number,
  ) => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <label
            key={entry.size}
            className="rounded-xl bg-slate-50 p-3"
          >
            <span className="text-xs font-black text-slate-500">
              {entry.size}
            </span>

            <input
              type="number"
              min={0}
              step={1}
              value={entry.stock}
              onChange={(event) => {
                /*
                 * Empty input ko temporary
                 * allow nahi kar rahe because
                 * current API instantly saves
                 * each change.
                 */
                if (
                  event.target.value ===
                  ""
                ) {
                  return;
                }

                const value =
                  Number(
                    event.target.value,
                  );

                if (
                  Number.isInteger(
                    value,
                  ) &&
                  value >= 0
                ) {
                  onChange(
                    entry.size,
                    value,
                  );
                }
              }}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-black text-slate-950 outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
            />
          </label>
        ))}
      </div>
    </div>
  );
}