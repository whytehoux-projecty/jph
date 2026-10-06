"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full mb-6">
          <TabsList className="w-full md:w-auto inline-flex p-1 bg-slate-100 rounded-lg">
            <TabsTrigger value="cheque" className="px-6 py-2.5 capitalize text-sm font-medium">Mobile Cheque</TabsTrigger>
            <TabsTrigger value="cash" className="px-6 py-2.5 capitalize text-sm font-medium">Cash Locations</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cheque" className="m-0">
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
        </TabsContent>

        <TabsContent value="cash" className="m-0">
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
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Map View */}
                <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-neutral-200 relative min-h-[400px]">
                  <iframe
                    title="Branch Locations Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  
                  {/* Search overlay */}
                  <div className="absolute top-4 left-4 right-4 md:w-80 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-10">
                    <div className="flex items-center p-2">
                      <MapPin className="w-5 h-5 text-neutral-400 ml-2" />
                      <Input 
                        type="text" 
                        placeholder="Search zip, city, or state..." 
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        defaultValue="New York, NY"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Locations List */}
                <div className="lg:w-80 flex flex-col gap-4 max-h-[400px] overflow-y-auto px-4 sm:px-0 pb-4 sm:pb-0">
                  <h3 className="font-semibold text-sm text-ink-900 uppercase tracking-wider mb-1">Nearby Locations</h3>
                  
                  {/* Branch 1 */}
                  <div className="border border-vintage-gold/50 rounded-lg p-4 bg-vintage-gold/5 flex items-start gap-3 cursor-pointer hover:bg-vintage-gold/10 transition-colors">
                    <div className="bg-white p-2 rounded-full mt-1 border border-vintage-gold/20 shadow-sm">
                      <Building className="w-4 h-4 text-vintage-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-ink-900">Downtown Branch</h4>
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">0.8 mi</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">123 Financial District Ave<br/>New York, NY 10005</p>
                      <p className="text-xs text-emerald-600 font-medium mt-2">Open • Closes at 5:00 PM</p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="small" className="h-7 text-xs w-full">Directions</Button>
                        <Button variant="outline" size="small" className="h-7 text-xs w-full">Details</Button>
                      </div>
                    </div>
                  </div>

                  {/* ATM 1 */}
                  <div className="border border-neutral-200 rounded-lg p-4 bg-white flex items-start gap-3 cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-all">
                    <div className="bg-slate-50 p-2 rounded-full mt-1 border border-slate-100">
                      <Banknote className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-ink-900">Uptown Smart ATM</h4>
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">1.2 mi</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">456 Retail Blvd<br/>New York, NY 10022</p>
                      <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open 24/7
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="small" className="h-7 text-xs w-full">Directions</Button>
                      </div>
                    </div>
                  </div>

                  {/* ATM 2 */}
                  <div className="border border-neutral-200 rounded-lg p-4 bg-white flex items-start gap-3 cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-all">
                    <div className="bg-slate-50 p-2 rounded-full mt-1 border border-slate-100">
                      <Banknote className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-ink-900">Midtown Smart ATM</h4>
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">2.5 mi</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">789 Tech Square<br/>New York, NY 10018</p>
                      <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open 24/7
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="small" className="h-7 text-xs w-full">Directions</Button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
