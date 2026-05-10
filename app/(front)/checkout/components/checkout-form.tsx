"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CreditCard, Wallet, Check, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { MobileMoneyForm } from "./mobile-money-form";
import { CardPaymentForm } from "./card-payment-form";
import { PayPalForm } from "./paypal-form";

type PaymentMethod = "mobile_money" | "card" | "paypal";

interface CheckoutFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export function CheckoutForm({ plan, user }: CheckoutFormProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const paymentMethods = [
    {
      id: "mobile_money" as PaymentMethod,
      name: "Mobile Money",
      description: "MTN & Airtel Money",
      icon: Smartphone,
      popular: true,
    },
    {
      id: "card" as PaymentMethod,
      name: "Debit/Credit Card",
      description: "Visa, Mastercard",
      icon: CreditCard,
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      description: "Pay with PayPal",
      icon: Wallet,
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{plan.duration} days</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-orange-500">
                  {plan.price.toLocaleString()} UGX
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-3">What's included:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unlimited movies & series</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Full HD & 4K streaming</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unlimited downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ad-free experience</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Watch on up to 3 devices</span>
              </li>
            </ul>
          </div>

          {/* Secure Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure payment processing
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Choose Payment Method</h2>

          {/* Payment Method Selection */}
          {!selectedMethod && (
            <div className="grid gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="relative flex items-center gap-4 p-4 border-2 border-border rounded-lg hover:border-orange-500 transition-colors text-left"
                  >
                    {method.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500">
                        Popular
                      </Badge>
                    )}
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* Payment Forms */}
          {selectedMethod === "mobile_money" && (
            <MobileMoneyForm
              plan={plan}
              user={user}
              onBack={() => setSelectedMethod(null)}
            />
          )}

          {selectedMethod === "card" && (
            <CardPaymentForm
              plan={plan}
              user={user}
              onBack={() => setSelectedMethod(null)}
            />
          )}

          {selectedMethod === "paypal" && (
            <PayPalForm
              plan={plan}
              user={user}
              onBack={() => setSelectedMethod(null)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}