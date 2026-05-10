"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { processMobileMoneyPayment, validateMobileMoneyPhone } from "@/actions/payments";

interface MobileMoneyFormProps {
  plan: { id: string; name: string; price: number; duration: number };
  user: { id: string; name: string; email: string; phone?: string };
  onBack: () => void;
}

export function MobileMoneyForm({ plan, user, onBack }: MobileMoneyFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [phoneNumber, setPhoneNumber] = useState(user.phone || "");

  // Live phone validation state
  const [validating, setValidating] = useState(false);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneValid(null);
    setCustomerName(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const clean = value.replace(/[\s\-()]/g, ""); // strip spaces, dashes, brackets
    // Only validate when we have a plausible number length (9 digits minimum)
    if (clean.replace(/\D/g, "").length < 9) return;

    debounceRef.current = setTimeout(async () => {
      setValidating(true);
      try {
        const result = await validateMobileMoneyPhone(clean);
        // Only mark invalid when Relworx explicitly confirmed it — not on API/network errors
        if (result.success) {
          setPhoneValid(result.valid);
          setCustomerName(result.customerName ?? null);
        } else {
          // Validation call itself failed — leave as unknown, don't block the user
          setPhoneValid(null);
        }
      } catch {
        setPhoneValid(null);
      } finally {
        setValidating(false);
      }
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, "");
    if (cleanPhone.replace(/\D/g, "").length < 9) {
      toast.error("Please enter a valid Ugandan phone number");
      return;
    }

    if (phoneValid === false) {
      toast.error("This phone number is not registered for Mobile Money");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processMobileMoneyPayment({
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        phoneNumber: cleanPhone,
        provider,
      });

      if (result.success) {
        toast.success("Payment request sent!", {
          description: "Approve the prompt on your phone to complete payment.",
        });
        router.push(`/payment/status?paymentId=${result.paymentId}`);
      } else {
        toast.error(result.error || "Payment failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button type="button" variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to payment methods
      </Button>

      {/* Provider selection */}
      <div>
        <Label className="mb-3 block">Select Provider</Label>
        <RadioGroup value={provider} onValueChange={(v: any) => setProvider(v)}>
          <div className="flex items-center space-x-2 border-2 border-border rounded-lg p-4 hover:border-orange-500 transition-colors">
            <RadioGroupItem value="mtn" id="mtn" />
            <Label htmlFor="mtn" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">MTN</div>
                <div>
                  <p className="font-semibold">MTN Mobile Money</p>
                  <p className="text-sm text-muted-foreground">Pay with MTN MoMo</p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border-2 border-border rounded-lg p-4 hover:border-orange-500 transition-colors">
            <RadioGroupItem value="airtel" id="airtel" />
            <Label htmlFor="airtel" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">AM</div>
                <div>
                  <p className="font-semibold">Airtel Money</p>
                  <p className="text-sm text-muted-foreground">Pay with Airtel Money</p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Phone number with live validation */}
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative mt-2">
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. 0701234567 or +256701234567"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
            className={`pr-10 ${
              phoneValid === true
                ? "border-green-500 focus-visible:ring-green-500"
                : phoneValid === false
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {!validating && phoneValid === true && <CheckCircle className="w-4 h-4 text-green-500" />}
            {!validating && phoneValid === false && <XCircle className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        {/* Customer name confirmation */}
        {customerName && phoneValid && (
          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified: {customerName}
          </p>
        )}
        {phoneValid === false && (
          <p className="text-xs text-red-500 mt-1">
            Number not registered for Mobile Money. Check and try again.
          </p>
        )}
        {!phoneValid && !validating && (
          <p className="text-xs text-muted-foreground mt-1">
            Enter the number registered with {provider === "mtn" ? "MTN" : "Airtel"} Mobile Money
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-sm">How it works:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click the Pay button below</li>
          <li>You'll receive a prompt on your phone</li>
          <li>Enter your Mobile Money PIN to confirm</li>
          <li>Your subscription activates instantly</li>
        </ol>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || phoneValid === false}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending request...
            </>
          ) : (
            `Pay ${plan.price.toLocaleString()} UGX`
          )}
        </Button>
      </div>
    </form>
  );
}
