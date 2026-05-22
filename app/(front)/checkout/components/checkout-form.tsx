"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone } from "lucide-react";

interface CheckoutFormProps {
  plan: { id: string; name: string; price: number; duration: number };
  user: { id: string; name: string; email: string; phone: string | null };
}

export function CheckoutForm({ plan, user }: CheckoutFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"mobile" | "card" | "paypal">("mobile");

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <span className="text-muted-foreground">{plan.name} Plan</span>
          <span className="font-bold">{plan.price.toLocaleString()} UGX</span>
        </div>
        <div className="flex justify-between items-center pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-orange-500">{plan.price.toLocaleString()} UGX</span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="flex gap-3 mb-6">
          <Button
            variant={method === "mobile" ? "default" : "outline"}
            onClick={() => setMethod("mobile")}
            className="flex-1"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile Money
          </Button>
          <Button
            variant={method === "card" ? "default" : "outline"}
            onClick={() => setMethod("card")}
            className="flex-1"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Card
          </Button>
        </div>

        {method === "mobile" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">You will receive a payment request on your phone.</p>
            <Button
              onClick={() => router.push(`/payment/status?plan=${plan.id}`)}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Pay {plan.price.toLocaleString()} UGX
            </Button>
          </div>
        )}

        {method === "card" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Card payments are processed securely.</p>
            <Button
              onClick={() => router.push(`/payment/status?plan=${plan.id}`)}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Pay {plan.price.toLocaleString()} UGX
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
