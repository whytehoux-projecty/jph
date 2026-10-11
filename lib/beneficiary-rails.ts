import { z } from "zod";

export type BeneficiaryFieldType = "text" | "email" | "tel" | "select" | "number" | "textarea";

export interface BeneficiaryField {
  name: string;
  label: string;
  type: BeneficiaryFieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation: z.ZodTypeAny;
}

export interface BeneficiaryRail {
  id: string;
  displayName: string;
  region?: string;
  currency?: string;
  fields: BeneficiaryField[];
  // How to render the main account identifier in the UI
  getDisplayAccount: (details: any) => string;
}

export const beneficiaryRails: Record<string, BeneficiaryRail> = {
  wire_domestic: {
    id: "wire_domestic",
    displayName: "Domestic Wire Transfer",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => 
      `${details.bankName ? details.bankName + " • " : ""}ABA: ${details.routingNumber || "—"} • Acct: ••••${(details.accountNumber || "").slice(-4)}`,
    fields: [
      {
        name: "bankName",
        label: "Beneficiary Bank Name",
        type: "text",
        required: true,
        placeholder: "e.g. JPMorgan Chase, Wells Fargo",
        validation: z.string().min(2, "Bank name is required"),
      },
      {
        name: "routingNumber",
        label: "ABA Routing Number (9 Digits)",
        type: "text",
        required: true,
        placeholder: "9-digit routing number",
        helpText: "Must be a valid 9-digit ABA routing number.",
        validation: z.string().length(9, "Must be exactly 9 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "Account number",
        validation: z.string().min(4, "Min 4 digits").max(17, "Max 17 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumberConfirm",
        label: "Confirm Account Number",
        type: "text",
        required: true,
        placeholder: "Re-enter account number",
        validation: z.string().min(4, "Re-enter account number"),
      },
      {
        name: "addressStreet",
        label: "Beneficiary Street Address",
        type: "text",
        required: true,
        placeholder: "e.g. 123 Main Street, Suite 400",
        validation: z.string().min(3, "Street address is required"),
      },
      {
        name: "addressCity",
        label: "City",
        type: "text",
        required: true,
        placeholder: "e.g. New York",
        validation: z.string().min(2, "City is required"),
      },
      {
        name: "addressState",
        label: "State",
        type: "text",
        required: true,
        placeholder: "e.g. NY",
        validation: z.string().min(2, "State is required").max(2, "2-letter state code"),
      },
      {
        name: "addressPostal",
        label: "ZIP / Postal Code",
        type: "text",
        required: true,
        placeholder: "e.g. 10001",
        validation: z.string().min(3, "Valid ZIP code required"),
      },
    ],
  },

  ach: {
    id: "ach",
    displayName: "ACH Transfer",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) =>
      `ABA: ${details.routingNumber || "—"} • ${(details.accountType || "Checking").toUpperCase()} ••••${(details.accountNumber || "").slice(-4)}`,
    fields: [
      {
        name: "routingNumber",
        label: "ABA Routing Number",
        type: "text",
        required: true,
        placeholder: "9-digit ABA routing number",
        helpText: "Found on the bottom-left of checks.",
        validation: z.string().length(9, "Must be exactly 9 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "Enter account number",
        validation: z.string().min(4, "Min 4 digits").max(17, "Max 17 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumberConfirm",
        label: "Confirm Account Number",
        type: "text",
        required: true,
        placeholder: "Re-enter account number",
        validation: z.string().min(4, "Re-enter account number"),
      },
      {
        name: "accountType",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { label: "Checking", value: "checking" },
          { label: "Savings", value: "savings" },
        ],
        validation: z.enum(["checking", "savings"]),
      },
      {
        name: "bankName",
        label: "Bank Name (Optional)",
        type: "text",
        required: false,
        placeholder: "e.g. Bank of America",
        validation: z.string().optional(),
      },
    ],
  },

  fednow: {
    id: "fednow",
    displayName: "FedNow Instant Transfer",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) =>
      `FedNow • ABA: ${details.routingNumber || "—"} • Acct: ••••${(details.accountNumber || "").slice(-4)}`,
    fields: [
      {
        name: "routingNumber",
        label: "ABA Routing Number",
        type: "text",
        required: true,
        placeholder: "9-digit ABA routing number",
        validation: z.string().length(9, "Must be exactly 9 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "Enter account number",
        validation: z.string().min(4, "Min 4 digits").max(17, "Max 17 digits").regex(/^\d+$/, "Digits only"),
      },
      {
        name: "accountNumberConfirm",
        label: "Confirm Account Number",
        type: "text",
        required: true,
        placeholder: "Re-enter account number",
        validation: z.string().min(4, "Re-enter account number"),
      },
      {
        name: "accountType",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { label: "Checking", value: "checking" },
          { label: "Savings", value: "savings" },
        ],
        validation: z.enum(["checking", "savings"]),
      },
    ],
  },

  wire_international: {
    id: "wire_international",
    displayName: "International Wire (SWIFT)",
    currency: "USD",
    getDisplayAccount: (details) =>
      `SWIFT: ${details.swiftBic || "—"} • ${details.iban ? `IBAN: ${details.iban}` : `Acct: ••••${(details.accountNumber || "").slice(-4)}`}`,
    fields: [
      {
        name: "bankName",
        label: "Beneficiary Bank Name",
        type: "text",
        required: true,
        placeholder: "e.g. Barclays, Deutsche Bank, HSBC",
        validation: z.string().min(2, "Bank name is required"),
      },
      {
        name: "swiftBic",
        label: "SWIFT / BIC Code",
        type: "text",
        required: true,
        placeholder: "8 or 11 characters (e.g. BARCGB22)",
        validation: z.string().min(8, "8 or 11 chars").max(11, "8 or 11 chars").regex(/^[A-Z0-9]+$/i, "Alphanumeric only"),
      },
      {
        name: "iban",
        label: "IBAN or Account Number",
        type: "text",
        required: true,
        placeholder: "e.g. GB29NWBK60161331926819",
        validation: z.string().min(8, "Valid account number or IBAN required"),
      },
      {
        name: "ibanConfirm",
        label: "Confirm IBAN / Account Number",
        type: "text",
        required: true,
        placeholder: "Re-enter IBAN or Account Number",
        validation: z.string().min(8, "Confirm IBAN"),
      },
      {
        name: "country",
        label: "Beneficiary Bank Country",
        type: "text",
        required: true,
        placeholder: "e.g. United Kingdom",
        validation: z.string().min(2, "Country is required"),
      },
      {
        name: "bankAddress",
        label: "Bank Address (Optional)",
        type: "text",
        required: false,
        placeholder: "e.g. 1 Churchill Place, London",
        validation: z.string().optional(),
      },
      {
        name: "addressStreet",
        label: "Beneficiary Address",
        type: "text",
        required: true,
        placeholder: "Street address",
        validation: z.string().min(3, "Address is required"),
      },
      {
        name: "addressCity",
        label: "City / Country",
        type: "text",
        required: true,
        placeholder: "e.g. London, UK",
        validation: z.string().min(2, "City is required"),
      },
    ],
  },

  swift: {
    id: "swift",
    displayName: "International / SWIFT",
    getDisplayAccount: (details) => `IBAN: ${details.iban || details.accountNumber || "—"}`,
    fields: [
      {
        name: "iban",
        label: "IBAN",
        type: "text",
        required: true,
        placeholder: "International Bank Account Number",
        validation: z.string().min(15).max(34).regex(/^[A-Z0-9]+$/, "Must be a valid IBAN format"),
      },
      {
        name: "swiftBic",
        label: "BIC / SWIFT Code",
        type: "text",
        required: true,
        placeholder: "8 or 11 characters",
        validation: z.string().min(8).max(11).regex(/^[A-Z0-9]+$/, "Must be a valid BIC/SWIFT code"),
      },
      {
        name: "bankName",
        label: "Bank Name",
        type: "text",
        required: true,
        placeholder: "e.g. Barclays",
        validation: z.string().min(2),
      },
      {
        name: "country",
        label: "Country",
        type: "text",
        required: true,
        placeholder: "e.g. United Kingdom",
        validation: z.string().min(2),
      },
    ],
  },

  crypto: {
    id: "crypto",
    displayName: "Digital Wallet (Stablecoins)",
    getDisplayAccount: (details) =>
      `${(details.network || "CRYPTO").toUpperCase()}: ${(details.address || details.walletAddress || "").slice(0, 8)}...${(details.address || details.walletAddress || "").slice(-6)}`,
    fields: [
      {
        name: "network",
        label: "Blockchain Network",
        type: "select",
        required: true,
        options: [
          { label: "Ethereum (ERC-20)", value: "erc20" },
          { label: "TRON (TRC-20)", value: "trc20" },
          { label: "Polygon (MATIC)", value: "polygon" },
          { label: "Solana (SOL)", value: "solana" },
          { label: "Base Network", value: "base" },
        ],
        validation: z.enum(["erc20", "trc20", "polygon", "solana", "base"]),
      },
      {
        name: "address",
        label: "Wallet Destination Address",
        type: "text",
        required: true,
        placeholder: "e.g. 0x... or T...",
        validation: z.string().min(26, "Invalid wallet address format").max(70),
      },
      {
        name: "addressConfirm",
        label: "Confirm Wallet Address",
        type: "text",
        required: true,
        placeholder: "Re-enter wallet address",
        validation: z.string().min(26, "Re-enter wallet address"),
      },
    ],
  },

  zelle: {
    id: "zelle",
    displayName: "Zelle",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.email || details.phone || details.zelleIdentifier || "Zelle Contact",
    fields: [
      {
        name: "contactType",
        label: "Contact Method",
        type: "select",
        required: true,
        options: [
          { label: "Email Address", value: "email" },
          { label: "Mobile Number", value: "phone" },
        ],
        validation: z.enum(["email", "phone"]),
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: false,
        placeholder: "name@example.com",
        validation: z.string().email().optional().or(z.literal("")),
      },
      {
        name: "phone",
        label: "Mobile Number",
        type: "tel",
        required: false,
        placeholder: "+1 555 123 4567",
        validation: z.string().optional().or(z.literal("")),
      },
    ],
  },

  cashapp: {
    id: "cashapp",
    displayName: "Cash App",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.cashtag || "Cash App Recipient",
    fields: [
      {
        name: "cashtag",
        label: "$Cashtag",
        type: "text",
        required: true,
        placeholder: "$username",
        validation: z.string().startsWith("$", "Must start with $").min(2, "Invalid cashtag"),
      },
    ],
  },

  venmo: {
    id: "venmo",
    displayName: "Venmo",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.username || details.venmoUsername || "Venmo Recipient",
    fields: [
      {
        name: "username",
        label: "Venmo Username",
        type: "text",
        required: true,
        placeholder: "@username",
        validation: z.string().min(2, "Username is required"),
      },
      {
        name: "phone",
        label: "Phone Number (Optional)",
        type: "tel",
        required: false,
        placeholder: "+1 555 123 4567",
        validation: z.string().optional().or(z.literal("")),
      },
    ],
  },

  internal: {
    id: "internal",
    displayName: "Heritage Internal Customer",
    currency: "USD",
    getDisplayAccount: (details) => `Account ••••${(details.accountNumber || details.toAccountNumber || "").slice(-4)}`,
    fields: [
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "e.g. 1000123456",
        validation: z.string().min(6, "Valid account number required").max(17).regex(/^\d+$/, "Digits only"),
      },
    ],
  },

  us_bank: {
    id: "us_bank",
    displayName: "US Bank Transfer",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => `Account ${details.accountNumber}`,
    fields: [
      {
        name: "routingNumber",
        label: "Routing Number (ABA)",
        type: "text",
        required: true,
        placeholder: "9-digit ABA routing number",
        helpText: "Must be a valid 9-digit ABA routing number.",
        validation: z.string().length(9).regex(/^\d+$/, "Must be exactly 9 digits"),
      },
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "Enter account number",
        validation: z.string().min(4).max(17).regex(/^\d+$/, "Account number must contain only digits"),
      },
      {
        name: "accountType",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { label: "Checking", value: "checking" },
          { label: "Savings", value: "savings" },
        ],
        validation: z.enum(["checking", "savings"]),
      },
    ],
  },

  uk_bank: {
    id: "uk_bank",
    displayName: "UK Bank Transfer",
    region: "UK",
    currency: "GBP",
    getDisplayAccount: (details) => `Account ${details.accountNumber}`,
    fields: [
      {
        name: "sortCode",
        label: "Sort Code",
        type: "text",
        required: true,
        placeholder: "00-00-00",
        helpText: "6-digit UK sort code",
        validation: z.string().regex(/^(\d{2}-?){2}\d{2}$/, "Must be a valid 6-digit sort code"),
      },
      {
        name: "accountNumber",
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "8-digit account number",
        validation: z.string().length(8).regex(/^\d+$/, "Must be exactly 8 digits"),
      },
    ],
  },
};

