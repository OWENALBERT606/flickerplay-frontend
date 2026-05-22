"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Check } from "lucide-react";

interface PricingCardProps {
  userId?: string;
}

const plans = [
  { id: "daily", name: "Daily Pass", price: "1,000", period: "day", popular: false, features: ["All content", "HD streaming", "24-hour access"] },
  { id: "weekly", name: "Weekly", price: "2,500", period: "week", popular: false, features: ["All content", "Full HD", "7-day access", "Downloads"] },
  { id: "monthly", name: "Monthly", price: "6,000", period: "month", popular: true, features: ["All content", "4K streaming", "30-day access", "Downloads", "Ad-free"] },
  { id: "annual", name: "Annual", price: "45,000", period: "year", popular: false, features: ["All content", "4K streaming", "365-day access", "Downloads", "Ad-free", "Early access"] },
];

export function PricingCards({ userId }: PricingCardProps) {
  const router = useRouter();

  const handleSelect = (planId: string) => {
    if (!userId) {
      router.push(`/login?redirect=/pricing&plan=${planId}`);
      return;
    }
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative bg-card rounded-xl border-2 p-6 ${
            plan.popular ? "border-orange-500 shadow-lg shadow-orange-500/20" : "border-border"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
              Most Popular
            </div>
          )}
          <div className="text-center mb-6">
            <p className="text-3xl font-bold mb-1">{plan.price}</p>
            <p className="text-sm text-muted-foreground">UGX / {plan.period}</p>
          </div>
          <h3 className="text-lg font-semibold text-center mb-4">{plan.name}</h3>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleSelect(plan.id)}
            className={`w-full ${plan.popular ? "bg-orange-500 hover:bg-orange-600" : ""}`}
            variant={plan.popular ? "default" : "outline"}
          >
            Select Plan
          </Button>
        </div>
      ))}
    </div>
  );
}
