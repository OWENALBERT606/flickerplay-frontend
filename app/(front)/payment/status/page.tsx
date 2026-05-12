"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/actions/payments";

type Status = "pending" | "processing" | "completed" | "failed" | "loading";

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      router.replace("/");
      return;
    }

    const poll = async () => {
      const result = await getPaymentStatus(paymentId);

      if (!result.success) {
        setStatus("failed");
        setMessage("Could not retrieve payment status. Please contact support.");
        return;
      }

      const paymentStatus: string = result.data?.status ?? "pending";

      if (paymentStatus === "COMPLETED") {
        router.replace("/payment/success");
        return;
      }

      if (paymentStatus === "FAILED") {
        setStatus("failed");
        setMessage(result.data?.failureReason || "Payment failed. Please try again.");
        return;
      }

      setStatus(paymentStatus.toLowerCase() as Status);
      setAttempts((prev) => prev + 1);
    };

    poll();

    // Poll every 5 seconds, max 24 times (2 min)
    const interval = setInterval(() => {
      setAttempts((prev) => {
        if (prev >= 24) {
          clearInterval(interval);
          setStatus("failed");
          setMessage("Payment timed out. If you were charged, contact support.");
          return prev;
        }
        poll();
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, router]);

  const icons: Record<Status, React.ReactNode> = {
    loading: <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />,
    pending: <Clock className="w-12 h-12 text-yellow-400" />,
    processing: <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />,
    completed: <CheckCircle className="w-12 h-12 text-green-500" />,
    failed: <XCircle className="w-12 h-12 text-red-500" />,
  };

  const titles: Record<Status, string> = {
    loading: "Checking payment...",
    pending: "Awaiting payment confirmation",
    processing: "Processing your payment...",
    completed: "Payment successful!",
    failed: "Payment failed",
  };

  const descriptions: Record<Status, string> = {
    loading: "Please wait while we check your payment.",
    pending: "Please approve the payment prompt on your phone.",
    processing: "Your payment is being processed. This may take a moment.",
    completed: "Your subscription is now active for 30 days.",
    failed: message || "Something went wrong with your payment.",
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mx-auto">
          {icons[status]}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{titles[status]}</h1>
          <p className="text-gray-400">{descriptions[status]}</p>
        </div>

        {(status === "pending" || status === "processing") && (
          <p className="text-sm text-gray-600">
            Checking automatically… ({attempts * 5}s elapsed)
          </p>
        )}

        {status === "failed" && (
          <div className="flex flex-col gap-3">
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/checkout?plan=monthly">Try Again</Link>
            </Button>
            <Button asChild variant="ghost" className="text-gray-400">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
