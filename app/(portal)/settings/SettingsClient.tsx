"use client";


import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  Save,
  Moon,
  Sun,
  Smartphone,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { useRouter } from "next/navigation";
import { updateProfile, changeTransactionPin, updatePreferences, updateNotificationSettings } from "@/app/actions/profile";
import { toast } from "@/lib/toast";
import { translate } from "@/lib/utils";

export default function SettingsClient({ initialProfile }: { initialProfile: any }) {
  const router = useRouter();
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: initialProfile?.firstName || "",
    lastName: initialProfile?.lastName || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
    twoFactorEnabled: false,
  });

  const [show2faDialog, setShow2faDialog] = useState(false);
  const [twoFaAction, setTwoFaAction] = useState<"enable" | "disable">("enable");
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    loginAlerts: true,
    marketingEmails: false,
  });

  const [preferences, setPreferences] = useState({
    language: initialProfile?.preferredLanguage || "en",
    currency: initialProfile?.preferredCurrency || "USD",
    timezone: "America/New_York",
    theme: "light",
  });

  useEffect(() => {
    // Two factor status check mocked
  }, []);

  const handleSave = async (section: string) => {
    if (section === "Profile") {
      try {
        await updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        });
        toast.success({ title: "Profile updated successfully." });
        router.refresh();
      } catch {
        toast.error({ title: "Failed to update profile." });
      }
      return;
    }

    if (section === "PIN") {
      if (
        !securityData.newPin ||
        securityData.newPin !== securityData.confirmPin ||
        securityData.newPin.length < 4
      ) {
        toast.warn({ title: "New PIN and confirmation must match and be 4-6 digits." });
        return;
      }

      try {
        await changeTransactionPin({
          currentPin: securityData.currentPin,
          newPin: securityData.newPin,
        });
        toast.success({ title: "Transaction PIN updated successfully." });
        setSecurityData((prev) => ({ ...prev, currentPin: "", newPin: "", confirmPin: "" }));
      } catch (err: any) {
        toast.error({ title: err.message || "Failed to update Transaction PIN." });
      }
      return;
    }

    if (section === "Preferences") {
      try {
        await updatePreferences({
          preferredLanguage: preferences.language,
          preferredCurrency: preferences.currency,
        });
        toast.success({ title: "Preferences updated successfully." });
        router.refresh();
      } catch {
        toast.error({ title: "Failed to update preferences." });
      }
      return;
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await updateNotificationSettings({ notificationPreferences: notificationSettings });
      toast.success({ title: "Notification preferences saved." });
      router.refresh();
    } catch {
      toast.error({ title: "Failed to save notification preferences." });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleTwoFactorToggle = async (checked: boolean) => {
    setTwoFaCode("");
    if (checked) {
      // Enable: mock fetch QR code + secret from backend
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSetupData({ qrCode: "dummy", secret: "dummy" });
        setTwoFaAction("enable");
        setShow2faDialog(true);
      } catch {
        toast.error({ title: "Failed to start 2FA setup. Please try again." });
      }
    } else {
      setSetupData(null);
      setTwoFaAction("disable");
      setShow2faDialog(true);
    }
  };

  const handleTwoFactorConfirm = async () => {
    if (!twoFaCode || twoFaCode.length < 6) {
      toast.warn({ title: "Please enter a valid 6-digit code." });
      return;
    }
    setTwoFaLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (twoFaCode !== "123456") throw new Error("Invalid");

      if (twoFaAction === "enable") {
        setSecurityData((prev) => ({ ...prev, twoFactorEnabled: true }));
        toast.success({ title: "Two-factor authentication enabled." });
      } else {
        setSecurityData((prev) => ({ ...prev, twoFactorEnabled: false }));
        toast.success({ title: "Two-factor authentication disabled." });
      }
      setShow2faDialog(false);
      setTwoFaCode("");
    } catch {
      toast.error({ title: `Failed to ${twoFaAction} 2FA. Check your code and try again.` });
    } finally {
      setTwoFaLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-playfair font-bold text-charcoal">
          {translate(preferences.language, "settings.title") || "Settings"}
        </h1>
        <p className="text-muted-foreground">
          {translate(preferences.language, "settings.subtitle") ||
            "Manage your personal information, security, and app preferences."}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full flex h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto justify-start md:justify-center">
          <TabsTrigger
            value="profile"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
            <User className="w-4 h-4" />
            {translate(preferences.language, "settings.profileTab") ||
              "Profile"}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
            <Lock className="w-4 h-4" />
            {translate(preferences.language, "settings.securityTab") ||
              "Security"}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
            <Bell className="w-4 h-4" />
            {translate(preferences.language, "settings.notificationsTab") ||
              "Notifications"}
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
            <Globe className="w-4 h-4" />
            {translate(preferences.language, "settings.preferencesTab") ||
              "Preferences"}
          </TabsTrigger>
        </TabsList>

        {/* Profile Content */}
        <TabsContent
          value="profile"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your contact details and address.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData({ ...profileData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={profileData.zipCode}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        zipCode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button
                onClick={() => handleSave("Profile")}
                icon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Content */}
        <TabsContent
          value="security"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Transaction PIN</CardTitle>
              <CardDescription>
                Ensure your account is using a secure Transaction PIN. Password resets are handled exclusively by your Account Manager.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Transaction PIN</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    value={securityData.currentPin}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        currentPin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <button
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showCurrentPin ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Transaction PIN</Label>
                <div className="relative">
                  <Input
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    value={securityData.newPin}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        newPin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                  <button
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New PIN</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={securityData.confirmPin}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      confirmPin: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={() => handleSave("PIN")}>
                Update PIN
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <VintageIcon icon={Shield} variant="green" size="sm" />
                <CardTitle className="text-lg">
                  {translate(
                    preferences.language,
                    "settings.twoFactorTitle",
                  ) || "Two-Factor Authentication"}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">
                  {translate(
                    preferences.language,
                    "settings.enable2faLabel",
                  ) || "Enable 2FA"}
                </Label>
                <p className="text-sm text-muted-foreground max-w-[300px]">
                  {translate(
                    preferences.language,
                    "settings.enable2faDescription",
                  ) ||
                    "Secure your account with an additional confirmation step via SMS or Authenticator App."}
                </p>
              </div>
              <Switch
                checked={securityData.twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={true}
              />
            </CardContent>
          </Card>

          {/* 2FA Dialog */}
          <Dialog open={show2faDialog} onOpenChange={(open) => { setShow2faDialog(open); if (!open) setTwoFaCode(""); }}>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>{twoFaAction === "enable" ? "Enable Two-Factor Authentication" : "Disable Two-Factor Authentication"}</DialogTitle>
                <DialogDescription>
                  {twoFaAction === "enable"
                    ? "Scan the QR code with your authenticator app, then enter the 6-digit code to confirm."
                    : "Enter the 6-digit code from your authenticator app to disable 2FA."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {twoFaAction === "enable" && setupData?.qrCode && (
                  <div className="flex flex-col items-center gap-3">
                    <img src={setupData.qrCode} alt="2FA QR Code" className="w-40 h-40 border rounded-lg" />
                    {setupData.secret && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
                        {setupData.secret}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input
                    placeholder="123456"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="font-mono text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setShow2faDialog(false); setTwoFaCode(""); }}>Cancel</Button>
                <Button
                  onClick={handleTwoFactorConfirm}
                  disabled={twoFaLoading || twoFaCode.length < 6}
                  className={twoFaAction === "disable" ? "bg-red-600 hover:bg-red-700 text-white" : ""}>
                  {twoFaLoading ? "Verifying..." : twoFaAction === "enable" ? "Verify & Enable" : "Confirm Disable"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Notifications Content */}
        <TabsContent
          value="notifications"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate(
                  preferences.language,
                  "settings.notificationTitle",
                ) || "Notification Preferences"}
              </CardTitle>
              <CardDescription>
                {translate(
                  preferences.language,
                  "settings.notificationSubtitle",
                ) || "Choose when and how you want to be notified."}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {[
                {
                  key: "emailNotifications",
                  icon: Mail,
                  labelKey: "settings.notification.emailLabel",
                  descKey: "settings.notification.emailDesc",
                },
                {
                  key: "smsNotifications",
                  icon: Smartphone,
                  labelKey: "settings.notification.smsLabel",
                  descKey: "settings.notification.smsDesc",
                },
                {
                  key: "transactionAlerts",
                  icon: CreditCard,
                  labelKey: "settings.notification.transactionLabel",
                  descKey: "settings.notification.transactionDesc",
                },
                {
                  key: "pushNotifications",
                  icon: Bell,
                  labelKey: "settings.notification.pushLabel",
                  descKey: "settings.notification.pushDesc",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {translate(preferences.language, item.labelKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {translate(preferences.language, item.descKey)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      notificationSettings[
                        item.key as keyof typeof notificationSettings
                      ]
                    }
                    onCheckedChange={(c) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [item.key]: c,
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
                icon={<Save className="w-4 h-4" />}>
                {isSavingNotifications ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preferences Content */}
        <TabsContent
          value="preferences"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate(preferences.language, "settings.preferencesTitle") ||
                  "App Preferences"}
              </CardTitle>
              <CardDescription>
                {translate(
                  preferences.language,
                  "settings.preferencesSubtitle",
                ) || "Customize your regional and visual settings."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    {translate(
                      preferences.language,
                      "settings.languageLabel",
                    ) || "Language"}
                  </Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, language: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {translate(
                      preferences.language,
                      "settings.currencyLabel",
                    ) || "Currency"}
                  </Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, currency: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, timezone: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, theme: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun size={14} /> Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon size={14} /> Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} /> System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button onClick={() => handleSave("Preferences")}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
