import InvoiceClient from "@/components/invoice/InvoiceClient";

export const dynamic =
  "force-dynamic";

type InvoicePageProps = {
  params: Promise<{
    orderNumber: string;
  }>;

  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function InvoicePage({
  params,
  searchParams,
}: InvoicePageProps) {
  const {
    orderNumber,
  } = await params;

  const {
    token = "",
  } = await searchParams;

  return (
    <InvoiceClient
      orderNumber={
        orderNumber
      }
      token={token}
    />
  );
}