/**
 * Returns the appropriate BeneficiaryRail definition for a given transfer method or variant.
 */
export function getRailForMethod(methodId: string): BeneficiaryRail {
  switch (methodId) {
    case "wire_domestic":
      return beneficiaryRails.wire_domestic;
    case "ach":
      return beneficiaryRails.ach;
    case "fednow":
      return beneficiaryRails.fednow;
    case "wire_international":
    case "swift":
      return beneficiaryRails.wire_international;
    case "crypto":
    case "wallet":
    case "usdt":
    case "usdc":
      return beneficiaryRails.crypto;
    case "zelle":
      return beneficiaryRails.zelle;
    case "cashapp":
      return beneficiaryRails.cashapp;
    case "venmo":
      return beneficiaryRails.venmo;
    case "internal":
    case "other":
      return beneficiaryRails.internal;
    default:
      return beneficiaryRails[methodId] || beneficiaryRails.wire_domestic;
  }
}

/**
 * Checks whether a saved beneficiary's rail matches the active transfer method.
 */
export function matchesTransferMethod(beneficiaryRail: string, methodId: string, isInternal = false): boolean {
  if (methodId === "internal" || methodId === "other") {
    return isInternal || beneficiaryRail === "internal";
  }
  if (methodId === "wire_domestic") {
    return beneficiaryRail === "wire_domestic" || (beneficiaryRail === "us_bank" && !isInternal);
  }
  if (methodId === "ach") {
    return beneficiaryRail === "ach" || (beneficiaryRail === "us_bank" && !isInternal);
  }
  if (methodId === "fednow") {
    return beneficiaryRail === "fednow" || (beneficiaryRail === "us_bank" && !isInternal);
  }
  if (methodId === "wire_international") {
    return beneficiaryRail === "wire_international" || beneficiaryRail === "swift";
  }
  if (methodId === "crypto" || methodId === "wallet" || methodId === "usdt" || methodId === "usdc") {
    return beneficiaryRail === "crypto";
  }
  if (methodId === "zelle") {
    return beneficiaryRail === "zelle";
  }
  if (methodId === "cashapp") {
    return beneficiaryRail === "cashapp";
  }
  if (methodId === "venmo") {
    return beneficiaryRail === "venmo";
  }
  return beneficiaryRail === methodId;
}
