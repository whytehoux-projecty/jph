"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge, StatusPill, type Status } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { LocalDate } from "@/components/dashboard/LocalDate";
import { RequestSent } from "@/components/portal/money-fields";
import { StepFooter, StepHeading } from "@/components/portal/flow";
import { requestAdvisoryMeeting, type RelationshipManager } from "@/app/actions/benefits";
import { ADVISORY_FORMATS, ADVISORY_TOPICS, type AdvisoryFormat } from "@/lib/advisory";
import { userFacingError } from "@/lib/errors";

interface AdvisoryRequestView {
  id: string;
  reference: string | null;
  topic: string;
  preferredDate: string | null;
  format: string | null;
  status: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; status: Status }> = {
  OPEN: { label: "We'll be in touch", status: "warning" },
  RESOLVED: { label: "Dealt with", status: "success" },
};

/** "PRIVATE_VAULT" → "Private vault". */
const tierLabel = (tier: string) => tier.charAt(0) + tier.slice(1).toLowerCase().replace(/_/g, " ");

function ManagerCard({ manager }: { manager: RelationshipManager | null }) {
  if (!manager) {
    return (
      <Card className="lg:col-span-5">
        <EmptyState
          compact
          icon={UserRound}
          headingLevel={2}
          title="No relationship manager yet"
          description="Our support team can help with anything you need, and arrange a meeting with a specialist."
          action={
            <Button asChild variant="secondary">
              <Link href="/support">Contact support</Link>
            </Button>
          }
        />
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-4 p-5 lg:col-span-5">
      <h2 className="font-sans text-h5 text-fg">Your relationship manager</h2>
      <div>
        <p className="text-body font-semibold text-fg">{manager.name}</p>
        {manager.title && <p className="text-small text-fg-muted">{manager.title}</p>}
      </div>
      {(manager.email || manager.phone) && (
        <ul className="flex flex-col gap-2 border-t border-line pt-4">
          {manager.phone && (
            <li>
              <a href={`tel:${manager.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-11 items-center gap-2 text-body text-fg-action underline-offset-[3px] hover:underline">
                <Phone className="size-4" aria-hidden="true" />
                {manager.phone}
              </a>
            </li>
          )}
          {manager.email && (
            <li>
              <a href={`mailto:${manager.email}`} className="inline-flex min-h-11 items-center gap-2 break-all text-body text-fg-action underline-offset-[3px] hover:underline">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {manager.email}
              </a>
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}

function MeetingRequestForm({ onSent }: { onSent: () => void }) {
  const [topic, setTopic] = React.useState<string>(ADVISORY_TOPICS[0]);
  const [format, setFormat] = React.useState<AdvisoryFormat>("PHONE");
  const [date, setDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || date < tomorrow) {
      setDateError("Choose a date from tomorrow onwards.");
      return;
    }
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await requestAdvisoryMeeting({ topic, format, preferredDate: date, notes });
      if (res.success && res.reference) {
        setSent(res.reference);
        onSent();
      } else {
        setSubmitError(res.error ?? "We couldn't send your request. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send your request. Try again."));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <RequestSent
        title="Request sent"
        description="This isn't a booking yet. We'll contact you to confirm a time, and you'll see the update here and in Notifications."
        rows={[
          ["Reference", <span key="r" className="font-code text-small">{sent}</span>],
          ["About", topic],
          ["Preferred date", new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })],
          ["How", ADVISORY_FORMATS[format]],
        ]}
        anotherLabel="Make another request"
        onAnother={() => {
          setSent(null);
          setDate("");
          setNotes("");
        }}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="meeting-heading" className="flex flex-col gap-5">
      <StepHeading id="meeting-heading" title="Ask for a meeting" description="Tell us what you'd like to discuss and when suits you. We'll contact you to confirm a time." />
      <div className="flex max-w-md flex-col gap-5">
        <FormField label="What would you like to talk about?">
          <NativeSelect value={topic} onChange={(e) => setTopic(e.target.value)}>
            {ADVISORY_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Preferred date" error={dateError}>
            <Input
              type="date"
              min={tomorrow}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setDateError(null);
              }}
            />
          </FormField>
          <FormField label="How">
            <NativeSelect value={format} onChange={(e) => setFormat(e.target.value as AdvisoryFormat)}>
              {(Object.keys(ADVISORY_FORMATS) as AdvisoryFormat[]).map((f) => (
                <option key={f} value={f}>
                  {ADVISORY_FORMATS[f]}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>
        <FormField label="Anything we should know" optional>
          <Textarea rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
      {submitError && (
        <Alert variant="danger" title="Not sent">
          {submitError}
        </Alert>
      )}
      <StepFooter next={<Button loading={busy} loadingLabel="Sending your request">Send request</Button>} />
    </form>
  );
}

export default function RelationshipClient({
  tier,
  manager,
  requests,
  canRequest,
  locale,
}: {
  tier: string;
  manager: RelationshipManager | null;
  requests: AdvisoryRequestView[];
  canRequest: boolean;
  locale: string;
}) {
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Your relationship"
        description="Who looks after your banking with us, and how to arrange a conversation with a specialist."
        actions={tier !== "BASIC" ? <Badge variant="outline">{tierLabel(tier)} client</Badge> : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <ManagerCard manager={manager} />
        <Card className="p-5 sm:p-6 lg:col-span-7">
          {canRequest ? (
            <MeetingRequestForm onSent={() => router.refresh()} />
          ) : (
            <EmptyState
              compact
              headingLevel={2}
              title="Ask us for a meeting"
              description="Requesting meetings online is turned off for your profile. Contact us and we'll arrange one."
              action={
                <Button asChild variant="secondary">
                  <Link href="/support">Contact support</Link>
                </Button>
              }
            />
          )}
        </Card>
      </div>

      <section aria-labelledby="requests-heading" className="mt-10">
        <h2 id="requests-heading" className="mb-3 font-sans text-h4 text-fg">
          Your meeting requests
        </h2>
        <Card>
          {requests.length === 0 ? (
            <EmptyState compact headingLevel={3} title="No requests yet" description="Meetings you ask for here appear with their status." />
          ) : (
            <ul className="divide-y divide-line">
              {requests.map((r) => {
                const s = STATUS[r.status] ?? { label: r.status.charAt(0) + r.status.slice(1).toLowerCase(), status: "neutral" as Status };
                return (
                  <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-body text-fg">{r.topic}</p>
                      <p className="text-caption text-fg-muted">
                        Asked <LocalDate iso={r.createdAt} locale={locale} />
                        {r.preferredDate && <> · preferred {r.preferredDate}</>}
                        {r.format && <> · {r.format}</>}
                        {r.reference && (
                          <>
                            {" "}
                            · <span className="font-code">{r.reference}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <StatusPill status={s.status}>{s.label}</StatusPill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}
