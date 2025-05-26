"use client";

import PaymentManager from "@/components/payments/PaymentManager";

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">결제 관리</h1>
      <PaymentManager />
    </div>
  );
}