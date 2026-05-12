import { getSession } from "@/actions/auth";
import { PricingCards } from "./components/pricing-cards";
import { PricingFeatures } from "./components/pricing-features";
import { PricingFAQ } from "./components/pricing-faqs";

export default async function PricingPage() {
  const session = await getSession();
  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlimited movies, series, and entertainment. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <PricingCards userId={userId} />

        {/* Features Comparison */}
        <PricingFeatures />
        {/* FAQ */}
        <PricingFAQ />

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">We Accept</h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-muted-foreground">MTN Mobile Money</div>
            <div className="text-muted-foreground">Airtel Money</div>
          </div>
        </div>
      </div>
    </div>
  );
}