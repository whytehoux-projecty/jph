"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert } from "@/components/ui/alert";
import { StatusPill, type Status } from "@/components/ui/badge";
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
import { sendContactMessage } from "@/app/actions/support";
import { SUPPORT_TOPICS } from "@/lib/support-topics";
import { userFacingError } from "@/lib/errors";

interface MessageView {
  id: string;
  subject: string;
  reference: string | null;
  status: string;
  createdAt: string;
}

interface Contact {
  phone: string | null;
  phoneTel: string | null;
  fraudPhone: string | null;
  fraudPhoneTel: string | null;
  email: string | null;
}

const STATUS: Record<string, { label: string; status: Status }> = {
  OPEN: { label: "Waiting for a reply", status: "warning" },
  CLOSED: { label: "Closed", status: "success" },
  RESOLVED: { label: "Closed", status: "success" },
};

/** Only what the portal actually does today. */
const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Why does my payment say “Being checked”?",
    a: (
      <>
        Our team checks every transfer, withdrawal and bill payment before it&apos;s processed. You&apos;ll see the status change in{" "}
        <Link href="/activities" className="text-fg-action underline underline-offset-[3px]">Activity</Link>, and you&apos;ll get a notification when it&apos;s done.
      </>
    ),
  },
  {
    q: "My card is lost or stolen. What should I do?",
    a: (
      <>
        Freeze it straight away in{" "}
        <Link href="/cards" className="text-fg-action underline underline-offset-[3px]">Cards</Link>: new payments are declined while it&apos;s frozen. Then send us a message
        below so we can help with a replacement.
      </>
    ),
  },
  {
    q: "When will my deposit show in my balance?",
    a: "Deposits are added once our team has confirmed them: when a transfer arrives, a cheque is checked, or a branch has counted your cash. You'll get a notification when it's credited.",
  },
  {
    q: "How do I change or reset my transaction PIN?",
    a: (
      <>
        If you know your current PIN, change it in{" "}
        <Link href="/settings" className="text-fg-action underline underline-offset-[3px]">Settings</Link>. If you&apos;ve forgotten it, send us a message and we&apos;ll help.
      </>
    ),
  },
  {
    q: "How do I get a statement?",
    a: (
      <>
        Go to <Link href="/statements" className="text-fg-action underline underline-offset-[3px]">Statements</Link>. You can create one for any of the last 12
        months, then print it or save it as a PDF.
      </>
    ),
  },
  {
    q: "Who can I pay, and how do I add them?",
    a: (
      <>
        Save people and accounts you send money to in{" "}
        <Link href="/beneficiaries" className="text-fg-action underline underline-offset-[3px]">Payees</Link>, and companies you pay bills to in{" "}
        <Link href="/bills" className="text-fg-action underline underline-offset-[3px]">Pay bills</Link>.
      </>
    ),
  },
];

