import { z } from "zod";

export type BeneficiaryFieldType = "text" | "email" | "tel" | "select" | "number";

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
  swift: {
    id: "swift",
    displayName: "International / SWIFT",
    getDisplayAccount: (details) => `IBAN ${details.iban}`,
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
      {
        name: "address",
        label: "Bank Address",
        type: "text",
        required: false,
        placeholder: "Optional",
        validation: z.string().optional(),
      },
    ],
  },
  zelle: {
    id: "zelle",
    displayName: "Zelle",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.email || details.phone || "Unknown Zelle",
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
      }
    ],
  },
  venmo: {
    id: "venmo",
    displayName: "Venmo",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.username || details.phone || details.email,
    fields: [
      {
        name: "username",
        label: "Venmo Username",
        type: "text",
        required: false,
        placeholder: "@username",
        validation: z.string().optional().or(z.literal("")),
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        required: false,
        placeholder: "+1 555 123 4567",
        validation: z.string().optional().or(z.literal("")),
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: false,
        placeholder: "name@example.com",
        validation: z.string().email().optional().or(z.literal("")),
      }
    ]
  },
  cashapp: {
    id: "cashapp",
    displayName: "Cash App",
    region: "US",
    currency: "USD",
    getDisplayAccount: (details) => details.cashtag || "Unknown $cashtag",
    fields: [
      {
        name: "cashtag",
        label: "$Cashtag",
        type: "text",
        required: true,
        placeholder: "$username",
        validation: z.string().startsWith("$", "Must start with $").min(2),
      }
    ]
  }
};
