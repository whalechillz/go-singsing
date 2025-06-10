"use client";

import PaymentManager from "@/components/payments/PaymentManager";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get('tourId') || undefined;
  
  return <PaymentManager tourId={tourId} />;
}

export default function PaymentsPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