function MessageForm({ onSent }: { onSent: () => void }) {
  const [topic, setTopic] = React.useState<string>(SUPPORT_TOPICS[0]);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<{ subject?: string; message?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!subject.trim()) next.subject = "Add a short subject, for example “Card not arrived”.";
    if (!message.trim()) next.message = "Tell us what you need help with.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setSubmitError(null);
    try {
      const res = await sendContactMessage({ topic, subject, message });
      if (res.success) {
        setSent(res.reference);
        onSent();
      } else {
        setSubmitError(res.error);
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't send your message. Try again."));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <RequestSent
        title="Message sent"
        description="We'll reply in Notifications. You can see your messages and their status below."
        rows={[
          ["Reference", <span key="r" className="font-code text-small">{sent}</span>],
          ["About", topic],
          ["Subject", subject.trim()],
        ]}
        anotherLabel="Send another message"
        onAnother={() => {
          setSent(null);
          setSubject("");
          setMessage("");
        }}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="message-heading" className="flex flex-col gap-5">
      <StepHeading
        id="message-heading"
        title="Send us a secure message"
        description="Messages are sent from your signed-in session, so we know it's you. Never include your full card number, PIN or password."
      />
      <FormField label="What is it about?">
        <NativeSelect value={topic} onChange={(e) => setTopic(e.target.value)}>
          {SUPPORT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      <FormField label="Subject" error={errors.subject}>
        <Input autoComplete="off" maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </FormField>
      <FormField label="Message" error={errors.message}>
        <Textarea rows={6} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </FormField>
      {submitError && (
        <Alert variant="danger" title="Not sent">
          {submitError}
        </Alert>
      )}
      <StepFooter next={<Button loading={busy} loadingLabel="Sending your message">Send message</Button>} />
    </form>
  );
}

export default function SupportClient({ messages, contact, locale }: { messages: MessageView[]; contact: Contact; locale: string }) {
  const router = useRouter();
  const hasContact = contact.phone || contact.email || contact.fraudPhone;

  return (
    <>
      <PageHeader title="Help and support" description="Answers to common questions, and a secure way to message us." />

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Card className="p-5 sm:p-6 lg:col-span-7">
          <MessageForm onSent={() => router.refresh()} />
        </Card>

        <aside className="flex flex-col gap-6 lg:col-span-5" aria-label="Other ways to reach us">
          {contact.fraudPhone && (
            <Alert variant="warning" title="Think someone has used your account?">
              Freeze your cards in Cards, then call{" "}
              <a href={`tel:${contact.fraudPhoneTel}`} className="font-semibold underline underline-offset-[3px]">
                {contact.fraudPhone}
              </a>
              .
            </Alert>
          )}
          {hasContact && (
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="font-sans text-h5 text-fg">Other ways to reach us</h2>
              <ul className="flex flex-col gap-1">
                {contact.phone && (
                  <li>
                    <a href={`tel:${contact.phoneTel}`} className="inline-flex min-h-11 items-center gap-2 text-body text-fg-action underline-offset-[3px] hover:underline">
                      <Phone className="size-4" aria-hidden="true" /> {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center gap-2 break-all text-body text-fg-action underline-offset-[3px] hover:underline">
                      <Mail className="size-4 shrink-0" aria-hidden="true" /> {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </Card>
          )}
          {!contact.fraudPhone && (
            <Card variant="muted" className="flex gap-3 p-5">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden="true" />
              <p className="text-small text-fg">
                If your card is lost or you see a payment you don&apos;t recognise, freeze your cards in{" "}
                <Link href="/cards" className="text-fg-action underline underline-offset-[3px]">Cards</Link> first, then send us a message.
              </p>
            </Card>
          )}
        </aside>
      </div>

      <section aria-labelledby="faq-heading" className="mt-10">
        <h2 id="faq-heading" className="mb-3 font-sans text-h4 text-fg">
          Common questions
        </h2>
        <Card className="px-5">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="last:border-b-0">
                <AccordionTrigger className="text-left text-body text-fg">{f.q}</AccordionTrigger>
                <AccordionContent className="text-body text-fg-muted">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </section>

      <section aria-labelledby="messages-heading" className="mt-10">
        <h2 id="messages-heading" className="mb-3 font-sans text-h4 text-fg">
          Your messages
        </h2>
        <Card>
          {messages.length === 0 ? (
            <EmptyState compact headingLevel={3} title="No messages yet" description="Messages you send here appear with their status. Replies arrive in Notifications." />
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((m) => {
                const s = STATUS[m.status] ?? { label: m.status.charAt(0) + m.status.slice(1).toLowerCase(), status: "neutral" as Status };
                return (
                  <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-body text-fg">{m.subject}</p>
                      <p className="text-caption text-fg-muted">
                        Sent <LocalDate iso={m.createdAt} locale={locale} />
                        {m.reference && (
                          <>
                            {" "}
                            · <span className="font-code">{m.reference}</span>
                          </>
                        )}
                        {m.status !== "OPEN" && (
                          <>
                            {" "}
                            · any reply is in{" "}
                            <Link href="/notifications" className="text-fg-action underline underline-offset-[3px]">
                              Notifications
                            </Link>
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
