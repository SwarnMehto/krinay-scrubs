export function getIncludedGst(
  amount: number,
  rate = 5,
) {
  return Number(
    (
      (amount * rate) /
      (100 + rate)
    ).toFixed(2),
  );
}

export function getTaxableValue(
  amount: number,
  rate = 5,
) {
  const gst =
    getIncludedGst(
      amount,
      rate,
    );

  return Number(
    (amount - gst).toFixed(2),
  );
}

export function splitGst(
  amount: number,
  customerState: string,
) {
  const gst =
    getIncludedGst(
      amount,
      5,
    );

  const isDelhi =
    customerState
      .trim()
      .toLowerCase() ===
    "delhi";

  if (isDelhi) {
    const cgst = Number(
      (gst / 2).toFixed(2),
    );

    const sgst = Number(
      (gst - cgst).toFixed(2),
    );

    return {
      gstRate: 5,
      cgst,
      sgst,
      igst: 0,
      totalGst: gst,
    };
  }

  return {
    gstRate: 5,
    cgst: 0,
    sgst: 0,
    igst: gst,
    totalGst: gst,
  };
}