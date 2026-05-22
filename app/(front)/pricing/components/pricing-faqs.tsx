const faqs = [
  { q: "How does the free tier work?", a: "You can watch a limited number of movies for free each month with ads." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time." },
  { q: "What payment methods do you accept?", a: "We accept MTN Mobile Money and Airtel Money." },
];

export function PricingFAQ() {
  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="p-4 bg-card rounded-lg border border-border">
            <h3 className="font-semibold mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
