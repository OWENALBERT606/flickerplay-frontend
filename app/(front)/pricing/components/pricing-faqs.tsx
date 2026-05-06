"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const FAQS = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept MTN Mobile Money, Airtel Money, Visa, Mastercard, and PayPal. All payments are processed securely through trusted payment gateways.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period. No refunds are provided for partial periods.",
  },
  {
    question: "What happens when my subscription expires?",
    answer: "When your subscription expires, you'll lose access to premium content. However, your watch history and My List will be saved. You can resubscribe anytime to regain access.",
  },
  {
    question: "Can I download movies and watch offline?",
    answer: "Yes! All plans include unlimited downloads. You can download movies and series to watch offline on the Flickerplay mobile app. Downloads are available for the duration of your subscription.",
  },
  {
    question: "How many devices can I watch on simultaneously?",
    answer: "It depends on your plan: 24-Hour plan (1 device), Weekly (2 devices), Monthly (3 devices), 3 Months (4 devices), 6 Months (5 devices), Annual (unlimited devices).",
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 24-hour access plan for just 1,500 UGX which is perfect for trying out our service. This gives you full access to all features for one day.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes! You can upgrade your plan at any time. The cost difference will be prorated. Downgrades take effect at the end of your current billing period.",
  },
  {
    question: "What quality are the videos?",
    answer: "Video quality depends on your plan: 24-Hour plan offers HD, Weekly offers HD & Full HD, and Monthly plans and above offer Full HD & 4K quality where available.",
  },
  {
    question: "Do you add new content regularly?",
    answer: "Yes! We add new movies and series every week. Subscribers with Monthly plans and above get early access to new releases before they're available to others.",
  },
  {
    question: "Can I share my account with family?",
    answer: "Yes! Depending on your plan, you can watch on multiple devices simultaneously. The Annual plan allows unlimited devices, perfect for families.",
  },
  {
    question: "What is the renewal bonus?",
    answer: "When you renew a 6-Month plan, you get 1 free month added. Annual plan renewals get 2 free months added to your subscription automatically.",
  },
  {
    question: "How do I gift a subscription?",
    answer: "Annual plan subscribers can gift a 1-month subscription to a friend. After subscribing, you'll find the 'Gift Subscription' option in your account settings.",
  },
  {
    question: "What is exclusive content?",
    answer: "Quarterly plans and above get access to exclusive behind-the-scenes footage, director's cuts, interviews, and special documentaries not available on lower-tier plans.",
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely! We use industry-standard encryption and work with certified payment processors. We never store your full card details on our servers.",
  },
  {
    question: "Can I get a refund?",
    answer: "Due to the digital nature of our service, we generally don't offer refunds once you've accessed the content. However, if you experience technical issues, please contact our support team.",
  },
  {
    question: "What happens to my downloads when I cancel?",
    answer: "Downloaded content will remain on your device but will become inaccessible once your subscription expires. They'll be available again if you resubscribe.",
  },
  {
    question: "Do you offer student or group discounts?",
    answer: "Currently, we don't offer student discounts, but our longer-term plans (3-month, 6-month, and Annual) already include significant savings compared to monthly subscriptions.",
  },
  {
    question: "Can I watch on my Smart TV?",
    answer: "Yes! You can watch on Smart TVs, smartphones, tablets, and computers. Simply log in with your account credentials on any supported device.",
  },
];

export function PricingFAQ() {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Everything you need to know about our subscription plans
        </p>
      </div>

      <Card className="p-6 max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Contact Support */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Still have questions?
        </p>
        <Link
          href="mailto:support@flickerplay.com"
          className="text-orange-500 hover:text-orange-600 font-semibold"
        >
          Contact our support team →
        </Link>
      </div>
    </div>
  );
}