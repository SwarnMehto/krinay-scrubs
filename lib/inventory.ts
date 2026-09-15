import "server-only";

import Inventory from "@/models/Inventory";
import Order from "@/models/Order";

type InventoryPart =
  | "top"
  | "bottom";

type RequiredStock = {
  productId: string;
  color: string;
  part: InventoryPart;
  size: string;
  quantity: number;
};

function buildRequiredStock(
  order: InstanceType<typeof Order>,
): RequiredStock[] {
  const required =
    new Map<
      string,
      RequiredStock
    >();

  function add(
    input: RequiredStock,
  ) {
    if (
      !input.productId ||
      !input.color ||
      !input.size ||
      input.quantity <= 0
    ) {
      return;
    }

    const key = [
      input.productId,
      input.color,
      input.part,
      input.size,
    ].join("::");

    const existing =
      required.get(key);

    if (existing) {
      existing.quantity +=
        input.quantity;

      return;
    }

    required.set(
      key,
      {
        ...input,
      },
    );
  }

  for (const item of order.items) {
    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(
        quantity,
      ) ||
      quantity <= 0
    ) {
      continue;
    }

    if (
      item.purchaseType ===
        "set" ||
      item.purchaseType ===
        "top"
    ) {
      add({
        productId:
          item.productId,

        color:
          item.color,

        part: "top",

        size:
          item.topSize,

        quantity,
      });
    }

    if (
      item.purchaseType ===
        "set" ||
      item.purchaseType ===
        "bottom"
    ) {
      add({
        productId:
          item.productId,

        color:
          item.color,

        part: "bottom",

        size:
          item.bottomSize,

        quantity,
      });
    }
  }

  return Array.from(
    required.values(),
  );
}

function getStockField(
  part: InventoryPart,
) {
  return part === "top"
    ? "topStock"
    : "bottomStock";
}

/*
 * =========================================================
 * DEDUCT INVENTORY
 * =========================================================
 *
 * Important:
 *
 * Each individual Mongo update contains:
 *
 * stock >= required quantity
 *
 * Therefore stock can never become negative.
 *
 * If a later variant fails, previously deducted
 * variants are rolled back.
 */
export async function deductInventoryForOrder(
  order: InstanceType<typeof Order>,
) {
  if (
    order.inventoryDeducted
  ) {
    return {
      deducted: false,
      alreadyDeducted: true,
    };
  }

  const requirements =
    buildRequiredStock(
      order,
    );

  /*
   * Older/non-inventory products can continue
   * without variant inventory.
   */
  if (
    requirements.length === 0
  ) {
    order.inventoryDeducted =
      true;

    order.inventoryDeductedAt =
      new Date();

    order.inventoryRestored =
      false;

    order.inventoryRestoredAt =
      null;

    await order.save();

    return {
      deducted: true,
      alreadyDeducted: false,
    };
  }

  const completed: RequiredStock[] =
    [];

  try {
    for (
      const requirement
      of requirements
    ) {
      const field =
        getStockField(
          requirement.part,
        );

      const result =
        await Inventory.findOneAndUpdate(
          {
            productId:
              requirement.productId,

            color:
              requirement.color,

            [field]: {
              $elemMatch: {
                size:
                  requirement.size,

                stock: {
                  $gte:
                    requirement.quantity,
                },
              },
            },
          },

          {
            $inc: {
              [`${field}.$[variant].stock`]:
                -requirement.quantity,
            },
          },

          {
            new: true,

            arrayFilters: [
              {
                "variant.size":
                  requirement.size,
              },
            ],
          },
        );

      if (!result) {
        throw new Error(
          `${requirement.color} ${requirement.part} size ${requirement.size} does not have enough stock.`,
        );
      }

      completed.push(
        requirement,
      );
    }

    order.inventoryDeducted =
      true;

    order.inventoryDeductedAt =
      new Date();

    order.inventoryRestored =
      false;

    order.inventoryRestoredAt =
      null;

    await order.save();

    return {
      deducted: true,
      alreadyDeducted: false,
    };
  } catch (error) {
    /*
     * Roll back variants already deducted
     * during this attempt.
     */
    for (
      const requirement
      of completed.reverse()
    ) {
      const field =
        getStockField(
          requirement.part,
        );

      await Inventory.updateOne(
        {
          productId:
            requirement.productId,

          color:
            requirement.color,
        },

        {
          $inc: {
            [`${field}.$[variant].stock`]:
              requirement.quantity,
          },
        },

        {
          arrayFilters: [
            {
              "variant.size":
                requirement.size,
            },
          ],
        },
      );
    }

    throw error;
  }
}

/*
 * =========================================================
 * RESTORE INVENTORY
 * =========================================================
 *
 * Use later when a paid order is cancelled/refunded.
 */
export async function restoreInventoryForOrder(
  order: InstanceType<typeof Order>,
) {
  if (
    !order.inventoryDeducted ||
    order.inventoryRestored
  ) {
    return {
      restored: false,
    };
  }

  const requirements =
    buildRequiredStock(
      order,
    );

  for (
    const requirement
    of requirements
  ) {
    const field =
      getStockField(
        requirement.part,
      );

    await Inventory.updateOne(
      {
        productId:
          requirement.productId,

        color:
          requirement.color,
      },

      {
        $inc: {
          [`${field}.$[variant].stock`]:
            requirement.quantity,
        },
      },

      {
        arrayFilters: [
          {
            "variant.size":
              requirement.size,
          },
        ],
      },
    );
  }

  order.inventoryRestored =
    true;

  order.inventoryRestoredAt =
    new Date();

  await order.save();

  return {
    restored: true,
  };
}