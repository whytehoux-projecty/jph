"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Camera, MapPin, Building, Banknote, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";

export default function DepositClient({ userPreferences, accounts }: { userPreferences?: any, accounts?: any[] }) {
  const [activeTab, setActiveTab] = useState("cheque");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const handleChequeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !amount || !frontImage || !backImage) {
      toast.warn({ title: "Please fill all fields and upload both images." });
      return;
    }
    toast.success({ title: "Cheque Deposit Submitted", description: "Your cheque is being processed." });
    setAmount("");
    setFrontImage(null);
    setBackImage(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Deposit Cash & Cheques
          </h1>
          <p className="text-muted-foreground mt-1">
            Deposit a cheque from anywhere or find a location to deposit cash.
          </p>
        </div>
      </div>

      <div className="w-full mb-6">
        <SegmentedControl
          options={["cheque", "cash"]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "cheque" && (
        <Card className="animate-in fade-in max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Mobile Cheque Deposit
            </CardTitle>
            <CardDescription>
              Endorse the back of your cheque and capture both sides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="cheque-form" onSubmit={handleChequeSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Deposit To</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} (••{acc.accountNumber.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cheque Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="pl-7 font-mono"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Front of Cheque</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 relative h-32 hover:bg-slate-100 transition-colors">
                    {frontImage ? (
                      <span className="text-sm font-medium text-emerald-700 break-all px-2">{frontImage.name}</span>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Tap to upload front</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Back of Cheque</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 relative h-32 hover:bg-slate-100 transition-colors">
                    {backImage ? (
                      <span className="text-sm font-medium text-emerald-700 break-all px-2">{backImage.name}</span>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Tap to upload back</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 flex justify-end">
            <Button type="submit" form="cheque-form">Submit Deposit</Button>
          </CardFooter>
        </Card>
      )}

      {activeTab === "cash" && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Deposit Cash
            </CardTitle>
            <CardDescription>
              Find a nearby branch or smart ATM to deposit cash into your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center border text-slate-500">
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-medium">Map integration required</p>
                <p className="text-sm opacity-80 mt-1">Locate branches and ATMs</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-white flex items-start gap-3">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Building className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">Downtown Branch</h4>
                  <p className="text-xs text-slate-500 mt-0.5">123 Financial District Ave</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Open • Closes at 5:00 PM</p>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-white flex items-start gap-3">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Banknote className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">Uptown Smart ATM</h4>
                  <p className="text-xs text-slate-500 mt-0.5">456 Retail Blvd</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Open 24/7</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
