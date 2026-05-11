"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle2, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const banks = ["Maybank", "CIMB", "Public Bank"];

export default function FpxPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = React.useState(banks[0]);
  const [isPaying, setIsPaying] = React.useState(false);
  const [progress, setProgress] = React.useState(18);

  React.useEffect(() => {
    if (!isPaying) {
      return;
    }

    const progressTimer = window.setInterval(() => {
      setProgress((value) => Math.min(value + 18, 100));
    }, 450);
    const redirectTimer = window.setTimeout(() => {
      toast.success("FPX authorization confirmed", {
        description: "PayNet bank authorization completed for this transaction.",
      });
      router.push("/dashboard?fpx=confirmed");
    }, 3000);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [isPaying, router]);

  return (
    <main className="min-h-svh bg-[#F6F0ED] px-6 py-8 text-[#326273]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#326273]/70 hover:text-[#326273]">
            <ArrowLeft className="size-4" />
            Back to landing
          </Link>

          <div className="space-y-4">
            <Badge className="bg-[#E39774] text-white">Mock FPX Gateway</Badge>
            <h1 className="text-5xl font-semibold tracking-tighter">Authorize with your business bank.</h1>
            <p className="text-lg leading-8 text-[#326273]/70">
              PayNet FPX lets you authorize each transfer directly from your business banking account. Splash does not store bank credentials or hold business funds in Phase 1.
            </p>
          </div>

          <Card className="border-0 bg-white/60 shadow-sm">
            <CardHeader>
              <CardTitle>Transaction summary</CardTitle>
              <CardDescription>PayNet FPX authorization for this transfer only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#F6F0ED] p-4">
                <span className="text-[#326273]/65">Transaction amount</span>
                <span className="text-2xl font-semibold">RM 50,000.00</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F6F0ED] p-4">
                <span className="text-[#326273]/65">Gateway fee</span>
                <span className="font-semibold text-[#5C9EAD]">Waived</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#5C9EAD]/10 p-4 text-sm text-[#326273]/75">
                <ShieldCheck className="size-5 text-[#5C9EAD]" />
                Bank authorization is mocked for MVP demo purposes. No funds are held by Splash.
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-0 bg-white/75 shadow-2xl shadow-[#326273]/10">
          <CardHeader>
            <CardTitle className="text-2xl">Choose bank</CardTitle>
            <CardDescription>Selectable FPX tiles for SEA enterprise treasury operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {banks.map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${selectedBank === bank ? "border-[#5C9EAD] bg-[#5C9EAD]/10 shadow-lg shadow-[#5C9EAD]/10" : "border-[#326273]/10 bg-white"}`}
                >
                  <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-[#F6F0ED] text-[#326273]">
                    <Building2 className="size-5" />
                  </div>
                  <p className="font-semibold">{bank}</p>
                  <p className="mt-1 text-xs text-[#326273]/60">FPX Business Banking</p>
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                setProgress(18);
                setIsPaying(true);
              }}
              className="h-11 w-full bg-[#E39774] text-white hover:bg-[#d98560]"
            >
              <LockKeyhole className="size-4" />
              Pay with {selectedBank}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPaying} onOpenChange={setIsPaying}>
        <DialogContent className="bg-white text-[#326273] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>PayNet secure redirect</DialogTitle>
            <DialogDescription>Authorizing your FPX payment with {selectedBank}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-3">
            <div className="rounded-3xl bg-[#326273] p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/65">Merchant</span>
                <span className="font-semibold">Splash Finance</span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/65">Amount</p>
                  <p className="text-3xl font-semibold">RM 50,000.00</p>
                </div>
                {progress >= 100 ? <CheckCircle2 className="size-8 text-[#E39774]" /> : <Loader2 className="size-8 animate-spin text-[#E39774]" />}
              </div>
            </div>
            <Progress value={progress} />
            <p className="text-sm text-[#326273]/65">Redirecting to Splash Dashboard after confirmation...</p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
