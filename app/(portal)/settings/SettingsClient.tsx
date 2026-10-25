"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changeTransactionPin, updatePreferences, updateProfile } from "@/app/actions/profile";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";

export interface SettingsProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  pinSetupComplete: boolean;
  preferredLanguage: string;
  hideBalance: boolean;
}

const FORMATS = [
  { value: "en", name: "English (United States)", locale: "en-US" },
  { value: "es", name: "Español (España)", locale: "es-ES" },
  { value: "fr", name: "Français (France)", locale: "fr-FR" },
  { value: "de", name: "Deutsch (Deutschland)", locale: "de-DE" },
].map((f) => ({
  value: f.value,
  label: `${f.name} — ${new Intl.NumberFormat(f.locale, { minimumFractionDigits: 2 }).format(1234.56)} · ${new Intl.DateTimeFormat(f.locale, { dateStyle: "medium" }).format(new Date())}`,
}));

export default function SettingsClient({ profile }: { profile: SettingsProfile }) {
  return (
    <>
      <PageHeader title="Settings" description="Your personal details, security and display preferences." />
      <Tabs defaultValue="profile">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="profile">Personal details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfileSection profile={profile} />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecuritySection pinSetupComplete={profile.pinSetupComplete} />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
          <PreferencesSection profile={profile} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-sans text-h4 text-fg">{title}</h2>
      {description && <p className="mt-1 text-small text-fg-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ReadOnlyRow({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-small text-fg-muted">{term}</dt>
      <dd className="text-body text-fg sm:text-right">{value}</dd>
    </div>
  );
}

function ProfileSection({ profile }: { profile: SettingsProfile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const dirty = firstName !== profile.firstName || lastName !== profile.lastName || phone !== profile.phone;

  const save = async () => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "Enter your first name.";
    if (!lastName.trim()) next.lastName = "Enter your last name.";
    if (phone && !/^[+\d][\d\s().-]{6,}$/.test(phone.trim())) next.phone = "Enter a phone number using digits, for example +1 555 123 4567.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      toast.success({ title: "Your details have been updated" });
      router.refresh();
    } catch (err) {
      toast.error({ title: "Your details weren't saved", description: userFacingError(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Section title="Name and phone">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="First name" error={errors.firstName} required>
            <Input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Last name" error={errors.lastName} required>
            <Input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField label="Mobile phone" error={errors.phone} optional>
            <Input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
          {dirty && (
            <Button
              variant="tertiary"
              onClick={() => {
                setFirstName(profile.firstName);
                setLastName(profile.lastName);
                setPhone(profile.phone);
                setErrors({});
              }}
            >
              Discard changes
            </Button>
          )}
          <Button onClick={save} loading={saving} loadingLabel="Saving your details" disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </Section>

      <Section title="Email and address" description="To protect your account, these can only be changed by our team.">
        <dl className="divide-y divide-line border-y border-line">
          <ReadOnlyRow term="Email" value={profile.email} />
          <ReadOnlyRow term="Address" value={profile.address || "Not on file"} />
        </dl>
        <p className="mt-4 text-small text-fg-muted">
          Need to update them?{" "}
          <Link href="/support" className="font-semibold text-fg-action underline underline-offset-[3px]">
            Contact us
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}

function SecuritySection({ pinSetupComplete }: { pinSetupComplete: boolean }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const save = async () => {
    const next: Record<string, string> = {};
    if (!/^\d{4,6}$/.test(currentPin)) next.currentPin = "Enter your current 4 to 6 digit PIN.";
    if (!/^\d{4,6}$/.test(newPin)) next.newPin = "Your new PIN must be 4 to 6 digits.";
    else if (newPin === currentPin) next.newPin = "Choose a PIN that's different from your current one.";
    if (newPin && confirmPin !== newPin) next.confirmPin = "The two PINs don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await changeTransactionPin({ currentPin, newPin });
      toast.success({ title: "Your transaction PIN has been changed" });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err) {
      const msg = userFacingError(err, "Please try again.");
      if (/incorrect current pin/i.test(msg)) setErrors({ currentPin: "That isn't your current PIN." });
      else toast.error({ title: "Your PIN wasn't changed", description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Section title="Transaction PIN" description="You enter this PIN to confirm every transfer and payment.">
        {pinSetupComplete ? (
          <>
            <div className="grid max-w-md gap-5">
              <FormField label="Current PIN" error={errors.currentPin} required>
                <Input type="password" inputMode="numeric" autoComplete="off" value={currentPin} onChange={(e) => setCurrentPin(digits(e.target.value))} />
              </FormField>
              <FormField label="New PIN" hint="4 to 6 digits. Avoid dates and repeated numbers." error={errors.newPin} required>
                <Input type="password" inputMode="numeric" autoComplete="off" value={newPin} onChange={(e) => setNewPin(digits(e.target.value))} />
              </FormField>
              <FormField label="Confirm new PIN" error={errors.confirmPin} required>
                <Input type="password" inputMode="numeric" autoComplete="off" value={confirmPin} onChange={(e) => setConfirmPin(digits(e.target.value))} />
              </FormField>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <Button onClick={save} loading={saving} loadingLabel="Changing your PIN">
                Change PIN
              </Button>
            </div>
          </>
        ) : (
          <p className="text-body text-fg-muted">You'll be asked to set your PIN the next time you open Heritage Vault.</p>
        )}
      </Section>

      <Section title="Sign-in password">
        <p className="text-body text-fg-muted">
          To change your password, please{" "}
          <Link href="/support" className="font-semibold text-fg-action underline underline-offset-[3px]">
            contact us
          </Link>
          . We'll never ask you for your password or PIN.
        </p>
      </Section>
    </div>
  );
}

function PreferencesSection({ profile }: { profile: SettingsProfile }) {
  const router = useRouter();
  const [language, setLanguage] = useState(profile.preferredLanguage || "en");
  const [hideBalance, setHideBalance] = useState(profile.hideBalance);
  const [saving, setSaving] = useState(false);

  const dirty = language !== (profile.preferredLanguage || "en") || hideBalance !== profile.hideBalance;

  const save = async () => {
    setSaving(true);
    try {
      await updatePreferences({ preferredLanguage: language, hideBalance });
      toast.success({ title: "Preferences saved" });
      router.refresh();
    } catch (err) {
      toast.error({ title: "Your preferences weren't saved", description: userFacingError(err, "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Display">
      <div className="flex max-w-xl flex-col gap-6">
        <FormField label="Date and number format" hint="How amounts and dates are written throughout Heritage Vault.">
          <NativeSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </NativeSelect>
        </FormField>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="hide-balance">Hide balances when I sign in</Label>
            <p id="hide-balance-desc" className="mt-1 text-small text-fg-muted">
              Amounts start hidden. You can show them at any time with the eye button.
            </p>
          </div>
          <Switch id="hide-balance" aria-describedby="hide-balance-desc" checked={hideBalance} onCheckedChange={setHideBalance} />
        </div>
      </div>
      <div className="mt-6 border-t border-line pt-5">
        <Button onClick={save} loading={saving} loadingLabel="Saving preferences" disabled={!dirty}>
          Save preferences
        </Button>
      </div>
    </Section>
  );
}
