"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    duration: "forever",
    icon: Zap,
    color: "text-blue-500",
    features: [
      "Watch 3 movies for free",
      "No credit card required",
      "HD quality streaming",
      "Watch on any device",
      "No series access",
    ]
  },
  {
    id: "test",
    name: "Test Plan",
    price: 100,
    duration: "1 hour",
    icon: Zap,
    color: "text-gray-400",
    features: [
      "Testing only",
      "Valid for 1 hour",
    ]
  },
  {
    id: "daily",
    name: "Daily",
    price: 1000,
    duration: "24 hours",
    icon: Zap,
    color: "text-green-500",
    features: [
      "Unlimited movies & series",
      "HD streaming",
      "Ad-free experience",
      "Watch on 1 device",
    ]
  },
  {
    id: "weekly",
    name: "Weekly",
    price: 2500,
    duration: "7 days",
    icon: Zap,
    color: "text-blue-500",
    features: [
      "Unlimited movies & series",
      "Full HD streaming",
      "Download movies",
      "Ad-free experience",
      "Watch on 1 device",
    ]
  },
  {
    id: "two_weeks",
    name: "2 Weeks",
    price: 3500,
    duration: "14 days",
    icon: Zap,
    color: "text-purple-500",
    features: [
      "Unlimited movies & series",
      "Full HD & 4K streaming",
      "Unlimited downloads",
      "Ad-free experience",
      "Watch on 2 devices",
    ]
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 6000,
    duration: "30 days",
    popular: true,
    icon: Crown,
    color: "text-orange-500",
    features: [
      "Unlimited movies & series",
      "Full HD & 4K streaming",
      "Unlimited downloads",
      "Ad-free experience (No Ads)",
      "Watch on up to 3 devices",
      "Early access to new releases",
    ]
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 15000,
    duration: "3 months",
    icon: Crown,
    color: "text-amber-600",
    features: [
      "Everything in Monthly",
      "Valid for 90 days",
      "Watch on up to 4 devices",
      "Priority support",
    ]
  },
  {
    id: "semiannual",
    name: "6 Months",
    price: 25000,
    duration: "6 months",
    icon: Crown,
    color: "text-indigo-500",
    features: [
      "Everything in Quarterly",
      "Valid for 180 days",
      "Watch on up to 5 devices",
      "Exclusive preview of upcoming content",
    ]
  },
  {
    id: "annual",
    name: "Annual",
    price: 45000,
    duration: "1 year",
    bestValue: true,
    icon: Crown,
    color: "text-rose-500",
    features: [
      "Best overall value",
      "Unlimited devices simultaneously",
      "Valid for 365 days",
      "Lifetime membership badge",
    ]
  }
];

interface PricingCardsProps {
  userId?: string;
}

export function PricingCards({ userId }: PricingCardsProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (!userId) {
      toast.error("Please login to subscribe");
      router.push(`/login?redirect=/pricing&plan=${planId}`);
      return;
    }

    setSelectedPlan(planId);
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
      {PLANS.map((plan) => {
        const Icon = plan.icon;
        const isPopular = plan.popular;
        const p = plan as typeof plan & { bestValue?: boolean; originalPrice?: number; savings?: string };
        const isBestValue = p.bestValue;

        return (
          <Card
            key={plan.id}
            className={`relative p-6 flex flex-col ${
              isPopular || isBestValue
                ? "border-2 border-orange-500 shadow-lg shadow-orange-500/20"
                : ""
            }`}
          >
            {/* Badge */}
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">
                Most Popular
              </Badge>
            )}
            {isBestValue && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500">
                Best Value
              </Badge>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <Icon className={`w-12 h-12 mx-auto mb-3 ${plan.color}`} />
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                {p.originalPrice && (
                  <span className="text-muted-foreground line-through text-sm mr-2">
                    {p.originalPrice.toLocaleString()} UGX
                  </span>
                )}
                <span className="text-4xl font-bold">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> UGX</span>
              </div>
              <p className="text-muted-foreground text-sm">{plan.duration}</p>
              {p.savings && (
                <p className="text-green-500 text-sm font-semibold mt-1">
                  {p.savings}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-auto">
              <Button
                className={`w-full ${
                  isPopular || isBestValue
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={selectedPlan === plan.id}
              >
                {selectedPlan === plan.id
                  ? "Processing..."
                  : plan.id === "free"
                  ? "Get Started Free"
                  : "Subscribe Now"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}