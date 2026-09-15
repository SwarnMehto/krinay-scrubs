"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  const [
    inventory,
    setInventory,
  ] =
    useState<InventoryItem[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  const loadInventory =
    useCallback(async () => {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/admin/inventory",
            {
              cache:
                "no-store",
            },
          );

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

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  async function initializeInventory() {
    setMessage(
      "Creating inventory...",
    );

    try {
      const response =
        await fetch(
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
        data.message,
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

    setInventory(
      (current) =>
        current.map(
          (item) => {
            if (
              item.productId !==
                productId ||
              item.color !==
                color
            ) {
              return item;
            }

            const field =
              part === "top"
                ? "topStock"
                : "bottomStock";

            return {
              ...item,

              [field]:
                item[
                  field
                ].map(
                  (entry) =>
                    entry.size ===
                    size
                      ? {
                          ...entry,
                          stock,
                        }
                      : entry,
                ),
            };
          },
        ),
    );

    try {
      const response =
        await fetch(
          "/api/admin/inventory",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                productId,
                color,
                part,
                size,
                stock,
              }),
          },
        );

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

      await loadInventory();
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#922424]">
              KRINAY ADMIN
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Inventory
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage Top and Bottom
              stock separately for
              every colour and size.
            </p>
          </div>

          {inventory.length ===
            0 && (
            <button
              type="button"
              onClick={() =>
                void initializeInventory()
              }
              className="rounded-xl bg-[#922424] px-5 py-3 text-sm font-black text-white"
            >
              Initialize Inventory
            </button>
          )}
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
            {message}
          </div>
        )}

        {inventory.length ===
        0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-xl font-black">
              Inventory not initialized
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Click Initialize
              Inventory once.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {inventory.map(
              (item) => (
                <div
                  key={
                    item._id
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs font-black uppercase tracking-wider text-[#922424]">
                      {
                        item.gender
                      }
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      {
                        item.color
                      }
                    </h2>
                  </div>

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
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
        {entries.map(
          (entry) => (
            <label
              key={
                entry.size
              }
              className="rounded-xl bg-slate-50 p-3"
            >
              <span className="text-xs font-black text-slate-500">
                {
                  entry.size
                }
              </span>

              <input
                type="number"
                min={0}
                value={
                  entry.stock
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    Number(
                      event
                        .target
                        .value,
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
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-black outline-none focus:border-[#922424]"
              />
            </label>
          ),
        )}
      </div>
    </div>
  );
}