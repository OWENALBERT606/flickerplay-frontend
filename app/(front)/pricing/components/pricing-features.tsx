import { Check } from "lucide-react";

const features = [
  { name: "Unlimited Movies & Series", free: true, premium: true },
  { name: "HD Streaming", free: true, premium: true },
  { name: "4K Streaming", free: false, premium: true },
  { name: "Ad-Free Experience", free: false, premium: true },
  { name: "Downloads", free: false, premium: true },
  { name: "Early Access", free: false, premium: true },
];

export function PricingFeatures() {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {features.map((f) => (
          <div key={f.name} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
            <span className="text-sm font-medium">{f.name}</span>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                {f.free ? <Check className="w-4 h-4 text-green-500" /> : "—"} Free
              </span>
              <span className="flex items-center gap-1">
                {f.premium ? <Check className="w-4 h-4 text-green-500" /> : "—"} Premium
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
