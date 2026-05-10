"use client";

import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const FEATURES_COMPARISON = [
  {
    feature: "Movies",
    free: "5 movies/month",
    monthly: "Unlimited",
  },
  {
    feature: "Series",
    free: false,
    monthly: true,
  },
  {
    feature: "Video Quality",
    free: "HD",
    monthly: "Full HD & 4K",
  },
  {
    feature: "Downloads",
    free: false,
    monthly: true,
  },

  {
    feature: "Ads During Playback",
    free: true,
    monthly: false,
  },
  {
    feature: "Ad-Free Experience",
    free: false,
    monthly: true,
  },
  {
    feature: "Simultaneous Devices",
    free: "1 device",
    monthly: "3 devices",
  },
  {
    feature: "Early Access to New Releases",
    free: false,
    monthly: true,
  },
  {
    feature: "Offline Viewing",
    free: false,
    monthly: true,
  },
  {
    feature: "Customer Support",
    free: "Standard",
    monthly: "Priority",
  },
];

export function PricingFeatures() {
  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-500 mx-auto" />
      );
    }
    return <span className="text-sm text-center block">{value}</span>;
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Compare Plans</h2>
        <p className="text-muted-foreground">
          See what's included in each plan
        </p>
      </div>

      {/* Desktop Table */}
      <Card className="hidden lg:block overflow-hidden max-w-3xl mx-auto">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="w-[250px] font-bold">Features</TableHead>
                <TableHead className="text-center font-bold">Free</TableHead>
                <TableHead className="text-center font-bold bg-orange-500/10">
                  Monthly
                  <div className="text-xs text-orange-500 font-normal">6,000 UGX/mo</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURES_COMPARISON.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="text-center">{renderCell(row.free)}</TableCell>
                  <TableCell className="text-center bg-orange-500/5">
                    {renderCell(row.monthly)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {["free", "monthly"].map((plan) => (
          <Card key={plan} className="p-4">
            <h3 className="font-bold text-lg mb-4 capitalize">
              {plan === "free" ? "Free" : "Monthly — 6,000 UGX"}
            </h3>
            <div className="space-y-2">
              {FEATURES_COMPARISON.map((row, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{row.feature}</span>
                  <div>{renderCell(row[plan as keyof typeof row])}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
