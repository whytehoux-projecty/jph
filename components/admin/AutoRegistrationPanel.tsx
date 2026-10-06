"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wand2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildAutoFillData } from "@/lib/registration/autofill";
import { autoFillRegistration } from "@/app/actions/adminAutoRegistration";

export function AutoRegistrationPanel({ application }: { application: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deposit, setDeposit] = useState("0");
  const [screening, setScreening] = useState(false);
  const [agreements, setAgreements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const preview = useMemo(
    () =>
      buildAutoFillData(application, {
        initialDepositAmount: Number(deposit) || 0,
        screeningCompleted: screening,
        agreementsObtained: agreements,
      }),
    [application, deposit, screening, agreements]
  );

  if (application.applicationType === "BUSINESS") return null;

  if (done) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Registration auto-filled. Account created; upload the photo and ID documents from the customer profile.
      </div>
    );
  }

  const fromApplication: [string, string][] = [
    ["Full legal name", preview.fullLegalName],
    ["Date of birth", preview.dateOfBirth],
    ["Nationality", preview.nationality],
    ["Address", preview.residentialAddress],
    ["Employment", preview.employmentStatus],
    ["Income band", preview.estimatedAnnualIncome],
    ["Account / currency", `${preview.desiredAccountType} / ${preview.currencyPreference}`],
  ];
  const generated: [string, string][] = [
    ["Source of funds", preview.primarySourceOfFunds],
    ["Purpose", preview.purposeOfAccount],
    ["Monthly volume", preview.expectedMonthlyVolume],
    ["SSN / ITIN", "Placeholder (update later)"],
    ["ID number & dates", "Placeholder (update later)"],
    ["E-signature", preview.digitalSignature],
    ["Photo / ID / PoA uploads", "Skipped (upload later)"],
  ];

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await autoFillRegistration(application.id, {
        initialDepositAmount: Number(deposit) || 0,
        screeningCompleted: screening,
        agreementsObtained: agreements,
      });
      if (res.success) {
        setDone(true);
        router.refresh();
      } else {
        setError(res.error || "Auto-fill failed");
      }
    });
  };

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex justify-between gap-3 py-1 border-b border-neutral-100 last:border-0">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="text-xs font-medium text-right break-words">{v}</span>
    </div>
  );

  return (
    <div id="auto-registration-panel" className="mt-6 pt-6 border-t border-neutral-200">
      <h4 className="font-bold text-ink-900 mb-1 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-vintage-gold" /> Auto-Fill Registration
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        Completes the registration form on the customer&apos;s behalf using the application data, creates the account, and skips all uploads.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-[10px] uppercase font-bold text-blue-800 mb-1">From application (unchanged)</p>
          {fromApplication.map(([k, v]) => <Row key={k} k={k} v={v} />)}
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-[10px] uppercase font-bold text-amber-700 mb-1">Auto-generated</p>
          {generated.map(([k, v]) => <Row key={k} k={k} v={v} />)}
        </div>
      </div>

      <label className="block text-xs font-semibold mb-1">Initial deposit ($)</label>
      <input
        id="auto-fill-deposit"
        type="number"
        min={0}
        step="0.01"
        value={deposit}
        onChange={(e) => setDeposit(e.target.value)}
        className="w-full max-w-xs px-3 py-2 mb-4 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-vintage-gold/50"
      />

      <div className="space-y-2 mb-4 text-xs">
        <label className="flex items-start gap-2 cursor-pointer">
          <input id="auto-fill-screening" type="checkbox" checked={screening} onChange={(e) => setScreening(e.target.checked)} className="mt-0.5" />
          <span>I confirm sanctions / PEP screening has been completed for this applicant.</span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input id="auto-fill-agreements" type="checkbox" checked={agreements} onChange={(e) => setAgreements(e.target.checked)} className="mt-0.5" />
          <span>I confirm the deposit agreement and electronic-communications consent were obtained from the customer.</span>
        </label>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <Button
        id="auto-fill-submit"
        onClick={submit}
        disabled={isPending || !screening || !agreements}
        className="bg-[#0D2545] hover:bg-[#1B355B] text-white"
      >
        <Wand2 className="w-4 h-4 mr-2" /> {isPending ? "Provisioning…" : "Auto-Fill & Create Account"}
      </Button>
    </div>
  );
}
