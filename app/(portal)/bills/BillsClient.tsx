"use client";


import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { payBill } from "@/app/actions/bills";
import { Globe, FileText, Check, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelector } from "./components/CountrySelector";
import { ServiceCategoryGrid } from "./components/ServiceCategoryGrid";
import { InvoiceUploader } from "./components/InvoiceUploader";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

// Providers fetched from API
// const MOCK_PROVIDERS: Record<string, Record<string, string[]>> = ... removed

export default function BillsClient({ initialAccounts, initialProviders }: { initialAccounts: any[], initialProviders: any }) {
  const router = useRouter();
  // Data State
  const [accounts, setAccounts] = useState<any[]>(initialAccounts);
  const [providers, setProviders] = useState<Record<string, Record<string, string[]>>>(initialProviders);
  const [loading, setLoading] = useState(false);

  // Flow State
  const [activeTab, setActiveTab] = useState<"quick" | "invoice">("quick");
  const [step, setStep] = useState(1); // 1: Country/Cat, 2: Provider/Details, 3: Success

  // Form State
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Invoice State
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    // Data is loaded via Server Component props
    if (initialAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(initialAccounts[0].id);
    }
  }, [initialAccounts]);

  // Derived Data
  const availableProviders =
    selectedCountry && selectedCategory
      ? providers[selectedCountry]?.[selectedCategory] || ["Local Provider"]
      : [];

  const handleQuickPay = async () => {
    if (!amount || !selectedAccountId || !selectedProvider) return;

    setLoading(true);
    try {
      await payBill({
        accountId: selectedAccountId,
        name: selectedProvider,
        accountNumber: customerId || "UNKNOWN",
        amount,
        date: new Date().toISOString(),
      });

      setStep(3); // Success Screen
      router.refresh();
      toast.success({ title: "Payment successful", description: `$${amount} sent to ${selectedProvider}.` });
    } catch (error) {
      console.error("Payment failed", error);
      toast.error({ title: "Payment failed", description: "Please check your details and try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInvoicePay = async () => {
    if (!amount || !selectedAccountId || !invoiceFile) return;

    setLoading(true); // Using loading state for UI feedback
    try {
      const payeeName = invoiceData?.merchantName || "Unknown Merchant";
      await payBill({
        accountId: selectedAccountId,
        name: payeeName,
        accountNumber: invoiceData?.accountNumber || "UNKNOWN",
        amount,
        date: new Date().toISOString(),
      });

      setStep(3);
      router.refresh();
      toast.success({ title: "Invoice paid", description: "Funds debited within 1 business day." });
    } catch (error) {
      console.error("Invoice payment failed", error);
      toast.error({ title: "Invoice payment failed", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceUpload = async (file: File) => {
    setInvoiceFile(file);
    setUploading(true);

    try {
      // Mock invoice upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInvoiceData({ merchantName: "Sample Provider", amount: 120.50, accountNumber: "INV-12345" });
      setAmount("120.50");
      toast.success({ title: "Invoice scanned", description: "Details extracted successfully." });
    } catch (err) {
      console.error(err);
      toast.error({ title: "Invoice scan failed", description: "Please enter the amount manually." });
      setInvoiceData(null);
      setInvoiceFile(null);
    } finally {
      setUploading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedCountry("");
    setSelectedCategory("");
    setSelectedProvider("");
    setAmount("");
    setCustomerId("");
    setInvoiceFile(null);
    setInvoiceData(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-charcoal">
            Global Bill Payments
          </h1>
          <p className="text-muted-foreground mt-1">
            Pay for services worldwide or upload an invoice.
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <div
          onClick={() => setActiveTab("quick")}
          className={cn(
            "flex-1 p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4",
            activeTab === "quick"
              ? "bg-charcoal text-white shadow-lg border-charcoal"
              : "bg-white text-muted-foreground hover:bg-gray-50",
          )}>
          <div className="p-3 bg-white/10 rounded-full">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Global Gateway</h3>
            <p className="text-sm opacity-80">Pay providers by region</p>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("invoice")}
          className={cn(
            "flex-1 p-6 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-4",
            activeTab === "invoice"
              ? "bg-vintage-gold text-white shadow-lg border-vintage-gold"
              : "bg-white text-muted-foreground hover:bg-gray-50",
          )}>
          <div className="p-3 bg-white/10 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pay with Invoice</h3>
            <p className="text-sm opacity-80">Upload & Pay instantly</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {/* 1. Quick Pay Flow */}
        {activeTab === "quick" && (
          <div className="space-y-8">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 space-y-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="bg-charcoal text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      1
                    </span>
                    Select Region
                  </h3>
                  <div className="max-w-md">
                    <CountrySelector
                      value={selectedCountry}
                      onChange={setSelectedCountry}
                    />
                  </div>
                </section>

                {selectedCountry && (
                  <section className="animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="bg-charcoal text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        2
                      </span>
                      Choose Service Category
                    </h3>
                    <ServiceCategoryGrid
                      value={selectedCategory}
                      onChange={(cat) => {
                        setSelectedCategory(cat);
                        setStep(2);
                      }}
                    />
                  </section>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto">
                <Button
                  variant="ghost"
                  className="mb-4 pl-0"
                  onClick={() => setStep(1)}>
                  ← Back to Selection
                </Button>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      Paying for{" "}
                      <span className="font-semibold text-charcoal">
                        {selectedCategory}
                      </span>{" "}
                      in{" "}
                      <span className="font-semibold text-charcoal capitalize">
                        {selectedCountry}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Select Provider</Label>
                      <Select
                        value={selectedProvider}
                        onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Service Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProviders.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Customer ID / Account Number</Label>
                      <Input
                        placeholder="e.g. 123456789"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pay From</Label>
                      <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name} (****{acc.accountNumber.slice(-4)}) - $
                              {Number(acc.balance).toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full h-12 text-lg mt-4"
                      onClick={handleQuickPay}
                      disabled={!selectedProvider || !amount || !customerId}>
                      Confirm Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  Payment Successful!
                </h2>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  Your payment of <strong>${amount}</strong> to{" "}
                  <strong>{selectedProvider}</strong> has been processed
                  securely.
                </p>
                <Button onClick={resetFlow}>Make Another Payment</Button>
              </div>
            )}
          </div>
        )}

        {/* 2. Invoice Flow */}
        {activeTab === "invoice" && (
          <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in">
            {!invoiceData ? (
              <Card className="border-none shadow-vintage-lg">
                <CardContent className="p-8">
                  <InvoiceUploader
                    onFileSelect={handleInvoiceUpload}
                    currentFile={invoiceFile}
                    isUploading={uploading}
                    error={null}
                    onClear={() => {
                      setInvoiceFile(null);
                      setInvoiceData(null);
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="animate-in slide-in-from-bottom-8">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <VintageIcon icon={Building} variant="gold" size="sm" />
                    Invoice Details Extracted
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-semibold mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold font-mono text-charcoal">
                        ${Number(amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-semibold mb-1">
                        Invoice Number
                      </p>
                      <p className="text-lg font-mono text-charcoal">
                        {invoiceData.invoiceNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Pay From</Label>
                    <Select
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} (****{acc.accountNumber.slice(-4)}) - $
                            {Number(acc.balance).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setInvoiceData(null);
                        setInvoiceFile(null);
                      }}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-vintage-gold text-white hover:bg-vintage-gold-dark"
                      onClick={handleInvoicePay}
                      disabled={loading}>
                      {loading ? "Processing..." : "Pay Invoice Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-2">
                  Invoice Paid!
                </h2>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  Your invoice has been settled successfully. Keep the receipt
                  for your records.
                </p>
                <Button onClick={resetFlow}>Back to Bills</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
