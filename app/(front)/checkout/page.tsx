


import { redirect } from "next/navigation";
import { getSession } from "@/actions/auth";
import { CheckoutForm } from "./components/checkout-form";

const PLANS = {
  test: { name: "Test Plan", price: 100, duration: 1 },
  daily: { name: "Daily", price: 1000, duration: 1 },
  weekly: { name: "Weekly", price: 2500, duration: 7 },
  two_weeks: { name: "2 Weeks", price: 3500, duration: 14 },
  monthly: { name: "Monthly", price: 6000, duration: 30 },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await getSession();
  
  // ✅ Await searchParams
  const params = await searchParams;
  const planId = params?.plan ?? "monthly";

  if (!session?.user) {
    redirect(`/login?redirect=/checkout&plan=${planId}`);
  }

  const plan = PLANS[planId as keyof typeof PLANS];

  if (!plan) {
    redirect("/pricing");
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-muted-foreground">
            You're subscribing to the {plan.name} plan
          </p>
        </div>

        <CheckoutForm
          plan={{
            id: planId,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
          }}
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            phone: session.user.phone,
          }}
        />
      </div>
    </div>
  );
}