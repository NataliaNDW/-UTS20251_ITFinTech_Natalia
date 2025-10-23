import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ external_id?: string }>;
}) {
  const params = await searchParams;
  const externalId = params?.external_id;
  return (
    <div className="max-w-md mx-auto p-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Pembayaran Berhasil!</h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Terima kasih, pembayaran Anda telah berhasil diproses.</p>
          {externalId && (
            <div className="mb-2 text-sm text-gray-500">ID Transaksi: {externalId}</div>
          )}
          <Link href="/products">
            <Button variant="default">Kembali ke Produk</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
